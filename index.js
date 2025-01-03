"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fetch_swagger_data_helpers_1 = require("./src/helpers/fetch-swagger-data.helpers");
const configPath = "openapi3-typescript-config.json";
const { input, output = "openapi3-typescript", reactQuery = {
    enable: true,
    pageParam: "pageParam",
}, getControllerNameFromRoute: getControllerNameFromRouteFn, } = (0, fetch_swagger_data_helpers_1.readConfig)(configPath);
const enableReactQuery = reactQuery?.enable;
const pageParam = reactQuery?.pageParam;
const params = [input, output, enableReactQuery, pageParam];
const command = `node fetch-swagger-data/fetch-swagger-data.script.js ${params.join(" ")} "${getControllerNameFromRouteFn}"`;
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
