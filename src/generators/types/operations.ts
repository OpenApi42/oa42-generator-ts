import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class OperationsTypeCodeGenerator extends CodeGeneratorBase {
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

    const operationIncomingParametersName = toPascal(
      operationModel.name,
      "request",
      "parameters",
    );

    const operationOutgoingParametersName = toPascal(
      operationModel.name,
      "response",
      "parameters",
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
      f.createTypeReferenceNode(
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
      ),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationOutgoingResponseName,
      undefined,
      operationModel.operationResults.length > 0
        ? f.createUnionTypeNode(
            operationModel.operationResults.flatMap((operationResultModel) => {
              const operationOutgoingParametersName = toPascal(
                operationModel.name,
                operationResultModel.statusKind,
                "response",
                "parameters",
              );

              if (operationResultModel.bodies.length === 0) {
                return [
                  f.createTypeReferenceNode(
                    f.createQualifiedName(
                      f.createIdentifier("lib"),
                      "OutgoingEmptyResponse",
                    ),
                    [
                      f.createUnionTypeNode(
                        operationResultModel.statusCodes.map((statusCode) =>
                          f.createLiteralTypeNode(
                            f.createNumericLiteral(statusCode),
                          ),
                        ),
                      ),
                      f.createTypeReferenceNode(
                        f.createQualifiedName(
                          f.createIdentifier("shared"),
                          operationOutgoingParametersName,
                        ),
                      ),
                    ],
                  ),
                ];
              } else {
                return operationResultModel.bodies.map((bodyModel) => {
                  switch (bodyModel.contentType) {
                    case "plain/text": {
                      return f.createTypeReferenceNode(
                        f.createQualifiedName(
                          f.createIdentifier("lib"),
                          "OutgoingTextResponse",
                        ),
                        [
                          f.createUnionTypeNode(
                            operationResultModel.statusCodes.map((statusCode) =>
                              f.createLiteralTypeNode(
                                f.createNumericLiteral(statusCode),
                              ),
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
                    }
                    case "application/json": {
                      const bodySchemaId = bodyModel.schemaId;
                      const bodyTypeName =
                        bodySchemaId == null
                          ? bodySchemaId
                          : this.apiModel.names[bodySchemaId];

                      return f.createTypeReferenceNode(
                        f.createQualifiedName(
                          f.createIdentifier("lib"),
                          "OutgoingJsonResponse",
                        ),
                        [
                          f.createUnionTypeNode(
                            operationResultModel.statusCodes.map((statusCode) =>
                              f.createLiteralTypeNode(
                                f.createNumericLiteral(statusCode),
                              ),
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
                            ? f.createKeywordTypeNode(
                                ts.SyntaxKind.UnknownKeyword,
                              )
                            : f.createTypeReferenceNode(
                                f.createQualifiedName(
                                  f.createIdentifier("shared"),
                                  bodyTypeName,
                                ),
                              ),
                        ],
                      );
                    }

                    default:
                      return f.createKeywordTypeNode(
                        ts.SyntaxKind.UnknownKeyword,
                      );
                  }
                });
              }
            }),
          )
        : f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    );
  }
}
