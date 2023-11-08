import * as models from "../../models/index.js";
import { toCamel } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";

export function* generateIsRequestParametersFunctionBody(
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
      yield itt`
        if(parameters.${parameterPropertyName} === undefined) {
          return false;
        }
      `;
    }

    yield itt`
      if(
        !${isFunctionName}(
          parameters.${parameterPropertyName}
        ) === undefined
      ) {
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}
