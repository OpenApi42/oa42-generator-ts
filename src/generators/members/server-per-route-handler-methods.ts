import * as models from "../../models/index.js";
import { toCamel } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { generateRouteHandlerMethodBody } from "../bodies/index.js";

/**
 * This class generated methods for the server class that take a
 * `ServerIncomingRequest` and respond with a `ServerOutgoingRequest`. These
 * methods are basically a wrapper for the operation handlers. Authentication
 * is also triggered by these functions.
 */
export function* generateServerRouteHandleMethodsCode(apiModel: models.Api) {
  yield* generateAllMethods(apiModel);
}

/**
 * all route handler functions
 */
function* generateAllMethods(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateMethod(apiModel, operationModel);
    }
  }
}

/**
 * single function to handle a route
 * @param pathModel
 * @param operationModel
 */
function* generateMethod(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  const routeHandlerName = toCamel(operationModel.name, "route", "handler");

  yield itt`
    private ${routeHandlerName}(
      routeParameters: Record<string, string>,
      serverIncomingRequest: lib.ServerIncomingRequest,
    ): lib.ServerOutgoingResponse {
      ${generateRouteHandlerMethodBody(apiModel, operationModel)}
    }
  `;
}
