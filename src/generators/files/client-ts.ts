import { CodeGeneratorBase } from "../code-generator-base.js";
import {
  ClientOperationsCodeGenerator,
  TransformIncomingResponseCodeGenerator,
  TransformOutgoingRequestCodeGenerator,
} from "../functions/index.js";

export class ClientTsCodeGenerator extends CodeGeneratorBase {
  private clientOperationsCodeGenerator = new ClientOperationsCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private transformOutgoingRequestCodeGenerator =
    new TransformOutgoingRequestCodeGenerator(this.factory, this.apiModel);
  private transformIncomingResponseCodeGenerator =
    new TransformIncomingResponseCodeGenerator(this.factory, this.apiModel);

  public *getStatements() {
    yield* this.clientOperationsCodeGenerator.getStatements();
    yield* this.transformOutgoingRequestCodeGenerator.getStatements();
    yield* this.transformIncomingResponseCodeGenerator.getStatements();
  }
}
