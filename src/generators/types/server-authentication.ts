import ts from "typescript";
import { toCamel } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerAuthenticationTypeCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateServerAuthenticationType();
  }

  private *generateServerAuthenticationType() {
    const { factory: f } = this;

    const authenticationRecordKeyType =
      this.apiModel.authentication.length > 0
        ? f.createUnionTypeNode(
            this.apiModel.authentication.map((authenticationModel) =>
              f.createLiteralTypeNode(
                f.createStringLiteral(toCamel(authenticationModel.name)),
              ),
            ),
          )
        : f.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      "ServerAuthentication",
      undefined,
      f.createTypeReferenceNode("Record", [
        authenticationRecordKeyType,
        f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
      ]),
    );
  }
}
