import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { toCamel, toPascal } from "../../utils/name.js";

export function* generateServerPropertiesCode(apiModel: models.Api) {
  yield* generateRouterProperty();
  yield* generateAllOperationHandlersProperties(apiModel);
  yield* generateAllAuthenticationHandlersProperties(apiModel);
}

/**
 * the router property
 */
function* generateRouterProperty() {
  yield itt`
  private router = new Router({
    parameterValueDecoder: value => value,
    parameterValueEncoder: value => value,
  });
`;
}

function* generateAllAuthenticationHandlersProperties(apiModel: models.Api) {
  for (const authenticationModel of apiModel.authentication) {
    yield* generateAuthenticationHandlersProperty(authenticationModel);
  }
}

function* generateAuthenticationHandlersProperty(
  authenticationModel: models.Authentication,
) {
  const propertyName = toCamel(
    authenticationModel.name,
    "authentication",
    "handler",
  );
  const typeName = toPascal(
    authenticationModel.name,
    "authentication",
    "handler",
  );

  yield itt`
    private ${propertyName}?: ${typeName}<A>;
  `;
}

/**
 * operation handler properties that may contain operation handlers
 */
function* generateAllOperationHandlersProperties(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield* generateOperationHandlersProperty(pathModel, operationModel);
    }
  }
}

/**
 * a single property yo hold the operation handler
 * @param pathModel
 * @param operationModel
 */
function* generateOperationHandlersProperty(
  pathModel: models.Path,
  operationModel: models.Operation,
) {
  const propertyName = toCamel(operationModel.name, "operation", "handler");
  const typeName = toPascal(operationModel.name, "operation", "handler");

  yield itt`
    private ${propertyName}?: ${typeName}<A>;
  `;
}
