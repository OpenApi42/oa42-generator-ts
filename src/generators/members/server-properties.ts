import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerPropertiesCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateRouterPropertyStatements();
    yield* this.generateOperationHandlersPropertiesStatements();
    yield* this.generateAuthorizationHandlersPropertiesStatements();
  }

  /**
   * the router property
   */
  private *generateRouterPropertyStatements() {
    const { factory: f } = this;

    const identityFunctionExpression = f.createArrowFunction(
      undefined,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          f.createIdentifier("value"),
          undefined,
          undefined,
          undefined,
        ),
      ],
      undefined,
      f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      f.createIdentifier("value"),
    );

    let newRouterExpression: ts.Expression = f.createNewExpression(
      f.createIdentifier("Router"),
      [f.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)],
      [
        f.createObjectLiteralExpression(
          [
            f.createPropertyAssignment(
              f.createIdentifier("parameterValueDecoder"),
              identityFunctionExpression,
            ),
            f.createPropertyAssignment(
              f.createIdentifier("parameterValueEncoder"),
              identityFunctionExpression,
            ),
          ],
          true,
        ),
      ],
    );

    yield f.createPropertyDeclaration(
      [f.createToken(ts.SyntaxKind.PrivateKeyword)],
      f.createIdentifier("router"),
      undefined,
      undefined,
      newRouterExpression,
    );
  }

  /**
   * operation handler properties that may contain operation handlers
   */
  private *generateOperationHandlersPropertiesStatements() {
    const { factory: f } = this;

    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationHandlersPropertyStatements(
          pathModel,
          operationModel,
        );
      }
    }
  }

  /**
   * a single property yo hold the operation handler
   * @param pathModel
   * @param operationModel
   */
  private *generateOperationHandlersPropertyStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const operationHandlerPropertyName = toCamel(
      operationModel.name,
      "operation",
      "handler",
    );
    const operationHandlerTypeName = toPascal(
      operationModel.name,
      "operation",
      "handler",
    );

    yield f.createPropertyDeclaration(
      [f.createToken(ts.SyntaxKind.PrivateKeyword)],
      f.createIdentifier(operationHandlerPropertyName),
      f.createToken(ts.SyntaxKind.QuestionToken),
      f.createTypeReferenceNode(operationHandlerTypeName),
      undefined,
    );
  }

  private *generateAuthorizationHandlersPropertiesStatements() {
    for (const authorizationModel of this.apiModel.authorizations) {
      yield* this.generateAuthorizationHandlersPropertyStatements(
        authorizationModel,
      );
    }
  }

  private *generateAuthorizationHandlersPropertyStatements(
    authorizationModel: models.Authorization,
  ) {
    const { factory: f } = this;

    const authorizationHandlerName = toCamel(
      authorizationModel.name,
      "authorization",
      "handler",
    );

    yield f.createPropertyDeclaration(
      [f.createToken(ts.SyntaxKind.PrivateKeyword)],
      f.createIdentifier(authorizationHandlerName),
      f.createToken(ts.SyntaxKind.QuestionToken),
      f.createFunctionTypeNode(
        undefined,
        [],
        f.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
      ),
      undefined,
    );
  }
}
