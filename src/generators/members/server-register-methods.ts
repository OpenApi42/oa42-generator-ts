import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerRegisterMethodsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateRegisterOperationMethodsDeclarations();
    yield* this.generateRegisterAuthorizationMethodsDeclarations();
  }

  /**
   * register functions for all operation handlers
   */
  private *generateRegisterOperationMethodsDeclarations() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateRegisterOperationMethodDeclarations(
          pathModel,
          operationModel,
        );
      }
    }
  }

  /**
   * register functions for a single operation handler
   * @param pathModel
   * @param operationModel
   */
  private *generateRegisterOperationMethodDeclarations(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;
    const methodName = toCamel("register", operationModel.name, "operation");
    const operationHandlerTypeName = toPascal(
      operationModel.name,
      "operation",
      "handler",
    );

    // TODO add JsDoc

    yield f.createMethodDeclaration(
      [f.createToken(ts.SyntaxKind.PublicKeyword)],
      undefined,
      methodName,
      undefined,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          "operationHandler",
          undefined,
          f.createTypeReferenceNode(operationHandlerTypeName),
        ),
      ],
      undefined,
      f.createBlock(
        [
          ...this.generateRegisterOperationMethodStatements(
            pathModel,
            operationModel,
          ),
        ],
        true,
      ),
    );
  }

  /**
   * statements for registering an operation handler
   * @param pathModel
   * @param operationModel
   */
  private *generateRegisterOperationMethodStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const handlerName = toCamel(operationModel.name, "operation", "handler");

    yield f.createExpressionStatement(
      f.createBinaryExpression(
        f.createPropertyAccessExpression(
          f.createThis(),
          f.createIdentifier(handlerName),
        ),
        f.createToken(ts.SyntaxKind.EqualsToken),
        f.createIdentifier("operationHandler"),
      ),
    );
  }

  private *generateRegisterAuthorizationMethodsDeclarations() {
    for (const authorizationModel of this.apiModel.authorizations) {
      yield* this.generateRegisterAuthorizationMethodDeclarations(
        authorizationModel,
      );
    }
  }

  private *generateRegisterAuthorizationMethodDeclarations(
    authorizationModel: models.Authorization,
  ) {
    const { factory: f } = this;
    const methodName = toCamel(
      "register",
      authorizationModel.name,
      "authorization",
    );

    // TODO add JsDoc

    yield f.createMethodDeclaration(
      [f.createToken(ts.SyntaxKind.PublicKeyword)],
      undefined,
      methodName,
      undefined,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          "authorizationHandler",
          undefined,
          f.createFunctionTypeNode(
            undefined,
            [],
            f.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
          ),
        ),
      ],
      undefined,
      f.createBlock(
        [
          ...this.generateRegisterAuthorizationMethodStatements(
            authorizationModel,
          ),
        ],
        true,
      ),
    );
  }

  private *generateRegisterAuthorizationMethodStatements(
    authorizationModel: models.Authorization,
  ) {
    const { factory: f } = this;

    const handlerName = toCamel(
      authorizationModel.name,
      "authorization",
      "handler",
    );

    yield f.createExpressionStatement(
      f.createBinaryExpression(
        f.createPropertyAccessExpression(
          f.createThis(),
          f.createIdentifier(handlerName),
        ),
        f.createToken(ts.SyntaxKind.EqualsToken),
        f.createIdentifier("authorizationHandler"),
      ),
    );
  }
}
