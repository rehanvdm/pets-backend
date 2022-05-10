import {Route, RouteInput} from "../../../openapi/route";
import {LambdaOpenApi} from "../../../openapi";
import * as ApiTypes from "../../../openapi/validation/types";
import * as ValidationFunctions from "../../../openapi/validation";
import * as db from "../../../db/pets";
import {HandledError} from "../../../errors";

export class ApiRoute extends Route
{
  constructor(api: LambdaOpenApi) {
    super(api);
  }

  async get(routeInput: RouteInput)
  {
    let params = this.validate<ApiTypes.Pets.GetPetById.RequestParams>
                              ("params", ValidationFunctions.Pets_GetPets_RequestParams, routeInput.params);

    const pet = db.getPet(params.id);

    if(!pet)
      throw new HandledError("Pet not found");

    return {
      data: this.validate<ApiTypes.Pets.GetPetById.ResponseBody>("response", ValidationFunctions.Pets_GetPetById_ResponseBody, pet)
    };
  }
}
