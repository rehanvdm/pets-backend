import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
  APIGatewayProxyWithCognitoAuthorizerEvent,
  APIGatewayProxyEventV2
} from "aws-lambda";
import {HandledError} from "../errors";

import {Route, RouteInput, RouteResponse} from "./route";
import * as pets from "../routes/pets";
import * as petsId from "../routes/pets/{petId}";

/* These must be the same as in the openapi.yaml */
export const routes: {[path: string]: typeof Route } = {
  "/pets": pets.ApiRoute,
  "/pets/{id}": petsId.ApiRoute,
};

export class LambdaOpenApi
{
  constructor()
  {

  }

  private matchPathFormatPathParams(route: string, path: string)
  {
    if(!route.endsWith("/"))
      route += "/";

    if(!path.endsWith("/"))
      path += "/";

    /* Changes anything in the path params that ends in `id}` or `Id}` into (?<id>\w*) which is a named regex group */
    /* Add line ending to signify the end of search, else does partial matching. Only works with 'm' flag */
    let splits = route.split("/");
    for(let i in splits)
    {
      if(splits[i] === "")
        continue;

      let regexCharMatch = "w"; //Default to word, unless param ends in Id} then match any digit.
      if(splits[i].endsWith("id}") || splits[i].endsWith("Id}"))
        regexCharMatch = "d";

      splits[i] = splits[i].replace(/{/gm, "(?<").replace(/}/gm, ">\\"+regexCharMatch+"*)");
    }
    let regexString = splits.join("/") + "$";

    let regexExp = new RegExp(regexString, 'gm');
    let matched = regexExp.exec(path);
    // console.log(route, path, regexExp, matched);

    if(matched !== null)
    {
      /* If ends in `id` or `Id` change to number */
      let groups: {[key:string]: string | number} = { };
      if(matched.groups)
      {
        for(let [name, value] of Object.entries(matched.groups))
        {
          if(name.endsWith("id") || name.endsWith("Id"))
            groups[name] = Number(value);
          else
            groups[name] = value;
        }
      }

      return {
        matched: true,
        pathParams: groups
      }
    }
    else
    {
      return {
        matched: false,
        pathParams: null
      }
    }
  }
  /** Extracts Path Params into an object and makes sure the route exists
   * Changes route input by ref, sets routeInput.resource, routeInput.params and routeInput.path to the correct values when proxying
   * @param routeInput
   * @private
   */
  private routeResourceRewrite(routeInput: RouteInput)
  {
    let path = routeInput.path;
    let matchedRoute = "";
    let pathParams = { };

    for(let route in routes)
    {
      let result = this.matchPathFormatPathParams(route, path);
      if(result.matched)
      {
        if(matchedRoute) /* If has been set before, error, just being extra safe, shouldn't happen */
          throw new HandledError("Path matches multiple routes");

        matchedRoute = route;
        pathParams = result.pathParams ?? { };

        /* Not breaking want to make sure no other routes match */
      }
    }
    if(!matchedRoute)
      throw new HandledError(routeInput.method+" "+path+" does not match any routes");

    /* Save result for future use */
    routeInput.path = path;
    routeInput.resource = matchedRoute;
    routeInput.params = pathParams;

    /* If we have a body, not base64 and method is not the GET OR DELETE, then always try to parse JSON
     * Just more flexible, else caller has to specify "Content-Type": "application/json" every time */
    if(routeInput.body && !routeInput.isBase64Encoded && !["get", "delete"].includes(routeInput.method))
    {
      try { routeInput.body = JSON.parse(routeInput.body); } catch (e) { routeInput.body = null; }
      if(!routeInput.body || typeof routeInput.body !== 'object')
        throw new HandledError(routeInput.method + " body is not valid JSON");
    }
  }
  private isAPIGWVersion2(event: any): event is APIGatewayProxyEventV2
  {
    return event.version && event.version.startsWith("2.");
  }
  private getRouteInputV1(event: APIGatewayProxyEvent)
  {
    event.httpMethod = event.httpMethod.toLowerCase();
    /* Explicit casting for runtime and compile time safety of selecting the function dynamically on the API class */
    let reqMethod: "get" | "post" | "put" | "patch" | "delete" | null = null;
    switch (event.httpMethod)
    {
      case "get":
        reqMethod = "get";
        break;
      case "post":
        reqMethod = "post";
        break;
      case "put":
        reqMethod = "put";
        break;
      case "patch":
        reqMethod = "patch";
        break;
      case "delete":
        reqMethod = "delete";
        break;
    }
    if(!reqMethod)
      throw new Error("Request method is unknown");

    let routeInput: RouteInput = {
      resource: event.resource,
      path: event.path,
      headers: event.headers as { [key: string]: string | string[] } || {},
      params: event.pathParameters as { [key: string]: string | string[] } || {},
      query: event.queryStringParameters as { [key: string]: string | string[] } || {},
      body: event.body,
      isBase64Encoded: event.isBase64Encoded,
      method: reqMethod,
    };

    return routeInput;
  }
  private getRouteInputV2(event: APIGatewayProxyEventV2)
  {
    event.requestContext.http.method = event.requestContext.http.method.toLowerCase();
    /* Explicit casting for runtime and compile time safety of selecting the function dynamically on the API class */
    let reqMethod: "get" | "post" | "put" | "patch" | "delete" | null = null;
    switch (event.requestContext.http.method)
    {
      case "get":
        reqMethod = "get";
        break;
      case "post":
        reqMethod = "post";
        break;
      case "put":
        reqMethod = "put";
        break;
      case "patch":
        reqMethod = "patch";
        break;
      case "delete":
        reqMethod = "delete";
        break;
    }
    if(!reqMethod)
      throw new Error("Request method is unknown");

    let routeInput: RouteInput = {
      resource: event.routeKey,
      path: event.requestContext.http.path,
      headers: event.headers as { [key: string]: string | string[] } || {},
      params: event.pathParameters as { [key: string]: string | string[] } || {},
      query: event.queryStringParameters as { [key: string]: string | string[] } || {},
      body: event.body,
      isBase64Encoded: event.isBase64Encoded,
      method: reqMethod,
    };

    return routeInput;
  }
  routeInput(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): RouteInput
  {
    let routeInput = this.isAPIGWVersion2(event) ? this.getRouteInputV2(event) : this.getRouteInputV1(event);
    this.routeResourceRewrite(routeInput);
    return routeInput;
  }

  async route(routeInput: RouteInput): Promise<RouteResponse>
  {
    let classConstructor: any = routes[routeInput.resource];
    let apiClass: Route = new (classConstructor)(this);
    let reqResp: RouteResponse = await apiClass[routeInput.method](routeInput);
    return reqResp;
  }

  response(data: any, statusCode: number = 200, fullCorsEnabled: boolean = true,
           headers: {[key: string]: string} | null = null): APIGatewayProxyResult
  {
    let ret: APIGatewayProxyResult =  {
      statusCode: statusCode,
      headers: { },
      body: JSON.stringify(data),
    };

    if(headers !== null)
      ret.headers = headers;

    if(fullCorsEnabled)
    {
      ret.headers = Object.assign(ret.headers, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      });
    }

    return ret;
  }
}





