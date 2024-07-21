const forEach = require("lodash.foreach");
const LAYER_TYPES = [
  "view",
  "root",
  "file",
  "text",
  "image",
  "ellipse",
  "scrollView",
  "symbol",
  "textInput",
  "touchableOpacity",
  "path",
  "icon",
  "activityIndicator",
  "mapView",
  "slider",
  "switch",
];

module.exports = function getPatchesFromFileJSON(filesJSON) {
  const patches = [];

  filesJSON.forEach((fileJSON) => {
    patches.push({
      op: "add",
      path: `/domain/files:::${fileJSON.path}`,
      value: fileJSON,
    });
  });

  return patches;

  // const patches = [];

  // const parentPath = `/domain/files:::${filesJSON[0].path}`;

  // // traverseAndAddPatch(patches, fileJSON, parentPath);

  // // return patches;
  // return [
  //   {
  //     op: "add",
  //     path: "/domain/files:::/src/screens/Untitled1.js",
  //     value: filesJSON[0],
  //   },
  // ];
};

function traverseAndAddPatch(patches, json, path) {
  if (typeof json === "object" && !Array.isArray(json) && json) {
    if (json.type === "file") {
      patches.push({
        op: "add",
        path: path,
        value: {
          type: "class",
          className: "DomainFile",
          value: {
            path: json.path,
            version: json.version,
          },
        },
      });
    } else if (LAYER_TYPES.includes(json.type)) {
      patches.push({
        op: "add",
        path: path,
        value: {
          type: "class",
          className: "DomainLayer",
          value: {
            type: json.type,
            template: json.template,
            import: json.import,
            props: json.props,
          },
        },
      });
    } else if (path.endsWith("/props")) {
      // noop because Props are instantiated during layer creation
    } else if (json.type === "literal") {
      patches.push({
        op: "add",
        path: path,
        value: {
          type: "class",
          className: "LiteralNode",
          value: {
            type: json.type,
            value: json.value,
          },
        },
      });
    } else {
      patches.push({
        op: "replace",
        path: path,
        value: {},
      });
    }

    forEach(json, (value, key) => {
      let childPath;
      if (json.type === "file") {
        // Also handle other map types such as expressionList
        childPath = path + ":::/" + key;
      } else {
        childPath = path + "/" + key;
      }
      traverseAndAddPatch(patches, value, childPath);
    });
  } else if (Array.isArray(json)) {
    patches.push({
      op: "replace",
      path: path,
      value: [],
    });
    forEach(json, (value, index) => {
      // patches.push({
      //   op: "add",
      //   path: path + "/-",
      //   value: Array.isArray(value) ? [] : {},
      // });

      traverseAndAddPatch(patches, value, path + "/" + index);
    });
  } else {
    patches.push({
      op: "replace",
      path: path,
      value: json,
    });
  }
}
