"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch_swagger_data_helpers_1 = require("../helpers/fetch-swagger-data.helpers");
const fs = require("fs");
const path = require("path");
const generateRouteFile = ({ controllerDir, controllerName, routes, getControllerFuncFromSettings, }) => {
    const filePath = path.join(controllerDir, `${(0, fetch_swagger_data_helpers_1.convertToKebabCase)(controllerName)}.api-routes.ts`);
    let content = `const ${controllerName}ApiRoutes = {\n`;
    routes.forEach((route) => {
        const apiName = (0, fetch_swagger_data_helpers_1.getApiNameFromRoute)(route, false, getControllerFuncFromSettings);
        content += `  ${apiName}: ${(0, fetch_swagger_data_helpers_1.handleParameterInPath)(route)},\n`;
    });
    content += `};\n`;
    content += `
export default ${controllerName}ApiRoutes;`;
    fs.writeFileSync(filePath, content);
};
exports.default = generateRouteFile;
