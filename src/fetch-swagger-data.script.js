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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apis_file_generator_1 = __importDefault(require("./generators/apis-file-generator"));
const routes_file_generator_1 = __importDefault(require("./generators/routes-file-generator"));
const queries_file_generator_1 = __importDefault(require("./generators/queries-file-generator"));
const interfaces_file_generator_1 = __importDefault(require("./generators/interfaces-file-generator"));
const fetch_swagger_data_helpers_1 = require("./helpers/fetch-swagger-data.helpers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const configPath = "openapi3-typescript-config.json";
const { input: inputSource, output: outputLocation = "openapi3-typescript", reactQuery = {
    enable: true,
    pageParam: "pageParam",
    getNextPageParam: `(lastPage, allPages) => {\n\t\t\tif (!lastPage?.hasNextPage) return undefined;\n\t\t\treturn allPages.length;\n\t}`,
}, getControllerNameFromRoute: getControllerFuncFromSettings = `(route) => route.split('/')[0]`, } = (0, fetch_swagger_data_helpers_1.readConfig)(configPath);
const withQueries = reactQuery.enable;
const reactQueryPageParam = reactQuery.pageParam;
const reactQueryGetNextPageParam = reactQuery?.getNextPageParam;
// ----------------------------------------------------------------------
async function fetchSwaggerJson() {
    if (inputSource.startsWith("http://") || inputSource.startsWith("https://")) {
        // Fetch data from the URL
        try {
            const response = await fetch(inputSource);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            return jsonData;
        }
        catch (error) {
            console.error("Error fetching data from URL:", error);
            throw error; // Rethrow or handle as needed
        }
    }
    else {
        // Read data from the JSON file
        const resolvedInputSource = path.resolve(inputSource);
        return new Promise((resolve, reject) => {
            fs.readFile(resolvedInputSource, "utf8", (err, data) => {
                if (err) {
                    console.error(`Error reading file from ${resolvedInputSource}:`, err);
                    return reject(err);
                }
                try {
                    const jsonData = JSON.parse(data);
                    return resolve(jsonData);
                }
                catch (parseError) {
                    console.error("Error parsing JSON data:", parseError);
                    return reject(parseError);
                }
            });
        });
    }
}
function generateController({ controllerName, routesInfo, }) {
    const controllerDir = `${outputLocation}/${(0, fetch_swagger_data_helpers_1.convertToKebabCase)(controllerName)}`;
    fs.mkdirSync(controllerDir, { recursive: true });
    (0, routes_file_generator_1.default)({
        controllerDir,
        controllerName,
        routes: routesInfo.map((r) => Object.keys(r)[0]),
        getControllerFuncFromSettings,
    });
    (0, apis_file_generator_1.default)({
        controllerDir,
        controllerName,
        routesInfo,
        getControllerFuncFromSettings,
    });
    if (withQueries === "true" || withQueries === true) {
        const getApis = routesInfo.filter((r) => Object.values(r)[0].methodType === "get");
        if (getApis.length) {
            (0, queries_file_generator_1.default)({
                controllerName,
                controllerDir,
                routesInfo: getApis,
                getControllerFuncFromSettings,
                reactQueryGetNextPageParam,
                reactQueryPageParam,
            });
        }
    }
}
async function main() {
    try {
        const openApiJson = await fetchSwaggerJson();
        const { paths } = openApiJson;
        const controllersRoutes = {};
        Object.entries(paths).forEach(([route, methods]) => {
            const controllerName = (0, fetch_swagger_data_helpers_1.getControllerNameFromRoute)(route, getControllerFuncFromSettings); // Use the first segment as controller name
            if (controllerName !== null) {
                const [methodType, data] = Object.entries(methods)[0];
                let hasBodyPayload = false;
                let hasResponse = false;
                let hasPageParamInQuery = !!data.parameters?.some((p) => p.in === "query" && p.name === reactQueryPageParam);
                let hasPageParamInBody = false;
                if (data.requestBody?.content) {
                    hasBodyPayload = !!Object.values(data.requestBody.content)[0]?.schema;
                    const requestProperty = Object.values(data.requestBody.content)[0]
                        ?.schema;
                    hasPageParamInBody =
                        (0, fetch_swagger_data_helpers_1.isObjectProperty)(requestProperty) &&
                            !!requestProperty.properties &&
                            Object.keys(requestProperty.properties).some((k) => k === reactQueryPageParam);
                }
                if (data.responses[200].content) {
                    hasResponse = !!Object.values(data.responses[200].content)[0]?.schema;
                }
                const routeInfo = {
                    hasBodyPayload,
                    hasResponse,
                    hasPathParams: !!data.parameters?.some((p) => p.in === "path"),
                    hasQueryParams: !!data.parameters?.some((p) => p.in === "query"),
                    hasPageParamInBody,
                    hasPageParamInQuery,
                    methodType: methodType,
                };
                if (controllersRoutes[controllerName]) {
                    controllersRoutes[controllerName].push({ [route]: routeInfo });
                }
                else {
                    controllersRoutes[controllerName] = [{ [route]: routeInfo }];
                }
            }
        });
        Object.entries(controllersRoutes).forEach(([controllerName, routesInfo]) => {
            generateController({
                controllerName,
                routesInfo,
            });
        });
        (0, interfaces_file_generator_1.default)(openApiJson, outputLocation, getControllerFuncFromSettings);
    }
    catch (error) {
        console.error("Error fetching or processing Swagger JSON:", error);
    }
}
main();
// ----------------------------------------------------------------------
// npx tsc src/scripts/fetch-swagger-data/fetch-swagger-data.script.ts --watch
// node src/scripts/fetch-swagger-data/fetch-swagger-data.script.js ./src/scripts/test.json ./src/scripts/test2 true
