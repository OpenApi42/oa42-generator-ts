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
        for (const operationResultModel of operationModel.operationResults) {
          yield* this.generateOperationResultTypes(
            pathModel,
            operationModel,
            operationResultModel,
          );
        }
      }
    }
  }

  private *generateOperationTypes(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const operationRequestParametersName = toPascal(
      operationModel.name,
      "request",
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
      operationRequestParametersName,
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
  }

  private *generateOperationResultTypes(
    pathModel: models.Path,
    operationModel: models.Operation,
    operationResultModel: models.OperationResult,
  ) {
    const { factory: f } = this;

    const operationResponseParametersName = toPascal(
      operationModel.name,
      operationResultModel.statusKind,
      "response",
      "parameters",
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationResponseParametersName,
      undefined,
      f.createTypeLiteralNode(
        operationResultModel.headerParameters.map((parameterModel) =>
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
  }
}
