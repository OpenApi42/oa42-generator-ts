import * as jns42generator from "@jns42/jns42-generator";
import ts from "typescript";
import { Code } from "../../utils/index.js";
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

  public *getCode() {
    yield* this.parametersCodeGenerator.getCode();
    yield* this.isParametersCodeGenerator.getCode();

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });

    const sourceFile = this.factory.createSourceFile(
      [...this.getStatements()],
      this.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    );

    yield new Code(printer.printFile(sourceFile));
  }

  public *getStatements() {
    yield* this.typesCodeGenerator.getStatements();
    yield* this.validatorsCodeGenerator.getStatements();
  }
}
