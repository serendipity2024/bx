require("dotenv").config();
const URL = require("url").URL;
const app = require("express")();
var cors = require("cors");
const find = require("lodash.find");
const uniqby = require("lodash.uniqby");
const get = require("lodash.get");
const semver = require("semver");
const uuid = require("uuid").v4;

const projectObjectsMap = new Map();

app.use(cors());

//app.use(
//  cors({
//    origin: ["*", "http://localhost:3000", "https://qa-env.builderx.io"],
//    credentials: true,
//  })
//);
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  pingTimeout: 60000,
  path: "/socket-server/socket.io",
});

const randomString = require("./utils/randomString");
const getPatchesFromFilesJSON = require("./getPatchesFromFilesJSON");
const asyncForEach = require("./utils/asyncForEach");
const findHighestOffset = require("./utils/findHighestOffset");
const getResolvedPatchAfterValidation = require("./utils/getResolvedPatchAfterValidation");
const Auth = require("./Auth");
const User = require("./User");

const applyPatch = require("./utils/applyPatch");
const categorizeFiles = require("./utils/categorizeFiles");

const executeQuery = require("./queryRunner");

const { Sequelize } = require("sequelize");
const sequelizeModels = require("./sequelizeModels");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  }
);

const { Patch } = sequelizeModels(sequelize);

(async function () {
  const onlineUsersMap = new Map();
  // console.log(URL);

  app.get("/test", (req, res) => {
    res.send("Hello!");
  });

  //io.origins(["*", "http://localhost:3000", "https://qa-env.builderx.io"]);

  io.on("connection", async (socket) => {
    try {
      if (socket.handshake.query && socket.handshake.query.token) {
        const auth = new Auth(socket.handshake.query.token);

        const userDetails = await auth.fetchUserDetails();
        socket.user = userDetails ? userDetails.user : {};

        const projectId = socket.handshake.query.projectId;

        const authenticated = await auth.checkAuth();
        const projectDetails = await auth.getProjectDetails(projectId);

        const isProjectPublic = find(
          projectDetails.project_shareability,
          (shareableData) => shareableData.type === "public"
        );

        if (authenticated && projectDetails) {
          if (!projectDetails.isEditable) {
            socket.readOnly = true;
          }
          await setupSocketConnection(socket, projectDetails, auth);
        } else if (!authenticated && isProjectPublic) {
          socket.readOnly = true;
          await setupSocketConnection(socket, projectDetails, auth);
        } else {
          socket.error("Authentication failed");
          socket.disconnect();
        }
      } else {
        socket.error("Authentication failed");
        socket.disconnect();
      }
    } catch (err) {
      socket.error(err.message);
      socket.disconnect();
    }
  });

  http.listen(3001, () => {
    console.log("listening on *:3001");
  });

  function getOnlineUsers(projectId) {
    let onlineUsers = onlineUsersMap.get(projectId);
    if (!onlineUsers) {
      onlineUsers = [];
      onlineUsersMap.set(projectId, onlineUsers);
    }
    return onlineUsers;
  }
  async function setupOnlineUsers(socket, projectId) {
    let onlineUsers = getOnlineUsers(projectId);
    let alreadyOnline = false;
    connectionId = socket.handshake.query.connectionId;

    const userObj = {
      id: socket.user.id,
      name: socket.user.name,
      email: socket.user.email,
      currentStageId: socket.handshake.query.currentStageId,
      connectionId,
      socket,
    };

    //check if user is already online

    const findIndex = onlineUsers.findIndex((onlineUser) => {
      return onlineUser.connectionId === connectionId;
    });
    if (findIndex > -1) {
      alreadyOnline = true;
    }
    onlineUsers.unshift(userObj);
    // console.log(socket.user, "hello here");

    // emit existing online users
    // var uniqueOnlineUsers = uniqby(onlineUsers, function(e) {
    //   return e.id;
    // });

    onlineUsers.forEach((onlineUser) => {
      socket.emit("onlineUsers.add", {
        id: onlineUser.id,
        name: onlineUser.name,
        email: onlineUser.email,
        connectionId: onlineUser.connectionId,
        currentStageId: onlineUser.currentStageId,
        selectedLayers: onlineUser.selectedLayers,
      });
    });

    if (!alreadyOnline) {
      socket.broadcast.to(projectId).emit("onlineUsers.add", {
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        currentStageId: userObj.currentStageId,
        connectionId: userObj.connectionId,
      });
    }
    onlineUsersMap.set(projectId, onlineUsers);

    // on disconnect
    socket.on("disconnect", () => {
      const onlineUsers = getOnlineUsers(projectId);

      // remove user from online user array
      connectionId = socket.handshake.query.connectionId;

      const userObj = {
        ...socket.user,
        connectionId,
      };

      let findIndex = onlineUsers.findIndex((onlineUser) => {
        return onlineUser.connectionId === connectionId;
      });

      // console.log("findIndex AAAAAAAAAAA", "..", findIndex);
      if (findIndex > -1) {
        onlineUsers.splice(findIndex, 1);
      }
      // // check if user is still online is any other tab
      // findIndex = onlineUsers.findIndex((onlineUser) => {
      //   return onlineUser.connectionId === connectionId;
      // });
      // if (findIndex === -1) {
      socket.broadcast.to(projectId).emit("onlineUsers.remove", userObj);
      // }

      onlineUsersMap.set(projectId, onlineUsers);
    });

    socket.on("onlineUsers.setCursor", (data) => {
      const onlineUsers = getOnlineUsers(projectId);

      // let findUser = onlineUsers.find((onlineUser) => {
      //   return socket.handshake.query.connectionId === onlineUser.connectionId;
      // });
      // if (findUser) {
      //   findUser.cursor = { ...data };
      // }

      onlineUsers.forEach((onlineUser) => {
        if (onlineUser.connectionId === socket.handshake.query.connectionId) {
          onlineUser.last_pinged = Date.now();
          onlineUser.currentStageId = data.currentStageId;
        }

        // timeout for user activity for 1 min
        if (Date.now() - onlineUser.last_pinged > 60 * 1000) {
          socket.emit("onlineUsers.setSelectedLayers", {
            userId: onlineUser.id,
            connectionId: onlineUser.connectionId,
            currentStageId: onlineUser.currentStageId,
            selectedLayers: [],
          });

          // hide cursor
          socket.emit("onlineUsers.setCursor", {
            userId: onlineUser.id,
            connectionId: onlineUser.connectionId,
            currentStageId: onlineUser.currentStageId,
            position: {
              x: -Number.MAX_SAFE_INTEGER,
              y: -Number.MAX_SAFE_INTEGER,
            },
          });

          onlineUser.socket.emit("deselectAllLayers");
          // onlineUser.socket.emit("onlineUsers.setCursor", {
          //   userId: onlineUser.userId,
          //   connectionId: onlineUser.connectionId,
          //   position: onlineUser.position,
          //   currentStageId: onlineUser.currentStageId,
          // });
        }
      });

      socket.broadcast.to(projectId).emit("onlineUsers.setCursor", data);
    });

    socket.on("onlineUsers.setSelectedLayers", (data) => {
      const onlineUsers = getOnlineUsers(projectId);
      let findUser = onlineUsers.find((onlineUser) => {
        return socket.handshake.query.connectionId === onlineUser.connectionId;
      });

      if (findUser) {
        findUser.selectedLayers = data.selectedLayers;
        findUser.last_pinged = Date.now();
        findUser.currentStageId = data.currentStageId;
      }

      // console.log("##################", findUser, data, onlineUsers);
      socket.broadcast
        .to(projectId)
        .emit("onlineUsers.setSelectedLayers", data);
    });
  }

  async function setupSocketConnection(socket, projectDetails, auth) {
    try {
      const projectId = socket.handshake.query.projectId;

      if (!projectObjectsMap.get(projectId)) {
        projectObjectsMap.set(projectId, {
          session: {
            domain: { files: new Map() },
          },
          loaded: false,
        });
      }
      // console.log("a user connected", projectId, typeof projectId);
      socket.join(projectId);

      // setupOnlineUsers(socket, projectId);

      let oldProject = true;
      if (
        projectDetails.version &&
        semver.gte(projectDetails.version, "2.0.0")
      ) {
        oldProject = false;
      }
      if (oldProject) {
        const responseFilesJSON = await auth.fetchProjectFiles(projectId);

        const normalizedFilesJSON = responseFilesJSON.map((file) => {
          return {
            ...JSON.parse(file.content),
            dbFileId: file.id,
          };
        });
        const filesJSON = categorizeFiles(normalizedFilesJSON);

        const artboardPatches = getPatchesFromFilesJSON(filesJSON.artboards);
        const symbolPatches = getPatchesFromFilesJSON(filesJSON.symbols);

        // Symbols should be added before artboards

        executeQuery(
          Patch,
          {
            patch_batch: JSON.stringify({
              patches: [...symbolPatches, ...artboardPatches],
            }),
            projectId,
          },
          (err, instance) => {
            if (err) {
              console.error(err);
              socket.error("Failed to save patch");
            }
          }
        );

        await auth.updateProject(projectId, "version", "2.0.0");
      }

      if (!socket.readOnly) {
        // socket.on("patchPacket", async (patchPacket) => {
        //   try {
        //     // patchManager.store(projectId, patch);

        //     const projectObject = projectObjectsMap.get(projectId);
        //     if (patchPacket.patch) {
        //       console.log("received patch original", patchPacket.patch);
        //       const originalPatch = patchPacket.patch;
        //       patchPacket.patch = getResolvedPatchAfterValidation(
        //         patchPacket.patch,
        //         projectObject.session
        //       );
        //       console.log("received patch", patchPacket.patch);
        //       if (!patchPacket.patch) {
        //         console.error("** * *  layer not found  * * **", originalPatch);
        //         return;
        //       }
        //       applyPatch(projectObject.session, patchPacket.patch);
        //     }
        //     if (patchPacket.type === "persist") {
        //       if (patchPacket.patch) {
        //         // patches can be skipped if conflict
        //         console.log(projectObject.session, "projectObject.session ***");

        //         executeQuery(Patch, {
        //           patch: JSON.stringify(patchPacket.patch),
        //           projectId,
        //         });
        //       }
        //     }
        //     // else {
        //     if (patchPacket.patch) {
        //       const socketIdsInRoom = Object.keys(
        //         get(io, `sockets.adapter.rooms.${projectId}.sockets`, {})
        //       );
        //       const socketsInRoom = socketIdsInRoom.map(
        //         (sId) => io.sockets.connected[sId]
        //       );

        //       socketsInRoom.forEach((socketInRoom) => {
        //         // Emit all patches to self and to others only if their project is loaded
        //         if (!socketInRoom) {
        //           return;
        //         }
        //         if (socketInRoom === socket || socketInRoom.projectLoaded) {
        //           if (
        //             // For noPersist patches, don't send the patch to sender
        //             (patchPacket.type === "noPersist" &&
        //               socketInRoom !== socket) ||
        //             // For persist patches, send to everyone including the sender
        //             patchPacket.type === "persist"
        //           ) {
        //             socketInRoom.emit("patch", {
        //               ...patchPacket.patch,
        //               clientId: socket.id,
        //             });
        //           }
        //         }
        //       });

        //       // io.in(projectId).emit("patch", {
        //       //   ...patchPacket.patch,
        //       //   clientId: socket.id,
        //       // });
        //     }
        //     // console.log("emitting patch", patchPacket.patch);
        //     // }
        //   } catch (err) {
        //     console.error("ERROR while processing patch", patchPacket, err);
        //   }
        // });
        socket.on("patchPacketBatch", (patchPacketBatch) => {
          onPatchPacketBatch(socket, patchPacketBatch, projectId);
        });
      }
      socket.on("disconnect", function () {
        // consumer.disconnect();
        // producer.disconnect();
      });

      try {
        const patchResults = await Patch.findAll({
          attributes: ["patch_batch"],
          where: {
            project_id: projectId,
          },
          order: [["id", "ASC"]],
        });

        const numberOfPatches = patchResults.length;

        if (numberOfPatches === 0) {
          setupOnlineUsers(socket, projectId);
          socket.emit("loaded", true);
          socket.projectLoaded = true;
        } else {
          const projectObject = projectObjectsMap.get(projectId);

          patchResults.forEach((patchResult) => {
            const parsedPatchBatch = JSON.parse(patchResult.patch_batch);

            // applyPatch(projectObject.session, parsedPatch);
            parsedPatchBatch.patches.forEach((patch) => {
              applyPatch(projectObject.session, patch);
            });
          });

          const filesJSON = categorizeFiles(projectObject.session.domain.files);

          const artboardPatches = getPatchesFromFilesJSON(filesJSON.artboards);
          const symbolPatches = getPatchesFromFilesJSON(filesJSON.symbols);

          // const patches = getPatchesFromFilesJSON(
          //   projectObject.session.domain.files
          // );

          socket.emit("patchBatch", {
            patches: [...symbolPatches, ...artboardPatches],
          });

          // symbolPatches.forEach((patch) => {
          //   socket.emit("patch", patch);
          // });
          // artboardPatches.forEach((patch) => {
          //   socket.emit("patch", patch);
          // });

          setupOnlineUsers(socket, projectId);

          socket.emit("loaded", true);
          socket.projectLoaded = true;
          projectObject.loaded = true;
          console.log(projectObject.session, "projectObject.session");
        }
      } catch (err) {
        console.error(err);
        socket.error("Couldn't fetch patches");
      }
    } catch (err) {
      console.log("kafka error ()(&()*");
      console.error(err);
    }
  }
})();

function onPatchPacketBatch(socket, patchPacketBatch, projectId) {
  console.log("*");
  console.log("*");
  console.log("*");
  console.log("received patch batch", patchPacketBatch);
  console.log("*");
  console.log("*");
  console.log("*");
  const patchArrayToBeStored = [];
  const patchArrayToBeEmittedToSelf = [];
  const patchArrayToBeEmittedToOthers = [];

  patchPacketBatch.patches.forEach((patchPacket) => {
    const projectObject = projectObjectsMap.get(projectId);
    if (patchPacket.patch) {
      // console.log("received patch original", patchPacket.patch);
      const originalPatch = patchPacket.patch;
      patchPacket.patch = getResolvedPatchAfterValidation(
        patchPacket.patch,
        projectObject.session
      );
      if (!patchPacket.patch) {
        console.error("** * *  layer not found  * * **", originalPatch);
        return;
      }
      // patches can be skipped if conflict
      if (patchPacket.type !== "crash") {
        console.log("received patch", patchPacket.patch);
        try {
          applyPatch(projectObject.session, patchPacket.patch);
        } catch (err) {
          console.error(
            `Could not apply patch ${patchPacket.patch} to ${projectObject.session}`
          );
        }
      }
      // console.log(projectObject.session, "projectObject.session ***");

      if (patchPacket.type === "persist" || patchPacket.type === "crash") {
        patchArrayToBeStored.push(patchPacket.patch);
      }
      if (patchPacket.type === "noPersist") {
        patchArrayToBeEmittedToOthers.push(patchPacket.patch);
      }
      if (patchPacket.type === "persist") {
        patchArrayToBeEmittedToOthers.push(patchPacket.patch);
        patchArrayToBeEmittedToSelf.push(patchPacket.patch);
      }
    }
  });

  if (patchArrayToBeStored.length > 0) {
    executeQuery(
      Patch,
      {
        patch_batch: JSON.stringify({
          patches: patchArrayToBeStored,
        }),
        projectId,
      },
      (err, instance) => {
        if (err) {
          console.error(err);
          socket.error("Failed to save patch");
        }
      }
    );
  }

  const socketIdsInRoom = Object.keys(
    get(io, `sockets.adapter.rooms.${projectId}.sockets`, {})
  );
  const socketsInRoom = socketIdsInRoom.map((sId) => io.sockets.connected[sId]);

  socketsInRoom.forEach((socketInRoom) => {
    if (!socketInRoom) {
      return;
    }
    // Emit all patches to self and to others only if their project is loaded
    if (
      socketInRoom &&
      socketInRoom === socket &&
      patchArrayToBeEmittedToSelf.length > 0
    ) {
      socketInRoom.emit("patchBatch", {
        clientId: socket.id,
        batchId: patchPacketBatch.batchId,
        patches: patchArrayToBeEmittedToSelf,
      });
    } else if (
      socketInRoom.projectLoaded &&
      socketInRoom !== socket &&
      patchArrayToBeEmittedToOthers.length > 0
    ) {
      socketInRoom.emit("patchBatch", {
        clientId: socket.id,
        batchId: patchPacketBatch.batchId,
        patches: patchArrayToBeEmittedToOthers,
      });
    }
  });
}
