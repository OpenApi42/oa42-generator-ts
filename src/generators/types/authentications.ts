import ts from "typescript";
import * as models from "../../models/index.js";
import { Code, toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class AuthenticationTypesCodeGenerator extends CodeGeneratorBase {
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
    yield* this.generateAuthenticationTypes();
  }

  private *generateAuthenticationTypes() {
    for (const authenticationModel of this.apiModel.authentication) {
      yield* this.generateAuthenticationType(authenticationModel);
    }
  }

  private *generateAuthenticationType(
    authenticationModel: models.Authentication,
  ) {
    const { factory: f } = this;

    const handlerTypeName = toPascal(
      authenticationModel.name,
      "authentication",
      "handler",
    );

    yield f.createTypeAliasDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      handlerTypeName,
      [
        f.createTypeParameterDeclaration(
          undefined,
          "A",
          f.createTypeReferenceNode("ServerAuthentication"),
        ),
      ],
      f.createFunctionTypeNode(
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "credential",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ),
        ],
        f.createIndexedAccessTypeNode(
          f.createTypeReferenceNode(f.createIdentifier("A"), undefined),
          f.createLiteralTypeNode(
            f.createStringLiteral(toCamel(authenticationModel.name)),
          ),
        ),
      ),
    );
  }
}
