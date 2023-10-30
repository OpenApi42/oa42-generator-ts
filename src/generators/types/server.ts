import ts from "typescript";
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

  public *getStatements() {
    yield* this.generateServerClassDeclaration();
  }

  private *generateServerClassDeclaration() {
    const { factory: f } = this;

    // TODO add JsDoc

    yield f.createClassDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      f.createIdentifier("Server"),
      [
        f.createTypeParameterDeclaration(
          undefined,
          f.createIdentifier("Authentication"),
          f.createTypeReferenceNode(
            f.createIdentifier("ServerAuthentication"),
            undefined,
          ),
          f.createTypeReferenceNode(
            f.createIdentifier("ServerAuthentication"),
            undefined,
          ),
        ),
      ],
      [
        f.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
          f.createExpressionWithTypeArguments(
            f.createPropertyAccessExpression(
              f.createIdentifier("lib"),
              f.createIdentifier("ServerBase"),
            ),
            undefined,
          ),
        ]),
      ],
      [...this.generateServerElementsDeclarations()],
    );
  }

  private *generateServerElementsDeclarations() {
    yield* this.serverPropertiesCodeGenerator.getStatements();
    yield* this.serverConstructorCodeGenerator.getStatements();
    yield* this.serverRegisterMethodsCodeGenerator.getStatements();
    yield* this.serverSuperRouteHandlerMethodCodeGenerator.getStatements();
    yield* this.serverRouteHandlerMethodsCodeGenerator.getStatements();
  }
}
