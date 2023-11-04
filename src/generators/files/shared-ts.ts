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
    yield* this.typesCodeGenerator.getStatements();
    yield* this.validatorsCodeGenerator.getStatements();

    yield* this.parametersCodeGenerator.getStatements();
    yield* this.isParametersCodeGenerator.getStatements();
  }
}
