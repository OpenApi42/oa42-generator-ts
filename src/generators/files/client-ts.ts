import { CodeGeneratorBase } from "../code-generator-base.js";
import { ClientOperationsCodeGenerator } from "../functions/index.js";

export class ClientTsCodeGenerator extends CodeGeneratorBase {
  private clientOperationsCodeGenerator = new ClientOperationsCodeGenerator(
    this.factory,
    this.apiModel,
  );

  public *getStatements() {
    yield* this.clientOperationsCodeGenerator.getStatements();
  }
}
