const get = require("lodash.get");

module.exports = function resolveMapsForJsonPatch(operation, object) {
  const pathChunks = operation.path.split(":::");
  // if(last(pathChunks) === "") {
  //   pathChunks.splice(pathChunks.length - 1, 1);
  // }
  let modifiedPath = operation.path;
  let resolvedObject = object;
  if (pathChunks.length >= 3) {
    for (
      let index = 1;
      index < pathChunks.length && pathChunks.length - index >= 2;
      index = index + 2
    ) {
      const chunk = pathChunks[index];
      // const map:any = get(modifiedOperationObject, chunk.replace(/\//g, ".").slice(1));
      resolvedObject = get(
        resolvedObject,
        pathChunks[index - 1].replace(/\//g, ".").slice(1)
      );
      if (resolvedObject instanceof Map) {
        resolvedObject = resolvedObject.get(pathChunks[index]);
        modifiedPath = pathChunks.slice(index + 1).join(":::");
      }
    }
  }
  return { resolvedObject, modifiedPath };
};
