import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

/**
 * This class generated methods for the server class that take a
 * `ServerIncomingRequest` and respond with a `ServerOutgoingRequest`. These
 * methods are basically a wrapper for the operation handlers
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

    const operationHandlerName = toCamel(
      operationModel.name,
      "operation",
      "handler",
    );

    const intoIncomingFunctionName = toCamel(
      "into",
      "incoming",
      operationModel.name,
      "request",
    );

    const intoOutgoingFunctionName = toCamel(
      "into",
      "outgoing",
      operationModel.name,
      "response",
    );

    /**
     * first we check if the operation handler is available
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

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("incomingOperationRequest"),
            undefined,
            undefined,
            f.createCallExpression(
              f.createIdentifier(intoIncomingFunctionName),
              undefined,
              [
                f.createIdentifier("routeParameters"),
                f.createIdentifier("serverIncomingRequest"),
              ],
            ),
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
              [f.createIdentifier("incomingOperationRequest")],
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
            f.createCallExpression(
              f.createIdentifier(intoOutgoingFunctionName),
              undefined,
              [f.createIdentifier("outgoingOperationResponse")],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    yield f.createReturnStatement(f.createIdentifier("serverOutgoingResponse"));
  }
}
