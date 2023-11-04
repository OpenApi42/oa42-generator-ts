import ts from "typescript";
import * as models from "../../models/index.js";
import { Code, toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class IsParametersCodeGenerator extends CodeGeneratorBase {
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
    yield* this.generateFunctionDeclarations();
  }

  private *generateFunctionDeclarations() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateFunctionDeclaration(pathModel, operationModel);
      }
    }
  }

  private *generateFunctionDeclaration(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const functionName = toCamel(
      "is",
      operationModel.name,
      "request",
      "parameters",
    );

    const typeName = toPascal(operationModel.name, "request", "parameters");

    yield f.createFunctionDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      functionName,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          f.createIdentifier("requestParameters"),
          undefined,
          f.createTypeReferenceNode("Partial", [
            f.createTypeReferenceNode(f.createIdentifier("Record"), [
              f.createTypeOperatorNode(
                ts.SyntaxKind.KeyOfKeyword,
                f.createTypeReferenceNode(
                  f.createIdentifier(typeName),
                  undefined,
                ),
              ),
              f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ]),
          ]),
        ),
      ],
      f.createTypePredicateNode(
        undefined,
        f.createIdentifier("requestParameters"),
        f.createTypeReferenceNode(typeName),
      ),
      f.createBlock(
        [...this.generateFunctionStatements(pathModel, operationModel)],
        true,
      ),
    );
  }

  private *generateFunctionStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const allParameterModels = [
      ...operationModel.queryParameters,
      ...operationModel.headerParameters,
      ...operationModel.pathParameters,
      ...operationModel.cookieParameters,
    ];

    for (const parameterModel of allParameterModels) {
      const parameterSchemaId = parameterModel.schemaId;
      const parameterTypeName =
        parameterSchemaId == null
          ? parameterSchemaId
          : this.apiModel.names[parameterSchemaId];
      if (parameterTypeName == null) {
        continue;
      }

      const isFunctionName = `is${parameterTypeName}`;

      const parameterPropertyName = toCamel(parameterModel.name);

      if (parameterModel.required) {
        yield f.createIfStatement(
          f.createBinaryExpression(
            f.createPropertyAccessExpression(
              f.createIdentifier("requestParameters"),
              parameterPropertyName,
            ),
            f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
            f.createIdentifier("undefined"),
          ),
          f.createBlock([f.createReturnStatement(f.createFalse())], true),
          undefined,
        );
      }

      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(isFunctionName),
            undefined,
            [
              f.createPropertyAccessExpression(
                f.createIdentifier("requestParameters"),
                parameterPropertyName,
              ),
            ],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }
}
