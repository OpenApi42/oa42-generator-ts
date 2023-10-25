import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerHandleMethodCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateHandleMethodDeclarations();
  }

  /**
   * generate handler for incoming requests
   */
  private *generateHandleMethodDeclarations() {
    const { factory: f } = this;

    yield f.createMethodDeclaration(
      [f.createToken(ts.SyntaxKind.PublicKeyword)],
      undefined,
      "handle",
      undefined,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          "incomingRequest",
          undefined,
          f.createTypeReferenceNode(
            f.createQualifiedName(
              f.createIdentifier("lib"),
              f.createIdentifier("ServerIncomingRequest"),
            ),
          ),
        ),
      ],
      f.createTypeReferenceNode(
        f.createQualifiedName(
          f.createIdentifier("lib"),
          f.createIdentifier("ServerOutgoingResponse"),
        ),
        undefined,
      ),
      f.createBlock([...this.generateHandlerFunctionStatements()], true),
    );
  }
  private *generateHandlerFunctionStatements() {
    const { factory: f } = this;

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createArrayBindingPattern([
              f.createBindingElement(
                undefined,
                undefined,
                f.createIdentifier("routeKey"),
                undefined,
              ),
              f.createBindingElement(
                undefined,
                undefined,
                f.createIdentifier("routeParameters"),
                undefined,
              ),
            ]),
            undefined,
            undefined,
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createPropertyAccessExpression(
                  f.createThis(),
                  f.createIdentifier("router"),
                ),
                f.createIdentifier("parseRoute"),
              ),
              undefined,
              [
                f.createPropertyAccessExpression(
                  f.createIdentifier("incomingRequest"),
                  f.createIdentifier("path"),
                ),
              ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createSwitchStatement(
      f.createIdentifier("routeKey"),
      f.createCaseBlock([...this.generateHandleMethodPathCaseClauses()]),
    );
  }
  private *generateHandleMethodPathCaseClauses() {
    const { factory: f } = this;

    for (
      let pathIndex = 0;
      pathIndex < this.apiModel.paths.length;
      pathIndex++
    ) {
      const pathModel = this.apiModel.paths[pathIndex];
      yield f.createCaseClause(f.createNumericLiteral(pathIndex + 1), [
        f.createSwitchStatement(
          f.createPropertyAccessExpression(
            f.createIdentifier("incomingRequest"),
            f.createIdentifier("method"),
          ),
          f.createCaseBlock([
            ...this.generateHandleMethodOperationCaseClauses(pathModel),
          ]),
        ),
      ]);
    }

    yield f.createDefaultClause([
      f.createThrowStatement(f.createStringLiteral("not found")),
    ]);
  }
  private *generateHandleMethodOperationCaseClauses(pathModel: models.Path) {
    const { factory: f } = this;

    for (const operationModel of pathModel.operations) {
      const routeHandlerName = toCamel("handle", operationModel.name, "route");

      yield f.createCaseClause(
        f.createStringLiteral(operationModel.method.toUpperCase()),
        [
          f.createReturnStatement(
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createThis(),
                routeHandlerName,
              ),
              undefined,
              [
                f.createIdentifier("routeParameters"),
                f.createIdentifier("incomingRequest"),
              ],
            ),
          ),
        ],
      );
    }

    yield f.createDefaultClause([
      f.createThrowStatement(f.createStringLiteral("method not supported")),
    ]);
  }
}
