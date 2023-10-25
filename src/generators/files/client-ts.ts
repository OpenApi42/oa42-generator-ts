import camelcase from "camelcase";
import ts from "typescript";
import * as models from "../../models/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ClientTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateOperationFunctionDeclarations();
  }

  private *generateOperationFunctionDeclarations() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationFunctionDeclaration(
          pathModel,
          operationModel,
        );
      }
    }
  }

  private *generateOperationFunctionDeclaration(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;
    const name = camelcase(operationModel.name);

    yield f.createFunctionDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      name,
      undefined,
      [],
      undefined,
      f.createBlock([
        ...this.generateOperationFunctionStatements(pathModel, operationModel),
      ]),
    );
  }

  private *generateOperationFunctionStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;
  }
}
