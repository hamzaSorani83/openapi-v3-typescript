const fs = require("fs");

fs.writeFileSync("openapi3-typescript-config.json", "");

fs.copyFileSync(
  "src/templates/openapi3-typescript-config.json.template",
  "openapi3-typescript-config.json"
);
