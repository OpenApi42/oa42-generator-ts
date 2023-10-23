import { ClientTsCodeGenerator } from "./client-ts.js";
import { CodeGeneratorBase } from "./code-generator-base.js";
import { ServerTsCodeGenerator } from "./server-ts.js";

export class MainTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    const { factory: f } = this;

    {
      const codeGenerator = new ClientTsCodeGenerator(f, this.apiModel);
      yield* codeGenerator.getStatements();
    }

    {
      const codeGenerator = new ServerTsCodeGenerator(f, this.apiModel);
      yield* codeGenerator.getStatements();
    }
  }
}
