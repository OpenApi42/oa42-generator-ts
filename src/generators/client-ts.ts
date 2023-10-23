import ts from "typescript";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ClientTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateClientOperationFunctionDeclarationStatements();
  }

  protected *generateClientOperationFunctionDeclarationStatements(): Iterable<ts.FunctionDeclaration> {
    throw new Error("TODO");
  }
}
