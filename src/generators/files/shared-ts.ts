import { CodeGeneratorBase } from "../code-generator-base.js";
import { IsRequestParametersCodeGenerator } from "../functions/index.js";
import { RequestParametersCodeGenerator } from "../types/index.js";

export class SharedTsCodeGenerator extends CodeGeneratorBase {
  private isRequestParametersCodeGenerator =
    new IsRequestParametersCodeGenerator(this.factory, this.apiModel);
  private requestParametersCodeGenerator = new RequestParametersCodeGenerator(
    this.factory,
    this.apiModel,
  );

  public *getStatements() {
    const { factory: f } = this;

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamespaceImport(f.createIdentifier("lib")),
      ),
      f.createStringLiteral("@oa42/oa42-lib"),
    );

    yield* this.requestParametersCodeGenerator.getStatements();
    yield* this.isRequestParametersCodeGenerator.getStatements();
  }
}
