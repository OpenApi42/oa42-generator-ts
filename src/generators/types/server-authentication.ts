import * as models from "../../models/index.js";
import { c, joinIterable, l, r, toCamel } from "../../utils/index.js";

export function* generateServerAuthenticationTypeCode(apiModel: models.Api) {
  yield* generateServerAuthenticationType(apiModel);
}

function* generateServerAuthenticationType(apiModel: models.Api) {
  const authenticationModels = apiModel.authentication;

  const typeArgument =
    authenticationModels.length > 0
      ? joinIterable(
          authenticationModels.map((authenticationModel) =>
            l(toCamel(authenticationModel.name)),
          ),
          r("|"),
        )
      : "never";

  yield c`
export type ServerAuthentication = Record<${typeArgument}, unknown>;
`;
}
