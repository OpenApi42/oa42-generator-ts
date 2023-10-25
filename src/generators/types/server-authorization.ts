import ts from "typescript";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerAuthorizationTypeCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateServerAuthorizationType();
  }

  private *generateServerAuthorizationType() {
    const { factory: f } = this;

    const authorizationRecordKeyType =
      this.apiModel.authorizations.length > 0
        ? f.createUnionTypeNode(
            this.apiModel.authorizations.map((authorizationModel) =>
              f.createLiteralTypeNode(
                f.createStringLiteral(authorizationModel.name),
              ),
            ),
          )
        : f.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      "ServerAuthorization",
      undefined,
      f.createTypeReferenceNode("Record", [
        authorizationRecordKeyType,
        f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
      ]),
    );
  }
}
