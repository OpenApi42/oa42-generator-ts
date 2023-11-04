import * as models from "../../models/index.js";
import { c, toCamel, toPascal } from "../../utils/index.js";

export function* generateIsParametersCode(apiModel: models.Api) {
  yield* generateAllFunctions(apiModel);
}

function* generateAllFunctions(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateFunction(apiModel, operationModel);
    }
  }
}

function* generateFunction(
  apiModel: models.Api,
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
      ${generateFunctionBody(apiModel, operationModel)}
    }
  `;
}

function* generateFunctionBody(
  apiModel: models.Api,
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
        : apiModel.names[parameterSchemaId];
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
