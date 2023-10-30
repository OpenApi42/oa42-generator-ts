import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class IsAuthenticationCodeGenerator extends CodeGeneratorBase {
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

    const functionName = toCamel("is", operationModel.name, "authentication");

    const typeName = toPascal(operationModel.name, "authentication");

    yield f.createFunctionDeclaration(
      undefined,
      undefined,
      functionName,
      [
        f.createTypeParameterDeclaration(
          undefined,
          f.createIdentifier("Authentication"),
          f.createTypeReferenceNode("ServerAuthentication"),
          undefined,
        ),
      ],
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          f.createIdentifier("authentication"),
          undefined,
          f.createTypeReferenceNode(f.createIdentifier("Partial"), [
            f.createTypeReferenceNode(f.createIdentifier(typeName), [
              f.createTypeReferenceNode("Authentication"),
            ]),
          ]),
          undefined,
        ),
      ],
      f.createTypePredicateNode(
        undefined,
        f.createIdentifier("authentication"),
        f.createTypeReferenceNode(typeName, [
          f.createTypeReferenceNode("Authentication"),
        ]),
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
