import { c } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";
import {
  ServerConstructorCodeGenerator,
  ServerPropertiesCodeGenerator,
  ServerRegisterMethodsCodeGenerator,
  ServerRouteHandleMethodsCodeGenerator,
} from "../members/index.js";
import { ServerSuperRouteHandlerMethodCodeGenerator } from "../members/server-common-route-handler-method.js";

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
export class ServerTypeCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateServerClass();
  }

  private serverConstructorCodeGenerator = new ServerConstructorCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private serverPropertiesCodeGenerator = new ServerPropertiesCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private serverRegisterMethodsCodeGenerator =
    new ServerRegisterMethodsCodeGenerator(this.factory, this.apiModel);
  private serverRouteHandlerMethodsCodeGenerator =
    new ServerRouteHandleMethodsCodeGenerator(this.factory, this.apiModel);
  private serverSuperRouteHandlerMethodCodeGenerator =
    new ServerSuperRouteHandlerMethodCodeGenerator(this.factory, this.apiModel);

  private *generateServerClass() {
    yield c`
export class Server<A extends ServerAuthentication = ServerAuthentication>
  extends lib.ServerBase
{
  ${this.generateServerBody()}
}
`;
  }

  private *generateServerBody() {
    yield* this.serverPropertiesCodeGenerator.getCode();
    yield* this.serverConstructorCodeGenerator.getCode();
    yield* this.serverRegisterMethodsCodeGenerator.getCode();
    yield* this.serverSuperRouteHandlerMethodCodeGenerator.getCode();
    yield* this.serverRouteHandlerMethodsCodeGenerator.getCode();
  }
}
