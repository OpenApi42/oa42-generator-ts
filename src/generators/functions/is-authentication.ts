import * as models from "../../models/index.js";
import { c, toCamel, toPascal } from "../../utils/index.js";

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

  yield c`
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
  yield c`
throw new Error("TODO");
`;
}
