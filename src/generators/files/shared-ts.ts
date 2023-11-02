import * as jns42generator from "@jns42/jns42-generator";
import { CodeGeneratorBase } from "../code-generator-base.js";
import { IsParametersCodeGenerator } from "../functions/index.js";
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
  private validatorsCodeGenerator =
    new jns42generator.ValidatorsTsCodeGenerator(
      this.factory,
      this.apiModel.names,
      this.apiModel.schemas,
    );
  private typesCodeGenerator = new jns42generator.TypesTsCodeGenerator(
    this.factory,
    this.apiModel.names,
    this.apiModel.schemas,
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

    yield* this.validatorsCodeGenerator.getStatements();
    yield* this.typesCodeGenerator.getStatements();
  }
}
