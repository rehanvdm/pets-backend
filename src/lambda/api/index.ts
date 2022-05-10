import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";
import {LambdaOpenApi} from "./openapi";
import {RouteInput, RouteResponse} from "./openapi/route";
import {HandledError, ValidationError} from "./errors";

const api: LambdaOpenApi = new LambdaOpenApi();



export const handler = async (event: APIGatewayProxyEvent, context: Context ): Promise<APIGatewayProxyResult> =>
{
  // console.log(JSON.stringify(event));

  let response: APIGatewayProxyResult;
  let defaultHeaders: { [key: string]: string } = {
    "trace-id": String(context.awsRequestId)
  };

  try
  {
    let routeInput: RouteInput = api.routeInput(event);
    let routeResponse: RouteResponse = await api.route(routeInput);

    response = api.response(routeResponse.data, 200, false, defaultHeaders);
  }
  catch (err)
  {
    let resp = {
      status_code: 0,
      data: {
        error_type: "",
        message: ""
      }
    };

    /* Just need to type guard this as well, this block always happens */
    if(err instanceof Error)
      console.error(err);

    if(err instanceof HandledError)
    {
      resp.status_code = 400;
      resp.data.error_type = "HandledError";
      resp.data.message = err.message;
    }
    else if(err instanceof ValidationError)
    {
      resp.status_code = 401;
      resp.data.error_type = "ValidationError";
      resp.data.message = err.message;
    }
    else
    {
      resp.status_code = 500;
      resp.data.error_type = "UnhandledError";
      resp.data.message = "Unexpected Error Occurred";
    }

    response = api.response(resp.data, resp.status_code, false, defaultHeaders);
  }

  return response;
}
