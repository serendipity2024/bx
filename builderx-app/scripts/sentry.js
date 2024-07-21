var shell = require("./shellHelper");
var chalk = require("chalk");
const fs = require("fs");
const homedir = require("os").homedir();
const packageJson = require("../package.json");
var path = require("path");
console.log("************************** here");
const env = process.env.NODE_ENV;
// const project = env === "production" ? "builderx-v2" : "builderx-v2-nightly";
const project = "builderx-v2";
const jsPath = path.resolve(__dirname, "..", "build/static/js");
const cssPath = path.resolve(__dirname, "..", "build/static/css");
const buildPath = path.resolve(__dirname, "..", "build");

const sentryRc = `
  [auth]
  token=686a3511a2224a79ad5ba2eb65e14484ae7f88587596496b970e004e03fc9b1a`;
fs.writeFileSync(path.join(homedir, ".sentryclirc"), sentryRc);

const createReleaseCmd = `sentry-cli releases -o geekyants -p ${project} new ${packageJson.version}`;

const uploadSourceMapsCmd = `sentry-cli releases -o geekyants -p ${project} files ${packageJson.version} upload-sourcemaps --rewrite  --url-prefix ~/build/static/js/  ${jsPath}`;

shell.series([createReleaseCmd, uploadSourceMapsCmd], function(err) {
  if (err) {
    console.log(chalk.red("Error", err));
  } else {
    deleteMapfile(jsPath);
    deleteMapfile(cssPath);
    deleteMapfile(buildPath);
  }
  process.exit(0);
});

function deleteMapfile(jsMapPath) {
  if (!fs.existsSync(jsMapPath)) {
    return;
  }

  var files = fs.readdirSync(jsMapPath);
  files.forEach((file) => {
    const filePath = path.join(jsMapPath, file);
    const extension = path.extname(filePath);
    if (extension == ".map") {
      console.log("Deleting: ", chalk.blue(filePath));
      fs.unlinkSync(filePath);
    }
  });
  // return true;
}
