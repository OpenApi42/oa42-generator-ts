import * as models from "../../models/index.js";
import { c, l } from "../../utils/index.js";
import { toCamel } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerSuperRouteHandlerMethodCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateMethod();
  }

  /**
   * generate handler for incoming requests
   */
  private *generateMethod() {
    yield c`
public routeHandler(
  incomingRequest: lib.ServerIncomingRequest,
): lib.ServerOutgoingResponse {
  ${this.generateMethodBody()}
}
`;
  }
  private *generateMethodBody() {
    yield c`
const [routeKey, routeParameters] =
  this.router.parseRoute(incomingRequest.path);
`;

    yield c`
switch(routeKey) {
  ${this.generatePathCaseClauses()}
}
`;
  }
  private *generatePathCaseClauses() {
    for (
      let pathIndex = 0;
      pathIndex < this.apiModel.paths.length;
      pathIndex++
    ) {
      const pathModel = this.apiModel.paths[pathIndex];
      yield c`
case ${l(pathIndex + 1)}: 
  switch(incomingRequest.method) {
    ${this.generateOperationCaseClauses(pathModel)}
  }
`;
    }

    yield c`
default:
  throw new lib.NoRouteFound()
`;
  }
  private *generateOperationCaseClauses(pathModel: models.Path) {
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
}
