module.exports = function splitPatchPath(operation) {
  let filePath = "",
    layerPath = "",
    stageId = "",
    expressionPath = "",
    scopeVariablesPath = "",
    expressionListPath = "",
    propsStylePath = "";
  const splitPath = operation.path.split(":::");
  if (operation.path.startsWith("/domain/files")) {
    filePath = splitPath[1];
    if (splitPath[2] && splitPath[2].indexOf("/props/") === 0) {
      propsStylePath = splitPath[2];
      // layerPath = filePath;
    } else if (splitPath[2] && splitPath[2] === "/layer") {
      layerPath = filePath + ":layer";
    } else if (splitPath[2] && splitPath[2].includes("/props/")) {
      const indexOfProps = splitPath[2].indexOf("/props/");
      propsStylePath = splitPath[2].slice(indexOfProps);
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfProps).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/selected")) {
      const indexOfSelected = splitPath[2].indexOf("/selected");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfSelected).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/hovered")) {
      const indexOfHovered = splitPath[2].indexOf("/hovered");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfHovered).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/locked")) {
      const indexOfLocked = splitPath[2].indexOf("/locked");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfLocked).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/hidden")) {
      const indexOfHidden = splitPath[2].indexOf("/hidden");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfHidden).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/collapsed")) {
      const indexOfCollapsed = splitPath[2].indexOf("/collapsed");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfCollapsed).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/aspectRatio")) {
      const indexOfAspectRatio = splitPath[2].indexOf("/aspectRatio");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfAspectRatio).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/value")) {
      const indexOfValue = splitPath[2].indexOf("/value");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfValue).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/isResizerVisible")) {
      const indexOfIsResizerVisible = splitPath[2].indexOf("/isResizerVisible");
      if (splitPath[2].indexOf("/isResizerVisible") !== 0) {
        layerPath =
          filePath +
          ":" +
          splitPath[2].slice(1, indexOfIsResizerVisible).replace(/\//g, ".");
      }
    } else if (splitPath[2] && splitPath[2].includes("/navigateTo")) {
      const indexOfNavigateTo = splitPath[2].indexOf("/navigateTo");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfNavigateTo).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/ui/resizingType")) {
      const indexOfResizingType = splitPath[2].indexOf("/ui/resizingType");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfResizingType).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/styleName")) {
      const indexOfStyleName = splitPath[2].indexOf("/styleName");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfStyleName).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/template")) {
      const indexOfTemplate = splitPath[2].indexOf("/template");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfTemplate).replace(/\//g, ".");
    } else if (splitPath[2] && splitPath[2].includes("/expressionList")) {
      layerPath = "";
      expressionListPath = "/expressionList";
    } else if (splitPath[2] && splitPath[2].includes("/expression")) {
      const indexOfExpression = splitPath[2].indexOf("/expression");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfExpression).replace(/\//g, ".");

      expressionPath = splitPath[2].slice(indexOfExpression);
    } else if (splitPath[2] && splitPath[2].includes("/isDirty")) {
      layerPath = "";
    } else if (splitPath[2] && splitPath[2].startsWith("/scopeVariables")) {
      layerPath = "";
    } else if (splitPath[2] && splitPath[2].startsWith("/formControls")) {
      layerPath = "";
    } else if (splitPath[2] && splitPath[2].includes("/scopeVariables")) {
      const indexOfScopeVariables = splitPath[2].indexOf("/scopeVariables");
      layerPath =
        filePath +
        ":" +
        splitPath[2].slice(1, indexOfScopeVariables).replace(/\//g, ".");

      scopeVariablesPath = splitPath[2].slice(indexOfScopeVariables);
    } else if (splitPath[2] && splitPath[2].includes("/statusBar")) {
      layerPath = "";
    } else if (splitPath[2] && !splitPath[2].includes("/props/")) {
      layerPath = filePath + ":" + splitPath[2].slice(1).replace(/\//g, ".");
    }
  } else if (
    operation.path.includes("/stages:::") ||
    operation.path.includes("/thumbnailStages:::")
  ) {
    stageId = splitPath[1];
  }
  return {
    filePath,
    propsStylePath,
    layerPath,
    stageId,
    expressionPath,
    expressionListPath,
    scopeVariablesPath,
  };
};
