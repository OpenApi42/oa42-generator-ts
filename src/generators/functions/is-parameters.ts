import ts from "typescript";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class IsParametersCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateFunctionDeclarations();
  }

  private *generateFunctionDeclarations() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateFunctionDeclaration(pathModel, operationModel);
      }
    }
  }

  private *generateFunctionDeclaration(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const functionName = toCamel(
      "is",
      operationModel.name,
      "request",
      "parameters",
    );

    const typeName = toPascal(operationModel.name, "request", "parameters");

    yield f.createFunctionDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      functionName,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          f.createIdentifier("requestParameters"),
          undefined,
          f.createTypeReferenceNode("Partial", [
            f.createTypeReferenceNode(f.createIdentifier("Record"), [
              f.createTypeOperatorNode(
                ts.SyntaxKind.KeyOfKeyword,
                f.createTypeReferenceNode(
                  f.createIdentifier(typeName),
                  undefined,
                ),
              ),
              f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ]),
          ]),
        ),
      ],
      f.createTypePredicateNode(
        undefined,
        f.createIdentifier("requestParameters"),
        f.createTypeReferenceNode(typeName),
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
