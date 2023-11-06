import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { iterableTextTemplate as itt } from "../../utils/iterable-text.js";

export function* generateAuthenticationTypesCode(apiModel: models.Api) {
  yield* generateAllAuthenticationTypes(apiModel);
}

function* generateAllAuthenticationTypes(apiModel: models.Api) {
  for (const authenticationModel of apiModel.authentication) {
    yield* generateAuthenticationType(authenticationModel);
  }
}

function* generateAuthenticationType(
  authenticationModel: models.Authentication,
) {
  const handlerTypeName = toPascal(
    authenticationModel.name,
    "authentication",
    "handler",
  );

  yield itt`
    export type ${handlerTypeName}<A extends ServerAuthentication> =
      (credential: string) => A[${JSON.stringify(
        toCamel(authenticationModel.name),
      )}];
  `;
}
