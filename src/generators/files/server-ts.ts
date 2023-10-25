import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    const { factory: f } = this;

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamedImports([
          f.createImportSpecifier(
            false,
            undefined,
            f.createIdentifier("Router"),
          ),
        ]),
      ),
      f.createStringLiteral("goodrouter"),
    );

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamespaceImport(f.createIdentifier("shared")),
      ),
      f.createStringLiteral("./shared.js"),
    );

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamespaceImport(f.createIdentifier("lib")),
      ),
      f.createStringLiteral("@oa42/oa42-lib"),
    );

    yield* this.generateServerAuthorizationType();
    yield* this.generateServerClassDeclaration();
    yield* this.generateOperationsTypes();
  }

  //#region exports

  protected *generateServerAuthorizationType() {
    const { factory: f } = this;

    const authorizationRecordKeyType =
      this.apiModel.authorizations.length > 0
        ? f.createUnionTypeNode(
            this.apiModel.authorizations.map((authorizationModel) =>
              f.createLiteralTypeNode(
                f.createStringLiteral(authorizationModel.name),
              ),
            ),
          )
        : f.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      "ServerAuthorization",
      undefined,
      f.createTypeReferenceNode("Record", [
        authorizationRecordKeyType,
        f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
      ]),
    );
  }

  protected *generateServerClassDeclaration() {
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

  protected *generateServerElementsDeclarations() {
    yield* this.generateRouterPropertyStatements();
    yield* this.generateConstructorDeclaration();
    yield* this.generateHandleMethodDeclarations();
    yield* this.generateRegisterOperationMethodsDeclarations();
    yield* this.generateRegisterAuthorizationMethodsDeclarations();
    yield* this.generateRouteHandlersMethodsDeclarations();
    yield* this.generateOperationHandlersPropertiesStatements();
    yield* this.generateAuthorizationHandlersPropertiesStatements();
  }

  protected *generateOperationsTypes() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationTypes(pathModel, operationModel);
      }
    }
  }

  protected *generateOperationTypes(
    pathMode: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const operationHandlerTypeName = toPascal(
      operationModel.name,
      "operation",
      "handler",
    );

    const operationIncomingRequestName = toPascal(
      operationModel.name,
      "incoming",
      "request",
    );

    const operationOutgoingResponseName = toPascal(
      operationModel.name,
      "outgoing",
      "response",
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationHandlerTypeName,
      undefined,
      f.createFunctionTypeNode(
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "incomingRequest",
            undefined,
            f.createTypeReferenceNode(operationIncomingRequestName),
          ),
        ],
        f.createTypeReferenceNode(operationOutgoingResponseName),
      ),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationIncomingRequestName,
      undefined,
      f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationOutgoingResponseName,
      undefined,
      f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    );
  }

  //#endregion

  //#region properties

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

  //#endregion

  //#region constructor

  protected *generateConstructorDeclaration() {
    const { factory } = this;

    yield factory.createConstructorDeclaration(
      undefined,
      [],
      factory.createBlock([...this.generateConstructorStatements()], true),
    );
  }

  protected *generateConstructorStatements() {
    const { factory: f } = this;

    yield f.createExpressionStatement(
      f.createCallExpression(f.createSuper(), undefined, undefined),
    );

    for (
      let pathIndex = 0;
      pathIndex < this.apiModel.paths.length;
      pathIndex++
    ) {
      const pathModel = this.apiModel.paths[pathIndex];
      yield f.createExpressionStatement(
        f.createCallExpression(
          f.createPropertyAccessExpression(
            f.createPropertyAccessExpression(f.createThis(), "router"),
            f.createIdentifier("insertRoute"),
          ),
          undefined,
          [
            f.createNumericLiteral(pathIndex + 1),
            f.createStringLiteral(pathModel.pattern),
          ],
        ),
      );
    }
  }

  //#endregion

  //#region handle

  /**
   * generate handler for incoming requests
   */
  protected *generateHandleMethodDeclarations() {
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
  protected *generateHandlerFunctionStatements() {
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
  protected *generateHandleMethodPathCaseClauses() {
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
  protected *generateHandleMethodOperationCaseClauses(pathModel: models.Path) {
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
  protected *generateRouteHandlersMethodsDeclarations() {
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
  protected *generateRouteHandlersFunctionDeclarations(
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
  protected *generateRouteHandlersFunctionStatements(
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
  protected *generateRegisterOperationMethodsDeclarations() {
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
  protected *generateRegisterOperationMethodDeclarations(
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
  protected *generateRegisterOperationMethodStatements(
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

  /**
   * operation handler properties that may contain operation handlers
   */
  protected *generateOperationHandlersPropertiesStatements() {
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
  protected *generateOperationHandlersPropertyStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const operationHandlerPropertyName = toCamel(
      "handle",
      operationModel.name,
      "operation",
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

  //#endregion

  //#region authorization

  protected *generateRegisterAuthorizationMethodsDeclarations() {
    for (const authorizationModel of this.apiModel.authorizations) {
      yield* this.generateRegisterAuthorizationMethodDeclarations(
        authorizationModel,
      );
    }
  }

  protected *generateRegisterAuthorizationMethodDeclarations(
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

  protected *generateRegisterAuthorizationMethodStatements(
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

  protected *generateAuthorizationHandlersPropertiesStatements() {
    for (const authorizationModel of this.apiModel.authorizations) {
      yield* this.generateAuthorizationHandlersPropertyStatements(
        authorizationModel,
      );
    }
  }

  protected *generateAuthorizationHandlersPropertyStatements(
    authorizationModel: models.Authorization,
  ) {
    const { factory: f } = this;

    const authorizationHandlerName = toCamel(
      "handle",
      authorizationModel.name,
      "authorization",
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

  //#endregion
}
