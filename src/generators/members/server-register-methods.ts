import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerRegisterMethodsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateRegisterAuthenticationMethodsDeclarations();
    yield* this.generateRegisterOperationMethodsDeclarations();
  }

  private *generateRegisterAuthenticationMethodsDeclarations() {
    for (const authenticationModel of this.apiModel.authentication) {
      yield* this.generateRegisterAuthenticationMethodDeclarations(
        authenticationModel,
      );
    }
  }

  private *generateRegisterAuthenticationMethodDeclarations(
    authenticationModel: models.Authentication,
  ) {
    const { factory: f } = this;
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
          "authenticationHandler",
          undefined,
          f.createTypeReferenceNode(handlerTypeName, [
            f.createTypeReferenceNode(
              f.createIdentifier("Authentication"),
              undefined,
            ),
          ]),
        ),
      ],
      undefined,
      f.createBlock(
        [
          ...this.generateRegisterAuthenticationMethodStatements(
            authenticationModel,
          ),
        ],
        true,
      ),
    );
  }

  private *generateRegisterAuthenticationMethodStatements(
    authenticationModel: models.Authentication,
  ) {
    const { factory: f } = this;

    const handlerName = toCamel(
      authenticationModel.name,
      "authentication",
      "handler",
    );

    yield f.createExpressionStatement(
      f.createBinaryExpression(
        f.createPropertyAccessExpression(
          f.createThis(),
          f.createIdentifier(handlerName),
        ),
        f.createToken(ts.SyntaxKind.EqualsToken),
        f.createIdentifier("authenticationHandler"),
      ),
    );
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
    const handlerTypeName = toPascal(
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
          f.createTypeReferenceNode(handlerTypeName, [
            f.createTypeReferenceNode(
              f.createIdentifier("Authentication"),
              undefined,
            ),
          ]),
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
}
