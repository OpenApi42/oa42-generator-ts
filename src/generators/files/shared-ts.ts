import * as jns42generator from "@jns42/jns42-generator";
import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { generateIsParametersFunctionBody } from "../bodies/index.js";
import {
  generateOperationParametersTypes,
  generateOperationResultParameterTypes,
} from "../types/index.js";

export function* getSharedTsCode(
  factory: ts.NodeFactory,
  apiModel: models.Api,
) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      const isParametersFunctionName = toCamel(
        "is",
        operationModel.name,
        "request",
        "parameters",
      );

      const parametersTypeName = toPascal(
        operationModel.name,
        "request",
        "parameters",
      );

      yield itt`
        export function ${isParametersFunctionName}(
          requestParameters: Partial<Record<keyof ${parametersTypeName}, unknown>>,
        ): requestParameters is ${parametersTypeName} {
          ${generateIsParametersFunctionBody(apiModel, operationModel)}
        }
      `;

      yield generateOperationParametersTypes(apiModel, operationModel);

      for (const operationResultModel of operationModel.operationResults) {
        yield generateOperationResultParameterTypes(
          apiModel,
          operationModel,
          operationResultModel,
        );
      }
    }
  }

  //#region types from jns42

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

  //#endregion
}
