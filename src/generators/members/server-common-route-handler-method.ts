import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { toCamel } from "../../utils/name.js";

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
      ${generateMethodBody(apiModel)}
    }
  `;
}
function* generateMethodBody(apiModel: models.Api) {
  yield itt`
    const [routeKey, routeParameters] =
      this.router.parseRoute(incomingRequest.path);
  `;

  yield itt`
    switch(routeKey) {
      ${generatePathCaseClauses(apiModel)}
    }
  `;
}
function* generatePathCaseClauses(apiModel: models.Api) {
  for (let pathIndex = 0; pathIndex < apiModel.paths.length; pathIndex++) {
    const pathModel = apiModel.paths[pathIndex];
    yield itt`
      case ${JSON.stringify(pathIndex + 1)}: 
        switch(incomingRequest.method) {
          ${generateOperationCaseClauses(pathModel)}
        }
    `;
  }

  yield itt`
    default:
      throw new lib.NoRouteFound()
  `;
}
function* generateOperationCaseClauses(pathModel: models.Path) {
  for (const operationModel of pathModel.operations) {
    const routeHandlerName = toCamel(operationModel.name, "route", "handler");

    yield itt`
      case ${JSON.stringify(operationModel.method.toUpperCase())}:
        return this.${routeHandlerName}(
          routeParameters,
          incomingRequest,
        );
    `;
  }

  yield itt`
    default:
      throw new lib.MethodNotSupported()
  `;
}
