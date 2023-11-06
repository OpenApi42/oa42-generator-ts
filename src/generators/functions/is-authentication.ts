import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { iterableTextTemplate as itt } from "../../utils/iterable-text.js";

export function* generateIsAuthenticationCode(apiModel: models.Api) {
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
  const functionName = toCamel("is", operationModel.name, "authentication");
  const typeName = toPascal(operationModel.name, "authentication");

  yield itt`
    export function ${functionName}<A extends ServerAuthentication>(
      authentication: Partial<${typeName}<A>>,
    ): authentication is ${typeName}<A> {
      ${generateFunctionBody(pathModel, operationModel)}
    }
  `;
}

function* generateFunctionBody(
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  yield itt`
    throw new Error("TODO");
  `;
}
