import { CodeGeneratorBase } from "./code-generator-base.js";

export class MainTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    const { factory: f } = this;

    yield f.createExportDeclaration(
      undefined,
      false,
      undefined,
      f.createStringLiteral("./shared.js"),
    );

    yield f.createExportDeclaration(
      undefined,
      false,
      undefined,
      f.createStringLiteral("./client.js"),
    );

    yield f.createExportDeclaration(
      undefined,
      false,
      undefined,
      f.createStringLiteral("./server.js"),
    );
  }
}
