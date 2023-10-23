import { CodeGeneratorBase } from "./code-generator-base.js";

export class SharedTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    const { factory: f } = this;
  }
}
