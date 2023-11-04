import * as models from "../../models/index.js";
import { c, toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class IsParametersCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateAllFunctions();
  }

  private *generateAllFunctions() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateFunction(pathModel, operationModel);
      }
    }
  }

  private *generateFunction(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const functionName = toCamel(
      "is",
      operationModel.name,
      "request",
      "parameters",
    );

    const typeName = toPascal(operationModel.name, "request", "parameters");

    yield c`
export function ${functionName}(
  requestParameters: Partial<Record<keyof ${typeName}, unknown>>,
): requestParameters is ${typeName} {
  ${this.generateFunctionBody(pathModel, operationModel)}
}
`;
  }

  private *generateFunctionBody(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const allParameterModels = [
      ...operationModel.queryParameters,
      ...operationModel.headerParameters,
      ...operationModel.pathParameters,
      ...operationModel.cookieParameters,
    ];

    for (const parameterModel of allParameterModels) {
      const parameterSchemaId = parameterModel.schemaId;
      const parameterTypeName =
        parameterSchemaId == null
          ? parameterSchemaId
          : this.apiModel.names[parameterSchemaId];
      if (parameterTypeName == null) {
        continue;
      }

      const isFunctionName = `is${parameterTypeName}`;

      const parameterPropertyName = toCamel(parameterModel.name);

      if (parameterModel.required) {
        yield c`
if(requestParameters.${parameterPropertyName} === undefined) {
  return false;
}
`;
      }

      yield c`
if(
  !${isFunctionName}(
    requestParameters.${parameterPropertyName}
  ) === undefined
) {
  return false;
}
`;
    }

    yield c`
return true;
`;
  }
}
