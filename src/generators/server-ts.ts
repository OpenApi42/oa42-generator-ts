import camelcase from "camelcase";
import ts from "typescript";
import * as models from "../models/index.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ServerTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateServerClassDeclaration();
  }

  protected *generateServerClassDeclaration() {
    const { factory } = this;

    yield factory.createClassDeclaration(
      undefined,
      factory.createIdentifier("Server"),
      undefined,
      undefined,
      [...this.generateOperationMethodsDeclarations()],
    );
  }

  protected *generateOperationMethodsDeclarations() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationMethodDeclarations(
          pathModel,
          operationModel,
        );
      }
    }
  }

  protected *generateOperationMethodDeclarations(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;
    const name = camelcase(`Register${operationModel.id}Operation`);

    yield f.createMethodDeclaration(
      [f.createToken(ts.SyntaxKind.PublicKeyword)],
      undefined,
      name,
      undefined,
      undefined,
      [],
      undefined,
      f.createBlock([]),
    );
  }
}
