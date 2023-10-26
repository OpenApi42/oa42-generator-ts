import { CodeGeneratorBase } from "../code-generator-base.js";
import {
  ClientOperationsCodeGenerator,
  IntoIncomingResponseCodeGenerator,
  IntoOutgoingRequestCodeGenerator,
} from "../functions/index.js";

export class ClientTsCodeGenerator extends CodeGeneratorBase {
  private clientOperationsCodeGenerator = new ClientOperationsCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private intoOutgoingRequestCodeGenerator =
    new IntoOutgoingRequestCodeGenerator(this.factory, this.apiModel);
  private intoIncomingResponseCodeGenerator =
    new IntoIncomingResponseCodeGenerator(this.factory, this.apiModel);

  public *getStatements() {
    yield* this.clientOperationsCodeGenerator.getStatements();
    yield* this.intoOutgoingRequestCodeGenerator.getStatements();
    yield* this.intoIncomingResponseCodeGenerator.getStatements();
  }
}
