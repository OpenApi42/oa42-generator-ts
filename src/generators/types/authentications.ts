import * as models from "../../models/index.js";

export function* generateAuthenticationTypesCode(apiModel: models.Api) {
  yield* generateAllAuthenticationTypes(apiModel);
}

function* generateAllAuthenticationTypes(apiModel: models.Api) {}

function* generateAuthenticationType(
  authenticationModel: models.Authentication,
) {}
