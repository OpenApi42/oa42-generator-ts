import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerRegisterMethodsCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateRegisterAllAuthenticationMethods();
    yield* this.generateRegisterAllOperationMethods();
  }

  private *generateRegisterAllAuthenticationMethods() {
    for (const authenticationModel of this.apiModel.authentication) {
      yield* this.generateRegisterAuthenticationMethod(authenticationModel);
    }
  }

  private *generateRegisterAuthenticationMethod(
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

    yield c`
public ${methodName}(authenticationHandler: ${handlerTypeName}<A>) {
  this.${handlerName} = authenticationHandler;
}
`;
  }

  /**
   * register functions for all operation handlers
   */
  private *generateRegisterAllOperationMethods() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateRegisterOperationMethod(pathModel, operationModel);
      }
    }
  }

  /**
   * register functions for a single operation handler
   * @param pathModel
   * @param operationModel
   */
  private *generateRegisterOperationMethod(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const methodName = toCamel("register", operationModel.name, "operation");
    const handlerTypeName = toPascal(
      operationModel.name,
      "operation",
      "handler",
    );
    const handlerName = toCamel(operationModel.name, "operation", "handler");

    // TODO add JsDoc

    yield c`
public ${methodName}(operationHandler: ${handlerTypeName}<A>) {
  this.${handlerName} = operationHandler;
}
`;
  }
}
