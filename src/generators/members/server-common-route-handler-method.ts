import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { generateCommonRouteHandlerMethodBody } from "../bodies/common-route-handler-method.js";

export function* generateServerSuperRouteHandlerMethodCode(
  apiModel: models.Api,
) {
  yield* generateMethod(apiModel);
}

/**
 * generate handler for incoming requests
 */
function* generateMethod(apiModel: models.Api) {
  yield itt`
    public routeHandler(
      incomingRequest: lib.ServerIncomingRequest,
    ): lib.ServerOutgoingResponse {
      ${generateCommonRouteHandlerMethodBody(apiModel)}
    }
  `;
}
