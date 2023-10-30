import { CodeGeneratorBase } from "../code-generator-base.js";
import { IsRequestParametersCodeGenerator as IsParametersCodeGenerator } from "../functions/index.js";
import { ParametersCodeGenerator } from "../types/index.js";

export class SharedTsCodeGenerator extends CodeGeneratorBase {
  private isParametersCodeGenerator = new IsParametersCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private parametersCodeGenerator = new ParametersCodeGenerator(
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

    yield* this.parametersCodeGenerator.getStatements();
    yield* this.isParametersCodeGenerator.getStatements();
  }
}
