import camelcase from "camelcase";
import ts from "typescript";
import * as models from "../models/index.js";
import { toPascal } from "../utils/name.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class SharedTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    const { factory: f } = this;

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamespaceImport(f.createIdentifier("lib")),
      ),
      f.createStringLiteral("@oa42/oa42-lib"),
    );

    yield* this.generateOperationsTypes();
  }

  //#region exports

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

    const allParameters = [
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
        allParameters.map((parameter) =>
          f.createPropertySignature(
            undefined,
            camelcase(parameter.name),
            f.createToken(ts.SyntaxKind.QuestionToken),
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

  //#endregion
}
