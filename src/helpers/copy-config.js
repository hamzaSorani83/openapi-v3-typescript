const fs = require("fs");
const path = require("path");

const fullPath = path.dirname(require.main.filename);
const regexResp = /^(.*?)node_modules/.exec(fullPath);
const appRoot = regexResp ? regexResp[1] : fullPath;

const configFilePath = path.join(appRoot, "openapi-v3-typescript-config.json");

if (!fs.existsSync(configFilePath)) {
  fs.copyFileSync(
    "src/templates/openapi-v3-typescript-config.json.template",
    configFilePath
  );
}
