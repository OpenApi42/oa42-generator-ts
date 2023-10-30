import camelcase from "camelcase";
import ts from "typescript";
import * as models from "../../models/index.js";
import { toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ParametersCodeGenerator extends CodeGeneratorBase {
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

    const allParameterModels = [
      ...operationModel.queryParameters,
      ...operationModel.headerParameters,
      ...operationModel.pathParameters,
      ...operationModel.cookieParameters,
    ];

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationIncomingParametersName,
      undefined,
      f.createTypeLiteralNode(
        allParameterModels.map((parameterModel) =>
          f.createPropertySignature(
            undefined,
            camelcase(parameterModel.name),
            parameterModel.required
              ? undefined
              : f.createToken(ts.SyntaxKind.QuestionToken),
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ),
      ),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationOutgoingParametersName,
      undefined,
      f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    );
  }
}
