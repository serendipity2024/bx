module.exports = function categorizeFiles(filesJSON) {
  let symbols = [];
  let artboards = [];
  let assets = [];
  filesJSON.forEach((fileJSON) => {
    if (
      fileJSON.path.indexOf("/symbols") !== -1 ||
      fileJSON.path.indexOf("/components") !== -1
    ) {
      symbols.push(fileJSON);
    } else if (fileJSON.path.indexOf("/screens") !== -1) {
      artboards.push(fileJSON);
    } else if (fileJSON.path.indexOf("/assets") !== -1) {
      assets.push(fileJSON);
    }
  });
  return { artboards, symbols, assets };
};
