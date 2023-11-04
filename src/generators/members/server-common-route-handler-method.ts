import * as models from "../../models/index.js";
import { c, l } from "../../utils/index.js";
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
  yield c`
public routeHandler(
  incomingRequest: lib.ServerIncomingRequest,
): lib.ServerOutgoingResponse {
  ${generateMethodBody(apiModel)}
}
`;
}
function* generateMethodBody(apiModel: models.Api) {
  yield c`
const [routeKey, routeParameters] =
  this.router.parseRoute(incomingRequest.path);
`;

  yield c`
switch(routeKey) {
  ${generatePathCaseClauses(apiModel)}
}
`;
}
function* generatePathCaseClauses(apiModel: models.Api) {
  for (let pathIndex = 0; pathIndex < apiModel.paths.length; pathIndex++) {
    const pathModel = apiModel.paths[pathIndex];
    yield c`
case ${l(pathIndex + 1)}: 
  switch(incomingRequest.method) {
    ${generateOperationCaseClauses(pathModel)}
  }
`;
  }

  yield c`
default:
  throw new lib.NoRouteFound()
`;
}
function* generateOperationCaseClauses(pathModel: models.Path) {
  for (const operationModel of pathModel.operations) {
    const routeHandlerName = toCamel(operationModel.name, "route", "handler");

    yield c`
case ${l(operationModel.method.toUpperCase())}:
  return this.${routeHandlerName}(
    routeParameters,
    incomingRequest,
  );
`;
  }

  yield c`
default:
  throw new lib.MethodNotSupported()
`;
}
