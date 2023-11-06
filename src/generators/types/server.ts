import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import {
  generateCommonRouteHandlerMethodBody,
  generateRouteHandlerMethodBody,
} from "../bodies/index.js";
import { generateServerConstructorBody } from "../bodies/server-constructor.js";

/**
 * Generated the server class. This is the server that is generated from the
 * specification. It inherits from the `ServerBase` class in `oa42-lib`.
 *
 * The class sets up routing on instantiation, then it's up to the user to
 * register handlers for all operations via the `register...Operation` methods.
 * Also authentication handlers can be registered via `register...Authentication`
 * methods.
 *
 * The handle method redirects `ServerIncomingRequest` to the right route
 * handler. Then the route handler transforms this request into an operation
 * incoming request that the operation handler can take as input. This handler
 * is then executed with the route parameters and the operation incoming request
 * as arguments. The operation handler return an operation outgoing response
 * that is transformed into a `ServerOutgoingResponse` that is the return type
 * of the handle method.
 */
export function* generateServerTypeCode(apiModel: models.Api) {
  yield* generateServerClass(apiModel);
}

function* generateServerClass(apiModel: models.Api) {
  yield itt`
export class Server<A extends ServerAuthentication = ServerAuthentication>
  extends lib.ServerBase
{
  ${generateServerBody(apiModel)}
}
`;
}

function* generateServerBody(apiModel: models.Api) {
  yield itt`
    private router = new Router({
      parameterValueDecoder: value => value,
      parameterValueEncoder: value => value,
    });
  `;

  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      const propertyName = toCamel(operationModel.name, "operation", "handler");
      const typeName = toPascal(operationModel.name, "operation", "handler");

      yield itt`
        private ${propertyName}?: ${typeName}<A>;
      `;
    }
  }

  for (const authenticationModel of apiModel.authentication) {
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

  yield itt`
    public constructor() {
      ${generateServerConstructorBody(apiModel)}
    }
  `;

  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      const methodName = toCamel("register", operationModel.name, "operation");
      const handlerTypeName = toPascal(
        operationModel.name,
        "operation",
        "handler",
      );
      const handlerName = toCamel(operationModel.name, "operation", "handler");

      // TODO add JsDoc

      yield itt`
        public ${methodName}(operationHandler: ${handlerTypeName}<A>) {
          this.${handlerName} = operationHandler;
        }
      `;
    }
  }

  for (const authenticationModel of apiModel.authentication) {
    const methodName = toCamel(
      "register",
      authenticationModel.name,
      "authentication",
    );
    const handlerTypeName = toPascal(
      authenticationModel.name,
      "authentication",
      "handler",
    );
    const handlerName = toCamel(
      authenticationModel.name,
      "authentication",
      "handler",
    );

    // TODO add JsDoc

    yield itt`
      public ${methodName}(authenticationHandler: ${handlerTypeName}<A>) {
        this.${handlerName} = authenticationHandler;
      }
    `;
  }

  yield itt`
    public routeHandler(
      incomingRequest: lib.ServerIncomingRequest,
    ): lib.ServerOutgoingResponse {
      ${generateCommonRouteHandlerMethodBody(apiModel)}
    }
  `;

  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      const routeHandlerName = toCamel(operationModel.name, "route", "handler");

      yield itt`
        private ${routeHandlerName}(
          routeParameters: Record<string, string>,
          serverIncomingRequest: lib.ServerIncomingRequest,
        ): lib.ServerOutgoingResponse {
          ${generateRouteHandlerMethodBody(apiModel, operationModel)}
        }
      `;
    }
  }
}
