import { CodeGeneratorBase } from "./code-generator-base.js";

export class MainSpecsTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    const { factory: f } = this;

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(false, f.createIdentifier("assert"), undefined),
      f.createStringLiteral("assert/strict"),
    );

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(false, f.createIdentifier("test"), undefined),
      f.createStringLiteral("node:test"),
    );

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamespaceImport(f.createIdentifier("main")),
      ),
      f.createStringLiteral("./main.js"),
    );
  }
}
