import * as models from "../../models/index.js";
import { c, toCamel } from "../../utils/index.js";

export function* generateClientOperationsCode(apiModel: models.Api) {
  yield* generateAllFunctions(apiModel);
}

function* generateAllFunctions(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateFunction(pathModel, operationModel);
    }
  }
}

function* generateFunction(
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  const name = toCamel(operationModel.name);

  yield c`
export function ${name}(){
  ${generateFunctionBody(pathModel, operationModel)}
}
`;
}

function* generateFunctionBody(
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  yield c`
throw new Error("TODO");
`;
}
