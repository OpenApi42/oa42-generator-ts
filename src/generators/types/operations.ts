import ts from "typescript";
import * as models from "../../models/index.js";
import { Code } from "../../utils/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class OperationsTypeCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });

    const sourceFile = this.factory.createSourceFile(
      [...this.getStatements()],
      this.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    );

    yield new Code(printer.printFile(sourceFile));
  }

  public *getStatements() {
    yield* this.generateOperationsTypes();
  }

  private *generateOperationsTypes() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationTypes(pathModel, operationModel);
      }
    }
  }

  private *generateOperationTypes(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const handlerTypeName = toPascal(
      operationModel.name,
      "operation",
      "handler",
    );

    const operationAuthenticationName = toPascal(
      operationModel.name,
      "authentication",
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
      handlerTypeName,
      [
        f.createTypeParameterDeclaration(
          undefined,
          "A",
          f.createTypeReferenceNode("ServerAuthentication"),
        ),
      ],
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
          f.createParameterDeclaration(
            undefined,
            undefined,
            "authentication",
            undefined,
            f.createTypeReferenceNode(operationAuthenticationName, [
              f.createTypeReferenceNode("A"),
            ]),
          ),
        ],
        f.createTypeReferenceNode(operationOutgoingResponseName),
      ),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationAuthenticationName,
      [
        f.createTypeParameterDeclaration(
          undefined,
          "A",
          f.createTypeReferenceNode("ServerAuthentication"),
        ),
      ],
      operationModel.authenticationRequirements.length > 0
        ? f.createUnionTypeNode(
            operationModel.authenticationRequirements.map((requirements) =>
              f.createTypeReferenceNode("Pick", [
                f.createTypeReferenceNode("A"),
                requirements.length > 0
                  ? f.createUnionTypeNode(
                      requirements.map((requirement) =>
                        f.createLiteralTypeNode(
                          f.createStringLiteral(
                            toCamel(requirement.authenticationName),
                          ),
                        ),
                      ),
                    )
                  : f.createTypeLiteralNode([]),
              ]),
            ),
          )
        : f.createTypeLiteralNode([]),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationIncomingRequestName,
      undefined,
      f.createUnionTypeNode([...this.generateRequestTypes(operationModel)]),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationOutgoingResponseName,
      undefined,
      f.createUnionTypeNode([...this.generateResponseTypes(operationModel)]),
    );
  }

  private *generateRequestTypes(operationModel: models.Operation) {
    const { factory: f } = this;

    const operationIncomingParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

    for (const bodyModel of operationModel.bodies) {
      yield* this.generateRequestBodies(operationModel, bodyModel);
    }

    yield f.createTypeReferenceNode(
      f.createQualifiedName(f.createIdentifier("lib"), "IncomingEmptyRequest"),
      [
        f.createTypeReferenceNode(
          f.createQualifiedName(
            f.createIdentifier("shared"),
            operationIncomingParametersName,
          ),
        ),
      ],
    );
  }

  private *generateResponseTypes(operationModel: models.Operation) {
    const { factory: f } = this;

    if (operationModel.operationResults.length === 0) {
      yield f.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
    }

    for (const operationResultModel of operationModel.operationResults) {
      if (operationResultModel.bodies.length === 0) {
        yield* this.generateResponseBodies(
          operationModel,
          operationResultModel,
        );
      }

      for (const bodyModel of operationResultModel.bodies) {
        yield* this.generateResponseBodies(
          operationModel,
          operationResultModel,
          bodyModel,
        );
      }
    }
  }

  private *generateRequestBodies(
    operationModel: models.Operation,
    bodyModel?: models.Body,
  ) {
    const { factory: f } = this;

    const operationIncomingParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

    if (bodyModel == null) {
      yield f.createTypeReferenceNode(
        f.createQualifiedName(
          f.createIdentifier("lib"),
          "IncomingEmptyRequest",
        ),
        [
          f.createTypeReferenceNode(
            f.createQualifiedName(
              f.createIdentifier("shared"),
              operationIncomingParametersName,
            ),
          ),
        ],
      );
      return;
    }

    switch (bodyModel.contentType) {
      case "plain/text": {
        yield f.createTypeReferenceNode(
          f.createQualifiedName(
            f.createIdentifier("lib"),
            "IncomingTextRequest",
          ),
          [
            f.createTypeReferenceNode(
              f.createQualifiedName(
                f.createIdentifier("shared"),
                operationIncomingParametersName,
              ),
            ),
            f.createLiteralTypeNode(
              f.createStringLiteral(bodyModel.contentType),
            ),
          ],
        );
        break;
      }
      case "application/json": {
        const bodySchemaId = bodyModel.schemaId;
        const bodyTypeName =
          bodySchemaId == null
            ? bodySchemaId
            : this.apiModel.names[bodySchemaId];

        yield f.createTypeReferenceNode(
          f.createQualifiedName(
            f.createIdentifier("lib"),
            "IncomingJsonRequest",
          ),
          [
            f.createTypeReferenceNode(
              f.createQualifiedName(
                f.createIdentifier("shared"),
                operationIncomingParametersName,
              ),
            ),
            f.createLiteralTypeNode(
              f.createStringLiteral(bodyModel.contentType),
            ),
            bodyTypeName == null
              ? f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
              : f.createTypeReferenceNode(
                  f.createQualifiedName(
                    f.createIdentifier("shared"),
                    bodyTypeName,
                  ),
                ),
          ],
        );
        break;
      }

      default: {
        yield f.createTypeReferenceNode(
          f.createQualifiedName(
            f.createIdentifier("lib"),
            "IncomingStreamRequest",
          ),
          [
            f.createTypeReferenceNode(
              f.createQualifiedName(
                f.createIdentifier("shared"),
                operationIncomingParametersName,
              ),
            ),
            f.createLiteralTypeNode(
              f.createStringLiteral(bodyModel.contentType),
            ),
          ],
        );
        break;
      }
    }
  }

  private *generateResponseBodies(
    operationModel: models.Operation,
    operationResultModel: models.OperationResult,
    bodyModel?: models.Body,
  ) {
    const { factory: f } = this;

    const operationOutgoingParametersName = toPascal(
      operationModel.name,
      operationResultModel.statusKind,
      "response",
      "parameters",
    );

    if (bodyModel == null) {
      yield f.createTypeReferenceNode(
        f.createQualifiedName(
          f.createIdentifier("lib"),
          "OutgoingEmptyResponse",
        ),
        [
          f.createUnionTypeNode(
            operationResultModel.statusCodes.map((statusCode) =>
              f.createLiteralTypeNode(f.createNumericLiteral(statusCode)),
            ),
          ),
          f.createTypeReferenceNode(
            f.createQualifiedName(
              f.createIdentifier("shared"),
              operationOutgoingParametersName,
            ),
          ),
        ],
      );
      return;
    }

    switch (bodyModel.contentType) {
      case "plain/text": {
        yield f.createTypeReferenceNode(
          f.createQualifiedName(
            f.createIdentifier("lib"),
            "OutgoingTextResponse",
          ),
          [
            f.createUnionTypeNode(
              operationResultModel.statusCodes.map((statusCode) =>
                f.createLiteralTypeNode(f.createNumericLiteral(statusCode)),
              ),
            ),
            f.createTypeReferenceNode(
              f.createQualifiedName(
                f.createIdentifier("shared"),
                operationOutgoingParametersName,
              ),
            ),
            f.createLiteralTypeNode(
              f.createStringLiteral(bodyModel.contentType),
            ),
          ],
        );
        break;
      }
      case "application/json": {
        const bodySchemaId = bodyModel.schemaId;
        const bodyTypeName =
          bodySchemaId == null
            ? bodySchemaId
            : this.apiModel.names[bodySchemaId];

        yield f.createTypeReferenceNode(
          f.createQualifiedName(
            f.createIdentifier("lib"),
            "OutgoingJsonResponse",
          ),
          [
            f.createUnionTypeNode(
              operationResultModel.statusCodes.map((statusCode) =>
                f.createLiteralTypeNode(f.createNumericLiteral(statusCode)),
              ),
            ),
            f.createTypeReferenceNode(
              f.createQualifiedName(
                f.createIdentifier("shared"),
                operationOutgoingParametersName,
              ),
            ),
            f.createLiteralTypeNode(
              f.createStringLiteral(bodyModel.contentType),
            ),
            bodyTypeName == null
              ? f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
              : f.createTypeReferenceNode(
                  f.createQualifiedName(
                    f.createIdentifier("shared"),
                    bodyTypeName,
                  ),
                ),
          ],
        );
        break;
      }

      default: {
        yield f.createTypeReferenceNode(
          f.createQualifiedName(
            f.createIdentifier("lib"),
            "OutgoingStreamResponse",
          ),
          [
            f.createUnionTypeNode(
              operationResultModel.statusCodes.map((statusCode) =>
                f.createLiteralTypeNode(f.createNumericLiteral(statusCode)),
              ),
            ),
            f.createTypeReferenceNode(
              f.createQualifiedName(
                f.createIdentifier("shared"),
                operationOutgoingParametersName,
              ),
            ),
            f.createLiteralTypeNode(
              f.createStringLiteral(bodyModel.contentType),
            ),
          ],
        );
        break;
      }
    }
  }
}
