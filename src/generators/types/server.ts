import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";
import {
  generateServerConstructorCode,
  generateServerRouteHandleMethodsCode as generateServerPerRouteHandleMethodsCode,
  generateServerPropertiesCode,
  generateServerRegisterMethodsCode,
  generateServerSuperRouteHandlerMethodCode,
} from "../members/index.js";

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
  yield c`
export class Server<A extends ServerAuthentication = ServerAuthentication>
  extends lib.ServerBase
{
  ${generateServerBody(apiModel)}
}
`;
}

function* generateServerBody(apiModel: models.Api) {
  yield* generateServerPropertiesCode(apiModel);
  yield* generateServerConstructorCode(apiModel);
  yield* generateServerRegisterMethodsCode(apiModel);
  yield* generateServerSuperRouteHandlerMethodCode(apiModel);
  yield* generateServerPerRouteHandleMethodsCode(apiModel);
}
