import {LambdaOpenApi} from "./index";
import {ValidationError} from "../errors";
import {ValidateFunction, ErrorObject} from "ajv";

export type RouteInput = {
  resource: string,
  path: string,
  headers: { [key: string]: string | string[] },
  params: { [key: string]: string | string[] }, /* Path Params */
  query: { [key: string]: string | string[] },
  body: any,
  isBase64Encoded: boolean,
  method: "get" | "post" | "put" | "patch" | "delete",
  cognitoUser?: undefined
};
export type RouteResponse = {
  data: {[key: string]: any},
  headers?: {[key: string]: string},
};

type RouteAjvValidationFunc = (data: any,  { instancePath, parentData, parentDataProperty, rootData }?: {
  instancePath?: string;
  parentData: any;
  parentDataProperty: any;
  rootData?: any;
}) => boolean;
type RoutePart = "params" | "headers" | "query" | "body" | "response";

export class Route
{
  private api: LambdaOpenApi;

  constructor(api: LambdaOpenApi) {
    this.api = api;
  }

  // validateInput<TParams, THeaders, TQuery, TBody>(validationFunctions: {
  //                 params: RouteAjvValidationFunc,
  //                 headers: RouteAjvValidationFunc,
  //                 query: RouteAjvValidationFunc,
  //                 body: RouteAjvValidationFunc,
  //               },
  //               routeInput: RouteInput): { params: TParams, headers: THeaders, query: TQuery, body: TBody }
  // {
  //   let params = this.ensureType<TParams>("params", validationFunctions.params, routeInput.params);
  //   let headers = this.ensureType<THeaders>("headers", validationFunctions.headers, routeInput.headers);
  //   let query = this.ensureType<TQuery>("query", validationFunctions.query, routeInput.query);
  //   let body = this.ensureType<TBody>("body", validationFunctions.body, routeInput.body);
  //
  //   return  {
  //     params,
  //     headers,
  //     query,
  //     body,
  //   };
  // }

  // validateInput<T>(part: RoutePart, validationFunc: RouteAjvValidationFunc, data: any): T
  // {
  //   return this.ensureType<T>(part, validationFunc, data);
  // }
  //
  // validateResponse<TResponse>(responseValidationFunctions: RouteAjvValidationFunc, routeResponse: RouteResponse): RouteResponse
  // {
  //   routeResponse.data = this.ensureType<TResponse>("response", responseValidationFunctions, routeResponse.data);
  //   return routeResponse;
  // }

  validate<T>(part: RoutePart, validationFunc: RouteAjvValidationFunc, data: any): T
  {
    return this.ensureType<T>(part, validationFunc, data);
  }

  private ensureType<T>(part: RoutePart, validationFunc: RouteAjvValidationFunc, data: any): T
  {
    const validate = validationFunc as ValidateFunction<T>;
    if(!validate)
      throw new Error("Validate not defined, schema not found");

    const isValid = validate(data);
    if(!isValid)
      throw new ValidationError(this.formatAjvError(part, validate.errors!));

    return data;
  }

  private formatAjvError(part: RoutePart, errors: ErrorObject[])
  {
    let err = errors[0];

    return "("+part + ") " + err.instancePath + " " + err.message;

    //TODO: test

    // switch (part)
    // {
    //   case "query":
    //     if(err.params.allowedValues)
    //       return "Query string parameter " + err.instancePath + " " +  err.message + ": " + err.params.allowedValues.join(",");
    //
    //     return "Query string " + err.message;
    //
    //   case "params":
    //     return "Path parameters " + err.message;
    //
    //   case "body":
    //     if(err.params.allowedValues)
    //     {
    //       return "Body property " + err.instancePath + " must be one of " + err.params.allowedValues;
    //     }
    //     else if(err.params.format)
    //     {
    //       if(err.params.format === "date-time")
    //         return "Body property " + err.instancePath + " must match ISO 8601 date-time format";
    //
    //       return "Body property " + err.instancePath + " " + err.message;
    //     }
    //     else if(err.params.type)
    //       return "Body property " + err.instancePath + " " + err.message;
    //     else
    //       return "Body " + err.message;
    //
    //   case "response":
    //
    //     if(err.params.passingSchemas === null)
    //       return undefined;
    //     /* Either pass the statusCode as argument to this.api.validateResponse() or
    //      * add - required to response types to not be ambiguous */
    //     if(err.params.passingSchemas && err.message === "must match exactly one schema in oneOf")
    //       return "Multiple responses match this data structure";
    //
    //     if(err.params.format)
    //     {
    //       if(err.params.format === "date-time")
    //         return "Response property " + err.instancePath + " must match ISO 8601 date-time format";
    //
    //       return "Response property " + err.instancePath + " " + err.message;
    //     }
    //     else if(err.params.type)
    //       return "Response property " + err.instancePath + " " + err.message;
    //     else
    //       return "Response " + err.message;
    //
    //     break;
    //
    //   default:
    //     return err.instancePath + " " + err.message;
    // }
  }

  async get(routeInput: RouteInput): Promise<RouteResponse>
  {
    throw new Error("Method not implemented");
  }

  async patch(routeInput: RouteInput): Promise<RouteResponse>
  {
    throw new Error("Method not implemented");
  }

  async put(routeInput: RouteInput): Promise<RouteResponse>
  {
    throw new Error("Method not implemented");
  }

  async post(routeInput: RouteInput): Promise<RouteResponse>
  {
    throw new Error("Method not implemented");
  }

  async delete(routeInput: RouteInput): Promise<RouteResponse>
  {
    throw new Error("Method not implemented");
  }
}
