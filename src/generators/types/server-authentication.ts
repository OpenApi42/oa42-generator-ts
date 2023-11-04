import ts from "typescript";
import { Code, toCamel } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerAuthenticationTypeCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
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
