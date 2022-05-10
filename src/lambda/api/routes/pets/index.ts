import {Route, RouteInput} from "../../openapi/route";
import {LambdaOpenApi} from "../../openapi";
import * as ApiTypes from "../../openapi/validation/types";
import * as ValidationFunctions from "../../openapi/validation";
import * as db from "../../db/pets";

export class ApiRoute extends Route
{
  constructor(api: LambdaOpenApi) {
    super(api);
  }

  async get(routeInput: RouteInput)
  {
    const pets = db.getPets();

    return {
      data: this.validate<ApiTypes.Pets.GetPets.ResponseBody>("response", ValidationFunctions.Pets_GetPets_ResponseBody, pets)
    };
  }
}
