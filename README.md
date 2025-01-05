s# Openapi V3 Typescript

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

<pre>
{
  "compilerOptions": {
    "paths": {
      <span style="color:#22863a; background-color:#f0fff4">+ "@api-instance": ["path-to-your-api-instance"]</span>
    }
  }
}
</pre>

## Configuration Options

In the root directory of your project, you will find the openapi3-typescript-config.json file. This file is crucial for configuring the OpenAPI TypeScript generation process. Here’s how to set it up:

### 1. Input

- Specify your input schema in JSON or YAML format, You can provide:
  - A local path: `./path/to/schema.json`
  - A remote URL: `https://api.test.com/swagger/v1/swagger.json`

### 2. Output

- Indicate the directory where you would like the output to be saved. Example: `./openapi3-typescript`
- Default value: `./openapi3-typescript`

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

To generate types from your OpenAPI specification, run:

```bash
npm run openapi-fetch
```

## Project Structure

For each controller, a dedicated folder will be generated, which will include the following four files:

- \<controller-name\>.api-routes.ts: Contains the API routes associated with the controller.
- \<controller-name\>.api.ts: Contains API handler using Axios.
- \<controller-name\>.interface.ts: Contains controller interfaces.
- \<controller-name\>.queries.ts: This optional file includes queries implemented using [@tanstack/react-query](https://tanstack.com/query/latest).

Furthermore, a common-interfaces.interface.ts file will be provided to prevent import cycles.

## Advanced

- ### Override API parameters:

To override parameters utilize the `axiosConfig` parameter in the following manner:

<pre>
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
</pre>

#### Example Usage:

<pre>
userApi.signIn(
  {
    bodyPayload: {
      email: "openapi@gmail.com",
      password: "******",
    },
  },
 <span style="color:#22863a; background-color:#f0fff4"> + {
    + params: {
      + someParameter: "some value",
    + },
    + headers: {
      + "header-parameter": "header parameter value",
    + },
  + }
  </span>
);
</pre>

- ### Override Query parameters:

Override Query Options:

<pre>
// user.queries.ts
const useGetAllUserQuery = (
    options?: UseQueryOptions,
) => 
  useQuery({
    queryKey: userQueryKeys.useGetAllUserQuery(),
    queryFn: () => userApi.getAllUser(),
    ...options,
  });
</pre>

#### Example Usage:

<pre>
const {data, isLoading} = useGetAllUserQuery(<span style="color:#22863a; background-color:#f0fff4">+ {
  + refetchOnMount: true,
+ }</span>)
</pre>

- ### Query Keys
  Each query comes with exported queryKeys for convenient use when invalidating queries, helping to prevent human errors in writing query keys and ensuring successful refetching of the query.

<pre>
// country.queries.ts
export const countryQueryKeys = {
  useGetAllCityQuery: (payload: ICountryGetAllCityRequest) => ["useGetAllCityQuery", payload],
}
</pre>

#### Example Usage:

<pre>
<span style="color:#22863a; background-color:#f0fff4">+ import { countryQueryKeys } from '/.../country/country.queries.ts'; </span>
...
const queryClient = useQueryClient();
...
queryClient.invalidateQueries(
  <span style="color:#22863a; background-color:#f0fff4">+ countryQueryKeys.useGetAllCityQuery({
    + countryId: 3,
  + })
</span>);
</pre>

- ### Omit Generation of Specific Controllers

To exclude the generation of specific controllers, such as those related to the dashboard, you can utilize the `getControllerNameFromRoute` function within the `openapi3-typescript-config.json` file. When `getControllerNameFromRoute` returns `null`, the controller will not be generated.

<pre>
// openapi3-typescript-config.json
{
  <span style="color:#22863a; background-color:#f0fff4">+ "getControllerNameFromRoute": "(route) => route.split('/')[2].startsWith('Dashboard') ? null : route.split('/')[2]" </span>
}
</pre>
