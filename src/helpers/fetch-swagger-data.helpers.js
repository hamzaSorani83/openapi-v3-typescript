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
exports.writeConfig = exports.readConfig = exports.isArrayProperty = exports.isObjectProperty = exports.isRefProperty = exports.isNumberProperty = exports.isPrimitiveProperty = exports.getControllerNameFromRoute = exports.getApiNameFromRoute = exports.handleResponseInApi = exports.handleParameterInQueryAndBodyForApi = exports.handleParameterInPathForApi = exports.handleParameterInPath = exports.dtoNameToInterfaceName = exports.applyAnd = exports.applyOr = exports.nullable = exports.appendNewLine = exports.convertToKebabCase = exports.toCamelCase = exports.getFileDtos = void 0;
const fs = __importStar(require("fs"));
// ----------------------------------------------------------------------
const getFileDtos = (fileResult) => fileResult
    .split("\n")
    .map((el) => el.split(/[:=]/)[1])
    .filter(Boolean)
    .map((el) => el.split(";")[0].replaceAll("[]", "").replaceAll(" | null", "").trim())
    .filter((el) => el !== "{" && !["boolean", "number", "string"].includes(el));
exports.getFileDtos = getFileDtos;
const toCamelCase = (str) => str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/_./g, (match) => match[1].toUpperCase());
exports.toCamelCase = toCamelCase;
const convertToKebabCase = (input) => {
    const kebabCase = input
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)/g, "-$1")
        .toLowerCase();
    return (kebabCase.startsWith("-") ? kebabCase.slice(1) : kebabCase).replaceAll("--", "-");
};
exports.convertToKebabCase = convertToKebabCase;
const appendNewLine = (isPropertyOfArray) => isPropertyOfArray ? "" : ";\n";
exports.appendNewLine = appendNewLine;
const nullable = (property) => `${property.nullable ? " | null" : ""}`;
exports.nullable = nullable;
const applyOr = (array) => array.join(" | ");
exports.applyOr = applyOr;
const applyAnd = (array) => array.join(" & ");
exports.applyAnd = applyAnd;
const dtoNameToInterfaceName = (dtoName) => dtoName.replace(/[.`[\](),=+\s]/g, "");
exports.dtoNameToInterfaceName = dtoNameToInterfaceName;
const handleParameterInPath = (route) => {
    if (route.includes("{")) {
        return `(${route
            .match(/{[^}]*}/g)
            ?.map((el) => `${el}: string | number`)
            ?.join(`, `)
            .replaceAll("{", "")
            .replaceAll("}", "")}) => ${`\`${route.replaceAll("{", "${")}\``}`;
    }
    return `'${route}'`;
};
exports.handleParameterInPath = handleParameterInPath;
const handleParameterInPathForApi = (apiName, hasPathParams) => {
    if (hasPathParams) {
        return `${apiName}(...payload.pathParams)`;
    }
    return apiName;
};
exports.handleParameterInPathForApi = handleParameterInPathForApi;
const handleParameterInQueryAndBodyForApi = (hasQueryParams, hasBodyPayload, methodType) => {
    if (methodType === "post" || methodType === "put" || methodType === "patch") {
        if (hasQueryParams && hasBodyPayload) {
            return `payload.bodyPayload,\n\t\t{
      ...axiosConfig,
      params: {
        ...payload.queryParams,
        ...axiosConfig?.params,
      },
    }`;
        }
        if (hasQueryParams) {
            return `null,\n\t\t{
      ...axiosConfig,
      params: {
        ...payload.queryParams,
        ...axiosConfig?.params,
      },
    }`;
        }
        if (hasBodyPayload) {
            return `payload.bodyPayload,
    axiosConfig,`;
        }
    }
    if (hasQueryParams && hasBodyPayload) {
        return `{
      ...axiosConfig,
      params: {
        ...payload.queryParams,
        ...axiosConfig?.params,
      },
      data: {
        ...payload.bodyPayload,
        ...axiosConfig?.data,
      }
    }`;
    }
    if (hasQueryParams) {
        return `{
      ...axiosConfig,
      params: {
        ...payload.queryParams,
        ...axiosConfig?.params,
      },
    }`;
    }
    if (hasBodyPayload) {
        return `{
      ...axiosConfig,
      data: {
        ...payload.bodyPayload,
        ...axiosConfig?.data,
      }
    }`;
    }
    return `axiosConfig,`;
};
exports.handleParameterInQueryAndBodyForApi = handleParameterInQueryAndBodyForApi;
const handleResponseInApi = (hasResponse, apiName) => {
    if (hasResponse) {
        return `<I${apiName}Response>`;
    }
    return "";
};
exports.handleResponseInApi = handleResponseInApi;
const getApiNameFromRoute = (route, withController, getControllerNameFromRouteFn) => {
    const controller = (0, exports.getControllerNameFromRoute)(route, getControllerNameFromRouteFn);
    const indexOfController = route.indexOf(controller);
    let result = withController
        ? route.slice(indexOfController)
        : route.slice(indexOfController + controller.length + 1);
    result = result.replaceAll("{", "").replaceAll("}", "").replaceAll("/", "");
    if (result === "Delete") {
        return "Remove";
    }
    return result;
};
exports.getApiNameFromRoute = getApiNameFromRoute;
const getControllerNameFromRoute = (route, funcFromSettings) => {
    if (funcFromSettings) {
        return eval(funcFromSettings)(route);
    }
    return route.split("/")[0];
};
exports.getControllerNameFromRoute = getControllerNameFromRoute;
// ----------------------------------------------------------------------
const isPrimitiveProperty = (property) => {
    if (!property.type) {
        return false;
    }
    const primitiveTypes = [
        "number",
        "integer",
        "string",
        "boolean",
    ];
    return primitiveTypes.includes(property.type);
};
exports.isPrimitiveProperty = isPrimitiveProperty;
const isNumberProperty = (property) => {
    if (!property.type) {
        return false;
    }
    const primitiveTypes = ["number", "integer"];
    return primitiveTypes.includes(property.type);
};
exports.isNumberProperty = isNumberProperty;
const isRefProperty = (property) => !property.type && !!property.$ref;
exports.isRefProperty = isRefProperty;
const isObjectProperty = (property) => property.type === "object";
exports.isObjectProperty = isObjectProperty;
const isArrayProperty = (property) => property.type === "array";
exports.isArrayProperty = isArrayProperty;
const readConfig = (configPath) => {
    try {
        const configFile = fs.readFileSync(configPath, "utf8");
        return JSON.parse(configFile);
    }
    catch (error) {
        console.error(`Error reading config file: ${error.message}`);
        process.exit(1);
    }
};
exports.readConfig = readConfig;
// Modify the configuration (add or update properties)
// configFile.newProperty = "New Value"; // Add a new property
// configFile.existingProperty = "Updated Value"; // Update an existing property
// Write the updated configuration back to the file
// writeConfig(configFile);
const writeConfig = (configFile) => {
    try {
        fs.writeFileSync(configFile, JSON.stringify(configFile, null, 2), "utf8");
    }
    catch (error) {
        console.error(`Error writing to config file: ${error.message}`);
        process.exit(1);
    }
};
exports.writeConfig = writeConfig;
