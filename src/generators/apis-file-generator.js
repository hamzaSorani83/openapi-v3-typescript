"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch_swagger_data_helpers_1 = require("../helpers/fetch-swagger-data.helpers");
const fs = require("fs");
const path = require("path");
const generateApiFile = ({ controllerName, controllerDir, routesInfo, getControllerFuncFromSettings, }) => {
    const folderName = (0, fetch_swagger_data_helpers_1.convertToKebabCase)(controllerName);
    const filePath = path.join(controllerDir, `${(0, fetch_swagger_data_helpers_1.convertToKebabCase)(controllerName)}.api.ts`);
    let content = `import ApiInstance from "@api-instance";
import { AxiosRequestConfig } from "axios";

import ${controllerName}ApiRoutes from "./${folderName}.api-routes";\n`;
    const interfacesToImport = [];
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
        content += `import {\n  ${interfacesToImport.join(",\n  ")}\n} from "./${folderName}.interface";\n\n`;
        content +=
            "// ----------------------------------------------------------------------\n\n";
    }
    routesInfo.forEach((routeInfo) => {
        const [route, info] = Object.entries(routeInfo)[0];
        const apiName = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, false, getControllerFuncFromSettings);
        const apiNameWithController = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, true, getControllerFuncFromSettings);
        content += `const ${(0, fetch_swagger_data_helpers_1.toCamelCase)(apiName)} = async (${info.hasPathParams || info.hasQueryParams || info.hasBodyPayload
            ? `payload: I${apiNameWithController}Request, axiosConfig?: AxiosRequestConfig`
            : "axiosConfig?: AxiosRequestConfig"}) => {
  const { data } = await ApiInstance.${info.methodType}${(0, fetch_swagger_data_helpers_1.handleResponseInApi)(info.hasResponse, apiNameWithController)}(\n    ${(0, fetch_swagger_data_helpers_1.handleParameterInPathForApi)(`${controllerName}ApiRoutes.${apiName}`, info.hasPathParams)},\n    ${(0, fetch_swagger_data_helpers_1.handleParameterInQueryAndBodyForApi)(info.hasQueryParams, info.hasBodyPayload, info.methodType)}\n  );
  return data;
};\n\n`;
    });
    content +=
        "// ----------------------------------------------------------------------\n\n";
    content += `const ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}Api = {\n`;
    const apisToExport = [];
    routesInfo.forEach((routeInfo) => {
        const route = Object.keys(routeInfo)[0];
        const apiName = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, false, getControllerFuncFromSettings);
        apisToExport.push((0, fetch_swagger_data_helpers_1.toCamelCase)(apiName));
    });
    apisToExport.sort((a, b) => a.length - b.length);
    if (apisToExport.length) {
        content += `  ${apisToExport.join(",\n  ")}\n}\n\n`;
    }
    content +=
        "// ----------------------------------------------------------------------\n\n";
    content += `export default ${(0, fetch_swagger_data_helpers_1.toCamelCase)(controllerName)}Api;`;
    fs.writeFileSync(filePath, content);
};
exports.default = generateApiFile;
