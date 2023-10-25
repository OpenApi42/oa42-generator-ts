import ts from "typescript";
import { CodeGeneratorBase } from "../code-generator-base.js";
import {
  ServerConstructorCodeGenerator,
  ServerPropertiesCodeGenerator,
  ServerRegisterMethodsCodeGenerator,
  ServerRouteHandleMethodsCodeGenerator,
} from "../members/index.js";
import { ServerHandleMethodCodeGenerator } from "../members/server-handle-method.js";

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
  private serverRouteHandleMethodsCodeGenerator =
    new ServerRouteHandleMethodsCodeGenerator(this.factory, this.apiModel);
  private serverHandleMethodCodeGenerator = new ServerHandleMethodCodeGenerator(
    this.factory,
    this.apiModel,
  );

  public *getStatements() {
    yield* this.generateServerClassDeclaration();
  }

  private *generateServerClassDeclaration() {
    const { factory: f } = this;

    yield f.createClassDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      f.createIdentifier("Server"),
      [
        f.createTypeParameterDeclaration(
          undefined,
          f.createIdentifier("Authorization"),
          f.createTypeReferenceNode(
            f.createIdentifier("ServerAuthorization"),
            undefined,
          ),
          f.createTypeReferenceNode(
            f.createIdentifier("ServerAuthorization"),
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
    yield* this.serverHandleMethodCodeGenerator.getStatements();
    yield* this.serverRouteHandleMethodsCodeGenerator.getStatements();
  }
}
