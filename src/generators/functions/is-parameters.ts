import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { generateIsParametersFunctionBody } from "../bodies/index.js";

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

  yield itt`
    export function ${functionName}(
      requestParameters: Partial<Record<keyof ${typeName}, unknown>>,
    ): requestParameters is ${typeName} {
      ${generateIsParametersFunctionBody(apiModel, operationModel)}
    }
  `;
}
