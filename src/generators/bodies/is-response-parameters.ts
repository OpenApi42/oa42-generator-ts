import * as models from "../../models/index.js";
import { toCamel } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";

export function* generateIsResponseParametersFunctionBody(
  apiModel: models.Api,
  operationResultModel: models.OperationResult,
) {
  const parameterModels = operationResultModel.headerParameters;

  for (const parameterModel of parameterModels) {
    const parameterSchemaId = parameterModel.schemaId;
    const parameterTypeName =
      parameterSchemaId == null
        ? parameterSchemaId
        : apiModel.names[parameterSchemaId];
    if (parameterTypeName == null) {
      continue;
    }

    const isParameterFunction = `is${parameterTypeName}`;

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
        !${isParameterFunction}(
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
