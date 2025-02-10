# Openapi V3 Typescript

The openapi-v3-typescript library provides a streamlined way to generate TypeScript types from OpenAPI V3 specifications. By converting your API definitions into strongly typed interfaces, this library allows developers to leverage TypeScript’s static typing capabilities, ensuring better code quality and reducing runtime errors.

## Features

- ✅ Supports OpenAPI 3.0 and 3.1
- ✅ Load schemas from YAML or JSON, locally or remotely
- ✅ Generate types for even huge schemas within milliseconds
- ✅ Supports remote references: $ref: "external.yaml#components/schemas/User"
- ✅ Code is formatted using Prettier for consistency and readability
- ✅ Maintains a uniform coding structure throughout all generated code
- ✅ Easy Setup
- ✅ Null Safety

## Setup

To install the library, run:

```bash
npm i -D openapi-v3-typescript
```

And in your tsconfig.json add alias for axios instance:

```diff
{
  "compilerOptions": {
    "paths": {
+      "@api-instance": ["path-to-your-api-instance"]
    }
  }
}
```

## Configuration Options

In the root directory of your project, you will find the openapi-v3-typescript-config.json file. This file is crucial for configuring the OpenAPI TypeScript generation process. Here’s how to set it up:

### 1. Input

- Specify your input schema in JSON or YAML format, You can provide:
  - A local path: `./path/to/schema.json`
  - A remote URL: `https://api.test.com/swagger/v1/swagger.json`

### 2. Output

- Indicate the directory where you would like the output to be saved. Example: `./openapi-v3-typescript`
- Default value: `./openapi-v3-typescript`

### 3. getControllerNameFromRoute

- Provide a function that takes an API route as a parameter and returns the corresponding controller name.
- Default value: `(route) => route.split('/')[0]`

### 4. reactQuery

Configuration for enabling [@tanstack/react-query](https://tanstack.com/query/latest), which contains the following properties:

#### - enable

- Enable or disable [@tanstack/react-query](https://tanstack.com/query/latest).
- Default value: `true`

#### - pageParam

- This parameter is for handling infinite queries and may vary between projects based on backend implementation.
- Default value: `pageParam`

#### - getNextPageParam

- This function is used to determine the next page's parameters based on the last page of data that was fetched.
- Default value: `(lastPage, allPages) => {
  if (!lastPage?.hasNextPage) return undefined;
  return allPages.length;
}`

## Usage

- To generate types from your OpenAPI specification, run:

```bash
npx openapi-v3-typescript fetch
```

- To generate types for a specific controller, use the following command:

```bash
npx openapi-v3-typescript fetch <controllerName>
```

▎Note

second command will not create the `common.interface.ts` file.

## Project Structure

For each controller, a dedicated folder will be generated, which will include the following four files:

- \<controller-name\>.api-routes.ts: Contains the API routes associated with the controller.
- \<controller-name\>.api.ts: Contains API handler using Axios.
- \<controller-name\>.interface.ts: Contains controller interfaces.
- \<controller-name\>.queries.ts: This optional file includes queries implemented using [@tanstack/react-query](https://tanstack.com/query/latest).

Furthermore, a common.interface.ts file will be provided to prevent import cycles.

## Advanced

- ### Override API parameters:

To override parameters utilize the `axiosConfig` parameter in the following manner:

```ts
// user.api.ts
const signIn = async (
  payload: IUserSignInRequest,
  axiosConfig?: AxiosRequestConfig
) => {
  const { data } = await ApiInstance.post<IUserSignInResponse>(
    UserApiRoutes.SignIn,
    payload.bodyPayload,
    axiosConfig
  );
  return data;
};
const userApi = {
  signIn,
};
export default userApi;
```

#### Example Usage:

```diff
userApi.signIn(
  {
    bodyPayload: {
      email: "openapi@gmail.com",
      password: "******",
    },
  },
+ {
+   params: {
+     someParameter: "some value",
+   },
+   headers: {
+     "header-parameter": "header parameter value",
+   },
+ }

);
```

- ### Override Query parameters:

Override Query Options:

```ts
// user.queries.ts
const useGetAllUserQuery = (options?: UseQueryOptions) =>
  useQuery({
    queryKey: userQueryKeys.useGetAllUserQuery(),
    queryFn: () => userApi.getAllUser(),
    ...options,
  });
```

#### Example Usage:

```diff
+ const {data, isLoading} = useGetAllUserQuery({
+   refetchOnMount: true,
+ })
```

- ### Query Keys
  Each query comes with exported queryKeys for convenient use when invalidating queries, helping to prevent human errors in writing query keys and ensuring successful refetching of the query.

```ts
// country.queries.ts
export const countryQueryKeys = {
  useGetAllCityQuery: (payload: ICountryGetAllCityRequest) => [
    "useGetAllCityQuery",
    payload,
  ],
};
```

#### Example Usage:

```diff
+ import { countryQueryKeys } from '/.../country/country.queries.ts';
...
const queryClient = useQueryClient();
...
queryClient.invalidateQueries(
+   countryQueryKeys.useGetAllCityQuery({
+     countryId: 3,
+   })
);
```

- ### Omit Generation of Specific Controllers

To exclude the generation of specific controllers, such as those related to the dashboard, you can utilize the `getControllerNameFromRoute` function within the `openapi-v3-typescript-config.json` file. When `getControllerNameFromRoute` returns `null`, the controller will not be generated.

```diff
// openapi-v3-typescript-config.json
{
+  "getControllerNameFromRoute": "(route) => route.split('/')[2].startsWith('Dashboard') ? null : route.split('/')[2]"
}
```
