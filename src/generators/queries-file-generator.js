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
const fetch_swagger_data_helpers_1 = require("../helpers/fetch-swagger-data.helpers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const generateQueriesFile = ({ controllerName, routesInfo, controllerDir, getControllerFuncFromSettings, reactQueryPageParam, reactQueryGetNextPageParam, }) => {
    const folderName = (0, fetch_swagger_data_helpers_1.convertToKebabCase)(controllerName);
    const filePath = path.join(controllerDir, `${(0, fetch_swagger_data_helpers_1.convertToKebabCase)(controllerName)}.queries.ts`);
    const importInfiniteQuery = routesInfo.some((r) => {
        const [route, info] = Object.entries(r)[0];
        return info.hasPageParamInBody || info.hasPageParamInQuery;
    });
    let content = "";
    if (importInfiniteQuery) {
        content = `import {
  useQuery,
  UseQueryOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from "@tanstack/react-query";\n`;
    }
    else {
        content = `import { useQuery, UseQueryOptions } from "@tanstack/react-query";\n`;
    }
    content += `
import ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}Api from "./${(0, fetch_swagger_data_helpers_1.convertToKebabCase)(controllerName)}.api";\n`;
    const interfacesToImport = [];
    const queriesToExport = [];
    routesInfo.forEach((routeInfo) => {
        const [route, info] = Object.entries(routeInfo)[0];
        const apiName = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, true, getControllerFuncFromSettings);
        if (info.hasQueryParams || info.hasBodyPayload || info.hasPathParams) {
            interfacesToImport.push(`I${apiName}Request`);
        }
        if (info.hasResponse) {
            interfacesToImport.push(`I${apiName}Response`);
        }
    });
    interfacesToImport.sort((a, b) => a.length - b.length);
    if (interfacesToImport.length) {
        content += `import {\n\t${interfacesToImport.join(",\n\t")}\n} from "./${folderName}.interface";\n`;
    }
    content +=
        "\n// ----------------------------------------------------------------------\n\n";
    content += `export const ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}QueryKeys = {`;
    routesInfo.forEach((routeInfo) => {
        const [route, info] = Object.entries(routeInfo)[0];
        const apiName = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, false, getControllerFuncFromSettings);
        const apiNameWithController = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, true, getControllerFuncFromSettings);
        content += `
  use${apiName}Query : (${info.hasPathParams || info.hasQueryParams || info.hasBodyPayload
            ? `payload: I${apiNameWithController}Request`
            : ""}) => ["use${apiNameWithController}Query"${info.hasPathParams || info.hasQueryParams || info.hasBodyPayload
            ? ", payload"
            : ""}],`;
        if (info.hasPageParamInBody || info.hasPageParamInQuery) {
            content += `
  use${apiName}InfiniteQuery : (payload: I${apiNameWithController}Request) => ["use${apiNameWithController}Query", payload],`;
        }
    });
    content += "\n};\n";
    content +=
        "\n// ----------------------------------------------------------------------\n\n";
    routesInfo.forEach((routeInfo) => {
        const [route, info] = Object.entries(routeInfo)[0];
        const apiName = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, false, getControllerFuncFromSettings);
        const apiNameWithController = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, true, getControllerFuncFromSettings);
        content += `const use${apiName}Query = (
  ${info.hasPathParams || info.hasQueryParams || info.hasBodyPayload
            ? `payload: I${apiNameWithController}Request,\n`
            : ""}  options?: Partial<
    UseQueryOptions<
      ${info.hasResponse ? `I${apiNameWithController}Response` : "any"},
      Error,
      ${info.hasResponse ? `I${apiNameWithController}Response` : "any"},
      ${info.hasPathParams || info.hasQueryParams || info.hasBodyPayload
            ? `(string | I${apiNameWithController}Request)[]`
            : `string[]`}
    >
  >
) => 
  useQuery({
    queryKey: ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}QueryKeys.use${apiName}Query(${info.hasPathParams || info.hasQueryParams || info.hasBodyPayload
            ? "payload"
            : ""}),
    queryFn: () => ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}Api.${(0, fetch_swagger_data_helpers_1.toCamelCase)(apiName)}(${info.hasPathParams || info.hasQueryParams || info.hasBodyPayload
            ? "payload"
            : ""}),
    ...options,
  });\n\n`;
        if (info.hasPageParamInBody || info.hasPageParamInQuery) {
            queriesToExport.push(`use${apiName}InfiniteQuery`);
            content += `const use${apiName}InfiniteQuery = (
  ${`payload: I${apiNameWithController}Request,\n`}  options?: UseInfiniteQueryOptions<
    ${info.hasResponse ? `I${apiNameWithController}Response` : "any"},
    unknown,
    ${info.hasResponse ? `I${apiNameWithController}Response` : "any"},
    ${info.hasResponse ? `I${apiNameWithController}Response` : "any"},
    (string | I${apiNameWithController}Request)[],
    number
  >
) => 
  useInfiniteQuery({
    queryKey: ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}QueryKeys.use${apiName}InfiniteQuery(payload),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}Api.${(0, fetch_swagger_data_helpers_1.toCamelCase)(apiName)}({
      ...payload,
      ${info.hasPageParamInQuery
                ? `queryParams: {
        ...payload.queryParams,
        ${reactQueryPageParam}: pageParam,
      },`
                : ""}${info.hasPageParamInBody
                ? `bodyPayload: {
        ...payload.bodyPayload,
        ${reactQueryPageParam}: pageParam,
      },`
                : ""}
    }),
    getNextPageParam: ${reactQueryGetNextPageParam},
    ...options,
  });\n\n`;
        }
    });
    content +=
        "// ----------------------------------------------------------------------\n\n";
    content += `const ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}Queries = {\n`;
    routesInfo.forEach((routeInfo) => {
        const route = Object.keys(routeInfo)[0];
        const apiName = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, false, getControllerFuncFromSettings);
        queriesToExport.push(`use${apiName}Query`);
    });
    queriesToExport.sort((a, b) => a.length - b.length);
    if (queriesToExport.length) {
        content += `\t${queriesToExport.join(",\n\t")}\n}\n\n`;
    }
    content +=
        "// ----------------------------------------------------------------------\n\n";
    content += `export default ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}Queries;`;
    fs.writeFileSync(filePath, content);
};
exports.default = generateQueriesFile;
