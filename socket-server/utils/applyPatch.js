const resolveMapsForJsonPatch = require("./resolveMapsForJsonPatch");
const get = require("lodash.get");
const applyOperation = require("fast-json-patch").applyOperation;

module.exports = function applyPatch(object, patch) {
  let resolvedObject = object,
    modifiedPath = patch.path,
    modifiedValue = patch.value;

  ({ resolvedObject, modifiedPath } = resolveMapsForJsonPatch(patch, object));
  console.log("applying patch **", patch);

  if (modifiedPath.startsWith("/stages")) {
    return;
  }
  if (modifiedPath.includes("/formControls/-")) {
    return;
  }

  if (patch.value && patch.value.type === "class") {
    modifiedValue = patch.value.value;

    if (patch.value.className === "Map") {
      modifiedValue = new Map();
    }
  }

  if (modifiedPath.includes(":::")) {
    const pathChunks = modifiedPath.split(":::");

    if (pathChunks.length !== 2) {
      throw new Error("Something went wrong while parsing json path");
    }

    const map = get(
      resolvedObject,
      // convert path /abc/xyz/pqr to lodash get compliant abc.xyz.pqr
      pathChunks[0].replace(/\//g, ".").slice(1)
    );

    // console.log(
    //   // resolvedObject,
    //   // map,
    //   // pathChunks[0].replace(/\//g, ".").slice(1),
    //   // patch.op,
    //   // pathChunks[0],
    //   // pathChunks[1],
    //   modifiedPath,
    //   // map,
    //   "*********"
    // );

    if (patch.op === "add") {
      if (patch.path.includes("domain/file")) {
        if (modifiedValue.type !== "literal") {
          // modifiedValue.props = {
          //   style: {},
          // };
          // Don't mutate
          modifiedValue = {
            ...modifiedValue,
            props: {
              style: {},
            },
          };
        }
      }
      map.set(pathChunks[1], modifiedValue);
    } else if (patch.op === "remove") {
      map.delete(pathChunks[1]);
    } else if (patch.op === "move" && patch.from) {
      const fromPathChunks = patch.from.split(":::");
      const object = map.get(fromPathChunks[1]);
      map.delete(fromPathChunks[1]);
      map.set(pathChunks[1], object);
    }
  } else {
    if (patch.op === "add" && patch.path.includes("domain/file")) {
      if (modifiedValue.type !== "literal") {
        //   modifiedValue.props = {
        //     style: {},
        //   };
        //   modifiedValue.ui = {};

        // Don't mutate
        modifiedValue = {
          ...modifiedValue,
          props: {
            style: {},
          },
          ui: {},
        };
      }
    }
    applyOperation(resolvedObject, {
      ...patch,
      value: modifiedValue,
      path: modifiedPath,
    });
  }
};
