import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { toCamel, toPascal } from "../../utils/name.js";

export function* generateServerRegisterMethodsCode(apiModel: models.Api) {
  yield* generateRegisterAllAuthenticationMethods(apiModel);
  yield* generateRegisterAllOperationMethods(apiModel);
}

function* generateRegisterAllAuthenticationMethods(apiModel: models.Api) {
  for (const authenticationModel of apiModel.authentication) {
    yield* generateRegisterAuthenticationMethod(authenticationModel);
  }
}

function* generateRegisterAuthenticationMethod(
  authenticationModel: models.Authentication,
) {
  const methodName = toCamel(
    "register",
    authenticationModel.name,
    "authentication",
  );
  const handlerTypeName = toPascal(
    authenticationModel.name,
    "authentication",
    "handler",
  );
  const handlerName = toCamel(
    authenticationModel.name,
    "authentication",
    "handler",
  );

  // TODO add JsDoc

  yield itt`
    public ${methodName}(authenticationHandler: ${handlerTypeName}<A>) {
      this.${handlerName} = authenticationHandler;
    }
  `;
}

/**
 * register functions for all operation handlers
 */
function* generateRegisterAllOperationMethods(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateRegisterOperationMethod(pathModel, operationModel);
    }
  }
}

/**
 * register functions for a single operation handler
 * @param pathModel
 * @param operationModel
 */
function* generateRegisterOperationMethod(
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  const methodName = toCamel("register", operationModel.name, "operation");
  const handlerTypeName = toPascal(operationModel.name, "operation", "handler");
  const handlerName = toCamel(operationModel.name, "operation", "handler");

  // TODO add JsDoc

  yield itt`
    public ${methodName}(operationHandler: ${handlerTypeName}<A>) {
      this.${handlerName} = operationHandler;
    }
  `;
}
