import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

/**
 * This class generated methods for the server class that take a
 * `ServerIncomingRequest` and respond with a `ServerOutgoingRequest`. These
 * methods are basically a wrapper for the operation handlers. Authentication
 * is also triggered by these functions.
 */
export class ServerRouteHandleMethodsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateMethodsDeclarations();
  }

  /**
   * all route handler functions
   */
  private *generateMethodsDeclarations() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateMethodDeclarations(pathModel, operationModel);
      }
    }
  }

  /**
   * single function to handle a route
   * @param pathModel
   * @param operationModel
   */
  private *generateMethodDeclarations(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const routeHandlerName = toCamel(operationModel.name, "route", "handler");

    yield f.createMethodDeclaration(
      [f.createToken(ts.SyntaxKind.PrivateKeyword)],
      undefined,
      routeHandlerName,
      undefined,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          "routeParameters",
          undefined,
          f.createTypeReferenceNode("Record", [
            f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ]),
        ),
        f.createParameterDeclaration(
          undefined,
          undefined,
          "serverIncomingRequest",
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
      f.createBlock(
        [...this.generateMethodStatements(pathModel, operationModel)],
        true,
      ),
    );
  }

  /**
   * function statements for route handler
   * @param pathModel
   * @param operationModel
   */
  private *generateMethodStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const operationIncomingParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

    const operationHandlerName = toCamel(
      operationModel.name,
      "operation",
      "handler",
    );

    const operationAuthenticationName = toPascal(
      operationModel.name,
      "authentication",
    );

    /**
     * we check if the operation handler is available
     */

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("operationHandler"),
            undefined,
            undefined,
            f.createPropertyAccessExpression(
              f.createThis(),
              operationHandlerName,
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createIdentifier("operationHandler"),
        f.createToken(ts.SyntaxKind.EqualsEqualsToken),
        f.createNull(),
      ),
      f.createBlock(
        [
          f.createThrowStatement(
            f.createStringLiteral(
              `operation ${operationModel.name} not registered`,
            ),
          ),
        ],
        true,
      ),
    );

    /**
     * now lets construct the incoming request object, this object will be
     * passed to the operation handler later
     */

    /**
     * read some headers
     */

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestCookieHeader"),
            undefined,
            undefined,
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createIdentifier("lib"),
                f.createIdentifier("getParameterValue"),
              ),
              undefined,
              [
                f.createPropertyAccessExpression(
                  f.createIdentifier("serverIncomingRequest"),
                  f.createIdentifier("headers"),
                ),
                f.createStringLiteral("cookie"),
              ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestAcceptHeader"),
            undefined,
            undefined,
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createIdentifier("lib"),
                f.createIdentifier("getParameterValue"),
              ),
              undefined,
              [
                f.createPropertyAccessExpression(
                  f.createIdentifier("serverIncomingRequest"),
                  f.createIdentifier("headers"),
                ),
                f.createStringLiteral("accept"),
              ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestContentTypeHeader"),
            undefined,
            undefined,
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createIdentifier("lib"),
                f.createIdentifier("getParameterValue"),
              ),
              undefined,
              [
                f.createPropertyAccessExpression(
                  f.createIdentifier("serverIncomingRequest"),
                  f.createIdentifier("headers"),
                ),
                f.createStringLiteral("content-type"),
              ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    /**
     * now we put the raw parameters in variables, path parameters are already
     * present, they are in the methods arguments
     */

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestHeaders"),
            undefined,
            undefined,
            f.createPropertyAccessExpression(
              f.createIdentifier("serverIncomingRequest"),
              f.createIdentifier("headers"),
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestQuery"),
            undefined,
            undefined,
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createIdentifier("lib"),
                f.createIdentifier("parseParameters"),
              ),
              undefined,
              [
                f.createPropertyAccessExpression(
                  f.createIdentifier("serverIncomingRequest"),
                  f.createIdentifier("query"),
                ),
                f.createStringLiteral("&"),
                f.createStringLiteral("="),
              ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestCookie"),
            undefined,
            undefined,
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createIdentifier("lib"),
                f.createIdentifier("parseParameters"),
              ),
              undefined,
              [
                f.createBinaryExpression(
                  f.createIdentifier("requestCookieHeader"),
                  f.createToken(ts.SyntaxKind.QuestionQuestionToken),
                  f.createStringLiteral(""),
                ),
                f.createStringLiteral("; "),
                f.createStringLiteral("="),
              ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    /**
     * let's handle authentication
     */

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("authentication"),
            undefined,
            undefined,
            f.createAsExpression(
              f.createObjectLiteralExpression([]),
              f.createTypeReferenceNode(operationAuthenticationName, [
                f.createTypeReferenceNode("Authentication"),
              ]),
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    /**
     * create the request parameters object
     */

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestParameters"),
            undefined,
            f.createTypeReferenceNode(
              f.createQualifiedName(
                f.createIdentifier("shared"),
                f.createIdentifier(operationIncomingParametersName),
              ),
            ),
            undefined,
          ),
        ],
        ts.NodeFlags.Let,
      ),
    );

    yield f.createTryStatement(
      f.createBlock(
        [
          f.createExpressionStatement(
            f.createBinaryExpression(
              f.createIdentifier("requestParameters"),
              f.createToken(ts.SyntaxKind.EqualsToken),
              f.createObjectLiteralExpression(
                [
                  ...operationModel.pathParameters.map((parameterModel) =>
                    f.createPropertyAssignment(
                      toCamel(parameterModel.name),
                      f.createElementAccessExpression(
                        f.createIdentifier("routeParameters"),
                        f.createStringLiteral(parameterModel.name),
                      ),
                    ),
                  ),
                  ...operationModel.headerParameters.map((parameterModel) =>
                    f.createPropertyAssignment(
                      toCamel(parameterModel.name),
                      f.createElementAccessExpression(
                        f.createIdentifier("requestHeaders"),
                        f.createStringLiteral(parameterModel.name),
                      ),
                    ),
                  ),
                  ...operationModel.queryParameters.map((parameterModel) =>
                    f.createPropertyAssignment(
                      toCamel(parameterModel.name),
                      f.createElementAccessExpression(
                        f.createIdentifier("requestQuery"),
                        f.createStringLiteral(parameterModel.name),
                      ),
                    ),
                  ),
                  ...operationModel.cookieParameters.map((parameterModel) =>
                    f.createPropertyAssignment(
                      toCamel(parameterModel.name),
                      f.createElementAccessExpression(
                        f.createIdentifier("requestCookie"),
                        f.createStringLiteral(parameterModel.name),
                      ),
                    ),
                  ),
                ],
                true,
              ),
            ),
          ),
        ],
        true,
      ),
      f.createCatchClause(
        undefined,
        f.createBlock(
          [
            f.createThrowStatement(
              f.createNewExpression(f.createIdentifier("Error"), undefined, [
                f.createStringLiteral("parameter error"),
              ]),
            ),
          ],
          true,
        ),
      ),
      undefined,
    );

    /**
     * now lets construct the incoming request object, this object will be
     * passed to the operation handler later
     */

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("incomingOperationRequest"),
            undefined,
            undefined,
            f.createNull(),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    /**
     * execute the operation handler and collect the response
     */

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("outgoingOperationResponse"),
            undefined,
            undefined,
            f.createCallExpression(
              f.createIdentifier("operationHandler"),
              undefined,
              [
                f.createIdentifier("incomingOperationRequest"),
                f.createIdentifier("authentication"),
              ],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("serverOutgoingResponse"),
            undefined,
            undefined,
            f.createNull(),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createThrowStatement(f.createStringLiteral("TODO"));
    // yield f.createReturnStatement(f.createIdentifier("serverOutgoingResponse"));
  }
}
