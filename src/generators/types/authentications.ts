import * as models from "../../models/index.js";
import { c, l, toCamel, toPascal } from "../../utils/index.js";

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

  yield c`
export type ${handlerTypeName}<A extends ServerAuthentication> =
  (credential: string) => A[${l(toCamel(authenticationModel.name))}];
`;
}
