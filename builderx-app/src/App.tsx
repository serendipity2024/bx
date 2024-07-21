import * as React from "react";
import {
  BuilderXComponent,
  action,
  designerAction,
  Alert,
  applyPatchInBuilderX,
  bxConstants,
  Session,
  Commands,
  addPostCommandActionCallback,
  Utils,
} from "@builderx-core/builderx";
import { FlutterCodeGen } from "@builderx-core/flutter-plugin";
import { v4 as uuidv4 } from "uuid";
import "@builderx-core/builderx/build/static/css/main.css";
const appENV = process.env.NODE_ENV;
const packageJSON = require("../package.json");
import * as Sentry from "@sentry/browser";
import { ReactCodeGen } from "@builderx-core/react-plugin";

import { ReactNativeCodeGen } from "@builderx-core/react-native-plugin";

import * as constants from "./constants";
console.log(constants.SENTRY_URL);
import { loadFonts } from "./loadFonts";
import jsCookie from "js-cookie";
import socketIOClient from "socket.io-client";
import { diff } from "deep-diff";
import { apiSdk } from "@builderx-core/api-sdk";
import { find, findIndex } from "lodash";

loadFonts();

// console.log(, "hello here");
// import "./test.css";
class App extends React.Component {
  plugins: Array<any> = [];
  tempPatches: Array<any> = [];
  patchPacketBatch: Array<any> = [];
  reconnecting: boolean = false;
  // session: any;
  socket: SocketIOClient.Socket;
  constructor(props: any) {
    super(props);
    apiSdk.init({
      env: "local",
      accessToken: jsCookie.get("builderx-auth-token"),
      baseUrl: constants.BACKEND_API_URL,
      googleFontsUrl: "https://www.googleapis.com/webfonts/v1/webfonts?key=",
    });

    const reactNativePlugin = new ReactNativeCodeGen();
    const reactPlugin = new ReactCodeGen();

    this.plugins.push(reactNativePlugin);
    this.plugins.push(reactPlugin);
    if (constants.APP_ENVIRONMENT !== "cloud") {
      this.plugins.push(new FlutterCodeGen());
    }

    if (appENV !== "development") {
      Sentry.init({
        dsn: constants.SENTRY_URL,
        environment: appENV,
        release: packageJSON.version,
      });
    }
  }

  emitSelectLayerEvent = (session: Session, selectedLayers: any) => {
    selectedLayers =
      selectedLayers[0] && selectedLayers[0].layers
        ? selectedLayers[0].layers
        : selectedLayers;
    let selectedLayerIds = selectedLayers.map((layer: any) => {
      return layer.getFullPath();
    });
    if (selectedLayers[0] !== session.currentRootLayer) {
      if (this.socket && session.isPluginLoaded("OnlineUsers")) {
        this.socket.emit("onlineUsers.setSelectedLayers", {
          userId: session.userId,
          connectionId: session.connectionId,
          currentStageId: session.currentStage.id,
          selectedLayers: selectedLayerIds,
        });
      }
    }
  };

  render() {
    return (
      <div>
        <BuilderXComponent
          apiSdk={apiSdk}
          env={{ ...constants }}
          plugins={this.plugins}
          onCanvasMouseMove={(session: Session, e: any) => {
            //
            if (this.socket) {
              this.socket.emit("onlineUsers.setCursor", {
                userId: session.userId,
                connectionId: session.connectionId,
                position: e.payload.position,
                currentStageId: session.currentStage.id,
              });
            }
          }} // getSession={(session) => (this.session = session)}
          onLayerDrag={(session: Session, e: any) => {
            if (this.socket) {
              this.emitSelectLayerEvent(session, [e.payload.domainLayer]);
            }
          }}
          onReady={async (session: Session) => {
            this.socket = socketIOClient(constants.SOCKET_SERVER_URL, {
              timeout: 100000,
              query: {
                token: jsCookie.get("builderx-auth-token"),
                projectId: session.project.getProjectId(),
                connectionId: session.connectionId,
                currentStageId: session.currentStage.id,
              },
              path: "/socket-server/socket.io",
            });

            this.socket.on("disconnect", (reason: any) => {
              console.log("the socket will automatically try to reconnect");
              this.reconnecting = true;
              // session.commandManager.executeAndSkip(
              //   new Commands.SetModalRoute(session, "socketDisconnect")
              // );
            });

            this.socket.on("reconnect", (data: any) => {
              console.log(data, "reconnect***");
              // session.commandManager.executeAndSkip(
              //   new Commands.SetModalRoute(session, "")
              // );
            });

            this.socket.on("onlineUsers.add", (data: any) => {
              console.log(data, "data here");
              session.executeFunction("OnlineUsers.add", { ...data });

              session.executeFunction(
                "OnlineUsers.setSelectedLayers",
                data.userId,
                data.connectionId,
                data.currentStageId,
                data.selectedLayers
              );
            });

            this.socket.on("onlineUsers.remove", (data: any) => {
              session.executeFunction("OnlineUsers.remove", data);
            });

            this.socket.on("onlineUsers.setCursor", (data: any) => {
              session.executeFunction(
                "OnlineUsers.setCursor",
                data.userId,
                data.connectionId,
                data.position,
                data.currentStageId,
                data.selectedLayers
              );
            });

            this.socket.on("onlineUsers.setSelectedLayers", (data: any) => {
              if (session.isPluginLoaded("OnlineUsers")) {
                session.executeFunction(
                  "OnlineUsers.setSelectedLayers",
                  data.userId,
                  data.connectionId,
                  data.currentStageId,
                  data.selectedLayers
                );
              }
            });

            this.socket.on("deselectAllLayers", (data: any) => {
              session.commandManager.executeAndSkip(
                new Commands.DeselectAllLayers(session)
              );
            });

            this.socket.on("loaded", () => {
              this.reconnecting = false; // "loaded" event received after reconnection means
              // we can start accepting patches
              session.startRecordingPatches();
              if (session.domain.files.size < 1) {
                session.addNewArtboard();
                // session.stopRecordingPatches();
              }

              // session.startRecordingPatches();
              session.loadProject(true);
            });

            this.socket.on("error", (err: any) => {
              console.error(err);
              if (err.includes && err.includes("Authentication error")) {
                Alert("Authentication Failed!", "Please login again!", true)
                  .then(() => {
                    jsCookie.remove("builderx-auth-token");
                    window.location.replace(constants.WEBSITE_URL);
                    return;
                  })
                  .catch(() => {
                    //
                  });
              } else if (err.includes && err.includes("404")) {
                Alert(
                  "Invalid Project!",
                  "Either the project does not exist, or you don't have the correct access!",
                  true
                )
                  .then(() => {
                    window.location.replace(constants.WEBSITE_URL);
                    return;
                  })
                  .catch(() => {
                    //
                  });
              }
            });

            console.log("*** here in connectSocket");
            this.socket.on("patchBatch", (patchBatch: any) => {
              designerAction(() => {
                action(() => {
                  if (this.reconnecting) {
                    return;
                  }
                  // console.log("patch received", patch);
                  // console.log("patch batch received **(((", patchBatch);
                  // console.log("tempPatches **(((", [...this.tempPatches]);

                  if (
                    patchBatch.op === "snapshot" &&
                    process.env.NODE_ENV !== "production"
                  ) {
                    // console.log(
                    //   diff(session.domain.toJS(), patchBatch.value),
                    //   "snapshot dif*******"
                    // );
                  } else if (session) {
                    if (patchBatch.clientId === this.socket.id) {
                      // self patch
                      const patchIndexInTemp = findIndex(
                        this.tempPatches,
                        (tp) => tp.batchId === patchBatch.batchId
                      );
                      if (patchIndexInTemp !== -1) {
                        console.log(
                          "Self patch received, splicing ***(((",
                          this.tempPatches[patchIndexInTemp]
                        );
                        this.tempPatches.splice(patchIndexInTemp, 1);
                      } else {
                        // designerAction(() => {
                        //   action(() => {
                        console.log(
                          "Self patch received, applying ***(((",
                          patchBatch.patches
                        );
                        patchBatch.patches.forEach((patch: any) => {
                          applyPatchInBuilderX(session, patch, session);
                          //   });
                          // });
                        });
                      }
                    } else {
                      console.log("Received nonself patch ***(((");
                      for (let i = this.tempPatches.length - 1; i >= 0; i--) {
                        // designerAction(() => {
                        //   action(() => {
                        console.log(
                          "Applying reverse ***(((",
                          this.tempPatches[i].patches
                        );
                        for (
                          let k = this.tempPatches[i].patches.length - 1;
                          k >= 0;
                          k--
                        ) {
                          const patch = this.tempPatches[i].patches[k];

                          if (patch.reverse) {
                            applyPatchInBuilderX(
                              session,
                              patch.reverse,
                              session
                            );
                          }
                        }
                        // reverse([...this.tempPatches[i].patches]).forEach(
                        //   (patch: any) => {

                        //   }
                        // );
                        //   });
                        // });
                      }
                      console.log("Emptying tempPatches ***(((");
                      this.tempPatches = [];
                      // designerAction(() => {
                      //   action(() => {
                      console.log(
                        "Applying received patches ***(((",
                        patchBatch.patches
                      );
                      patchBatch.patches.forEach((patch: any) => {
                        applyPatchInBuilderX(session, patch, session);
                      });
                      //   });
                      // });
                    }
                  }
                });
              });
            });

            addPostCommandActionCallback(() => {
              if (this.patchPacketBatch.length < 1) {
                return;
              }
              const batchId = uuidv4();

              const tempPatches = this.patchPacketBatch
                .filter((p) => p.type === "persist")
                .map((p) => ({ forward: p.patch, reverse: p.reversePatch }));

              if (tempPatches.length > 0) {
                this.tempPatches.push({
                  batchId: batchId,
                  patches: tempPatches,
                });
                console.log("Update temp patches ***(((", [
                  ...this.tempPatches,
                ]);
              }
              // this.tempPatches.push({
              //   forward: patch,
              //   reverse: reversePatch
              // });
              const patchesToBeEmitted = this.patchPacketBatch.map((p) => ({
                type: p.type,
                patch: p.patch,
              }));
              // setTimeout(() => {
              console.log(
                "Emitting patch batch ***(((",
                patchesToBeEmitted,
                "with batchId ",
                batchId
              );
              this.socket.emit("patchPacketBatch", {
                batchId: batchId,
                patches: patchesToBeEmitted,
              });
              // }, 5000);
              this.patchPacketBatch = [];
            });
          }}
          onPatch={(object: any, patch: any, session: any) => {
            const patchInfo = applyPatchInBuilderX(object, patch, session);
            let returnVal: any, reversePatch: any;
            if (patchInfo) {
              ({ returnVal, reversePatch } = patchInfo);
            }

            if (
              this.socket &&
              Utils.isPersistentPatch(patch) &&
              session.recordPatches
            ) {
              console.log("Applied persistent patch ***(((", patch);
              if (
                session.currentStage.dragging ||
                patch.path.endsWith("ui/resizingType")
              ) {
                patch.patchId = this.socket.id + uuidv4();
                // this.tempPatches.push({
                //   forward: patch,
                //   reverse: reversePatch
                // });
                // setTimeout(() => {
                this.patchPacketBatch.push({
                  type: "noPersist",
                  patch,
                  reversePatch,
                });
                // this.socket.emit("patchPacket", { type: "noPersist", patch });
                // }, 5000);
              } else {
                patch.patchId = this.socket.id + uuidv4();
                // this.tempPatches.push({
                //   forward: patch,
                //   reverse: reversePatch
                // });
                // setTimeout(() => {
                this.patchPacketBatch.push({
                  type: "persist",
                  patch,
                  reversePatch,
                });
                // this.socket.emit("patchPacket", { type: "persist", patch });
                // }, 5000);
              }
            } else if (this.socket && patch.op === "crash") {
              this.socket.emit("patchPacketBatch", {
                patches: [{ type: "crash", patch }],
              });
            }

            if (this.socket && patch.path === "/selectedLayers") {
              //
              this.emitSelectLayerEvent(session, patch.value);
            }

            return returnVal;
          }}
        />
      </div>
    );
  }
}
export default App;
