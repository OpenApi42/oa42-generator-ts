import camelcase from "camelcase";
import * as models from "../../models/index.js";
import { iterableTextTemplate as itt } from "../../utils/iterable-text.js";
import { toPascal } from "../../utils/name.js";

export function* generateParametersCode(apiModel: models.Api) {
  yield* generateAllOperationTypes(apiModel);
}

function* generateAllOperationTypes(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateOperationTypes(apiModel, operationModel);
      for (const operationResultModel of operationModel.operationResults) {
        yield* generateOperationResultTypes(
          apiModel,
          operationModel,
          operationResultModel,
        );
      }
    }
  }
}

function* generateOperationTypes(
  apiModel: models.Api,
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

  yield itt`
    export type ${operationRequestParametersName} = {
      ${allParameterModels.map((parameterModel) => {
        const parameterSchemaId = parameterModel.schemaId;
        const parameterTypeName =
          parameterSchemaId == null
            ? parameterSchemaId
            : apiModel.names[parameterSchemaId];

        return itt`
    ${camelcase(parameterModel.name)}${parameterModel.required ? "?" : ""}:
      ${parameterTypeName == null ? "unknown" : parameterTypeName}
    `;
      })}
    };
  `;
}

function* generateOperationResultTypes(
  apiModel: models.Api,
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

  yield itt`
    export type ${operationResponseParametersName} = {
      ${allParameterModels.map((parameterModel) => {
        const parameterSchemaId = parameterModel.schemaId;
        const parameterTypeName =
          parameterSchemaId == null
            ? parameterSchemaId
            : apiModel.names[parameterSchemaId];

        return itt`
          ${camelcase(parameterModel.name)}${
            parameterModel.required ? "?" : ""
          }:
            ${parameterTypeName == null ? "unknown" : parameterTypeName}
        `;
      })}
    };
  `;
}
