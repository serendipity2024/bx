const splitPatchPath = require("./splitPatchPath");
const get = require("lodash.get");

module.exports = function getResolvedPatchAfterValidation(patch, session) {
  if (patch.layerUuid) {
    const { layerPath } = splitPatchPath(patch);

    const splitLayerPath = layerPath.split(":");
    const filePath = splitLayerPath[0];
    const partialLayerPath = splitLayerPath[1];
    const file = session.domain.files.get(filePath);
    const layer = get(file, partialLayerPath);

    if (layer && layer.id === patch.layerUuid) {
      return patch;
    } else {
      const found = findLayerIdInFile(file, patch.layerUuid);
      const foundLayer = found.layer;
      const foundPath = found.path;

      if (foundLayer) {
        const originalLayerPathInPatch =
          filePath + ":::/" + partialLayerPath.replace(/\./g, "/");
        const newPath = patch.path.replace(originalLayerPathInPatch, foundPath);
        return { ...patch, path: newPath };
      }
      return null;
    }
  }

  return patch;
};

function findLayerIdInFile(file, layerId) {
  let layerMatch = null;
  let layerPath = "";
  traverseLayers(
    file.layer,
    (l, lPath) => {
      if (l.id === layerId) {
        layerMatch = l;
        layerPath = lPath;
        return false;
      }
    },
    file.path + ":::/layer"
  );

  return { layer: layerMatch, path: layerPath };
}

function traverseLayers(layer, cb, parentPath) {
  const returnVal = cb(layer, parentPath);

  // stop further traversal if found
  if (returnVal === false) {
    return;
  }

  if (Array.isArray(layer.children)) {
    layer.children.forEach((child, index) => {
      traverseLayers(child, cb, parentPath + "/children/" + index);
    });
  }
}
