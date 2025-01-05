"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fetch_swagger_data_helpers_1 = require("./src/helpers/fetch-swagger-data.helpers");
const command = `node src/fetch-swagger-data.script.js`;
const configPath = "openapi3-typescript-config.json";
const { output = "openapi3-typescript" } = (0, fetch_swagger_data_helpers_1.readConfig)(configPath);
(0, child_process_1.exec)(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Script error output: ${stderr}`);
        return;
    }
    console.log(`TypeScript interfaces generated successfully and saved to ${output}`, stdout);
});
