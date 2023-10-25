import ts from "typescript";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerPropertiesCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateRouterPropertyStatements();
  }

  /**
   * the router property
   */
  protected *generateRouterPropertyStatements() {
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
}
