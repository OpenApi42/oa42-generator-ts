import camelcase from "camelcase";
import * as models from "../../models/index.js";
import { c, r } from "../../utils/index.js";
import { toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ParametersCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateAllOperationTypes();
  }

  private *generateAllOperationTypes() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationTypes(pathModel, operationModel);
        for (const operationResultModel of operationModel.operationResults) {
          yield* this.generateOperationResultTypes(
            pathModel,
            operationModel,
            operationResultModel,
          );
        }
      }
    }
  }

  private *generateOperationTypes(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const operationRequestParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

    const allParameterModels = [
      ...operationModel.queryParameters,
      ...operationModel.headerParameters,
      ...operationModel.pathParameters,
      ...operationModel.cookieParameters,
    ];

    yield c`
export type ${r(operationRequestParametersName)} = {
  ${allParameterModels.map((parameterModel) => {
    const parameterSchemaId = parameterModel.schemaId;
    const parameterTypeName =
      parameterSchemaId == null
        ? parameterSchemaId
        : this.apiModel.names[parameterSchemaId];

    return c`
${r(camelcase(parameterModel.name))}${r(parameterModel.required ? "?" : "")}:
  ${parameterTypeName == null ? r("unknown") : r(parameterTypeName)}
`;
  })}
};
`;
  }

  private *generateOperationResultTypes(
    pathModel: models.Path,
    operationModel: models.Operation,
    operationResultModel: models.OperationResult,
  ) {
    const operationResponseParametersName = toPascal(
      operationModel.name,
      operationResultModel.statusKind,
      "response",
      "parameters",
    );

    const allParameterModels = operationResultModel.headerParameters;

    yield c`
export type ${r(operationResponseParametersName)} = {
  ${allParameterModels.map((parameterModel) => {
    const parameterSchemaId = parameterModel.schemaId;
    const parameterTypeName =
      parameterSchemaId == null
        ? parameterSchemaId
        : this.apiModel.names[parameterSchemaId];

    return c`
${r(camelcase(parameterModel.name))}${r(parameterModel.required ? "?" : "")}:
  ${parameterTypeName == null ? r("unknown") : r(parameterTypeName)}
`;
  })}
};
`;
  }
}
