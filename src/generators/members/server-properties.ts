import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerPropertiesCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateRouterProperty();
    yield* this.generateAllOperationHandlersProperties();
    yield* this.generateAllAuthenticationHandlersProperties();
  }

  /**
   * the router property
   */
  private *generateRouterProperty() {
    yield c`
private router = new Router({
  parameterValueDecoder: value => value,
  parameterValueEncoder: value => value,
});
`;
  }

  private *generateAllAuthenticationHandlersProperties() {
    for (const authenticationModel of this.apiModel.authentication) {
      yield* this.generateAuthenticationHandlersProperty(authenticationModel);
    }
  }

  private *generateAuthenticationHandlersProperty(
    authenticationModel: models.Authentication,
  ) {
    const propertyName = toCamel(
      authenticationModel.name,
      "authentication",
      "handler",
    );
    const typeName = toPascal(
      authenticationModel.name,
      "authentication",
      "handler",
    );

    yield c`private ${propertyName}?: ${typeName}<A>;`;
  }

  /**
   * operation handler properties that may contain operation handlers
   */
  private *generateAllOperationHandlersProperties() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationHandlersProperty(
          pathModel,
          operationModel,
        );
      }
    }
  }

  /**
   * a single property yo hold the operation handler
   * @param pathModel
   * @param operationModel
   */
  private *generateOperationHandlersProperty(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const propertyName = toCamel(operationModel.name, "operation", "handler");
    const typeName = toPascal(operationModel.name, "operation", "handler");

    yield c`private ${propertyName}?: ${typeName}<A>;`;
  }
}
