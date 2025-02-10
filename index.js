#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fetch_swagger_data_helpers_1 = require("./src/helpers/fetch-swagger-data.helpers");
const path = __importStar(require("path"));
const [controllerNameToGenerate] = process.argv.slice(3);
const command = `node ${__dirname}/src/fetch-swagger-data.script.js ${controllerNameToGenerate || ""}`.trim();
const configPath = path.join(process.cwd(), "openapi-v3-typescript-config.json");
const { output = "openapi-v3-typescript" } = (0, fetch_swagger_data_helpers_1.readConfig)(configPath);
const outputLocation = process.cwd() + "/" + output;
(0, child_process_1.exec)(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Script error output: ${stderr}`);
        return;
    }
    console.log(`TypeScript interfaces generated successfully and saved to ${outputLocation}${controllerNameToGenerate ? `/${controllerNameToGenerate}` : ""}`, stdout);
});
// npx tsc -p ./ --watch
