import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerMethodsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateHandleMethodDeclarations();
    yield* this.generateRegisterOperationMethodsDeclarations();
    yield* this.generateRegisterAuthorizationMethodsDeclarations();
    yield* this.generateRouteHandlersMethodsDeclarations();
  }

  //#region handle

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

  //#endregion

  //#region routes

  /**
   * all route handler functions
   */
  private *generateRouteHandlersMethodsDeclarations() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateRouteHandlersFunctionDeclarations(
          pathModel,
          operationModel,
        );
      }
    }
  }

  /**
   * single function to handle a route
   * @param pathModel
   * @param operationModel
   */
  private *generateRouteHandlersFunctionDeclarations(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const routeHandlerName = toCamel("handle", operationModel.name, "route");

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
      f.createBlock(
        [
          ...this.generateRouteHandlersFunctionStatements(
            pathModel,
            operationModel,
          ),
        ],
        true,
      ),
    );
  }

  /**
   * function statements for route handler
   * @param pathModel
   * @param operationModel
   */
  private *generateRouteHandlersFunctionStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const operationHandlerName = toCamel(
      "handle",
      operationModel.name,
      "operation",
    );

    const operationIncomingParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

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
                  f.createIdentifier("incomingRequest"),
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
                  f.createIdentifier("incomingRequest"),
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
                  f.createIdentifier("incomingRequest"),
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

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("requestHeaders"),
            undefined,
            undefined,
            f.createPropertyAccessExpression(
              f.createIdentifier("incomingRequest"),
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
                  f.createIdentifier("incomingRequest"),
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
              [f.createIdentifier("incomingOperationRequest")],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createThrowStatement(f.createStringLiteral("TODO"));
  }

  //#endregion

  //#region operations

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

    const operationHandlerName = toCamel(
      "handle",
      operationModel.name,
      "operation",
    );

    yield f.createExpressionStatement(
      f.createBinaryExpression(
        f.createPropertyAccessExpression(
          f.createThis(),
          f.createIdentifier(operationHandlerName),
        ),
        f.createToken(ts.SyntaxKind.EqualsToken),
        f.createIdentifier("operationHandler"),
      ),
    );
  }

  //#endregion

  //#region authorization

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

    const operationHandlerName = toCamel(
      "handle",
      authorizationModel.name,
      "authorization",
    );

    yield f.createExpressionStatement(
      f.createBinaryExpression(
        f.createPropertyAccessExpression(
          f.createThis(),
          f.createIdentifier(operationHandlerName),
        ),
        f.createToken(ts.SyntaxKind.EqualsToken),
        f.createIdentifier("authorizationHandler"),
      ),
    );
  }

  //#endregion
}
