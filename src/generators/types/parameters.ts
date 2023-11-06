import camelcase from "camelcase";
import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { toPascal } from "../../utils/name.js";

export function* generateOperationParametersTypes(
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

export function* generateOperationResultParameterTypes(
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
