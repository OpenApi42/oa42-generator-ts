import camelcase from "camelcase";
import ts from "typescript";
import * as models from "../models/index.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

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

    yield* this.generateServerAuthorizationType();
    yield* this.generateServerClassDeclaration();
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
      undefined,
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
          "path",
          undefined,
          f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ),
        f.createParameterDeclaration(
          undefined,
          undefined,
          "method",
          undefined,
          f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ),
      ],
      undefined,
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
              [f.createIdentifier("path")],
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
          f.createIdentifier("method"),
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
      const routeHandlerName = camelcase(`handle ${operationModel.id} route`);

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
              [f.createIdentifier("routeParameters")],
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

    const routeHandlerName = camelcase(`handle ${operationModel.id} route`);

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
      ],
      undefined,
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

    const operationHandlerName = camelcase(
      `handle ${operationModel.id} operation`,
    );

    const routeHandlerExpression = f.createPropertyAccessExpression(
      f.createThis(),
      operationHandlerName,
    );

    yield f.createIfStatement(
      f.createBinaryExpression(
        routeHandlerExpression,
        f.createToken(ts.SyntaxKind.EqualsEqualsToken),
        f.createNull(),
      ),
      f.createBlock(
        [
          f.createThrowStatement(
            f.createStringLiteral(
              `operation ${operationModel.id} not registered`,
            ),
          ),
        ],
        true,
      ),
    );

    yield f.createReturnStatement(
      f.createCallExpression(routeHandlerExpression, undefined, undefined),
    );
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
    const methodName = camelcase(`register ${operationModel.id} operation`);

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

    const operationHandlerName = camelcase(
      `handle ${operationModel.id} operation`,
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

    const operationHandlerName = camelcase(
      `handle ${operationModel.id} operation`,
    );

    yield f.createPropertyDeclaration(
      [f.createToken(ts.SyntaxKind.PrivateKeyword)],
      f.createIdentifier(operationHandlerName),
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
    const methodName = camelcase(
      `register ${authorizationModel.name} authorization`,
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

    const operationHandlerName = camelcase(
      `handle ${authorizationModel.name} authorization`,
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

    const authorizationHandlerName = camelcase(
      `handle ${authorizationModel.name} authorization`,
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