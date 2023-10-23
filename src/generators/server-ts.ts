import ts from "typescript";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ServerTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield this.generateServerClassDeclarationStatement();
  }

  protected generateServerClassDeclarationStatement(): ts.FunctionDeclaration {
    throw new Error("TODO");
  }

  protected *generateServerOperationMethodsDeclarationStatements(): Iterable<ts.FunctionDeclaration> {
    throw new Error("TODO");
  }
}
