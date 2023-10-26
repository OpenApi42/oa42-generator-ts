import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class IntoOutgoingResponseCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateFunctions();
  }

  private *generateFunctions() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateFunction(pathModel, operationModel);
      }
    }
  }

  private *generateFunction(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const functionName = toCamel(
      "into",
      "outgoing",
      operationModel.name,
      "response",
    );

    const operationOutgoingResponseName = toPascal(
      operationModel.name,
      "outgoing",
      "response",
    );

    yield f.createFunctionDeclaration(
      undefined,
      undefined,
      functionName,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          "outgoingResponse",
          undefined,
          f.createTypeReferenceNode(operationOutgoingResponseName),
        ),
      ],
      f.createTypeReferenceNode(
        f.createQualifiedName(
          f.createIdentifier("lib"),
          f.createIdentifier("ServerOutgoingResponse"),
        ),
      ),
      f.createBlock(
        [...this.generateFunctionStatements(pathModel, operationModel)],
        true,
      ),
    );
  }

  private *generateFunctionStatements(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    yield f.createThrowStatement(f.createStringLiteral("TODO"));
  }
}
