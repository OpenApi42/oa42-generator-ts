import * as jns42generator from "@jns42/jns42-generator";
import ts from "typescript";
import * as models from "../../models/index.js";
import { generateIsParametersCode } from "../functions/index.js";
import { generateParametersCode } from "../types/index.js";

export function* getSharedTsCode(
  factory: ts.NodeFactory,
  apiModel: models.Api,
) {
  yield* generateParametersCode(apiModel);
  yield* generateIsParametersCode(apiModel);

  const validatorsCodeGenerator = new jns42generator.ValidatorsTsCodeGenerator(
    factory,
    apiModel.names,
    apiModel.schemas,
  );
  const typesCodeGenerator = new jns42generator.TypesTsCodeGenerator(
    factory,
    apiModel.names,
    apiModel.schemas,
  );

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  const sourceFile = factory.createSourceFile(
    [
      ...typesCodeGenerator.getStatements(),
      ...validatorsCodeGenerator.getStatements(),
    ],
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  yield printer.printFile(sourceFile);
}
