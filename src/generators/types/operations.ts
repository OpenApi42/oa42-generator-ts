import ts from "typescript";
import * as models from "../../models/index.js";
import { toPascal } from "../../utils/name.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class OperationsTypeCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateOperationsTypes();
  }

  private *generateOperationsTypes() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateOperationTypes(pathModel, operationModel);
      }
    }
  }

  private *generateOperationTypes(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const { factory: f } = this;

    const handlerTypeName = toPascal(
      operationModel.name,
      "operation",
      "handler",
    );

    const operationIncomingRequestName = toPascal(
      operationModel.name,
      "incoming",
      "request",
    );

    const operationOutgoingResponseName = toPascal(
      operationModel.name,
      "outgoing",
      "response",
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      handlerTypeName,
      undefined,
      f.createFunctionTypeNode(
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "incomingRequest",
            undefined,
            f.createTypeReferenceNode(operationIncomingRequestName),
          ),
        ],
        f.createTypeReferenceNode(operationOutgoingResponseName),
      ),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationIncomingRequestName,
      undefined,
      f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      operationOutgoingResponseName,
      undefined,
      f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    );
  }
}
