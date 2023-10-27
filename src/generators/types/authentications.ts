import ts from "typescript";
import * as models from "../../models/index.js";
import { toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class AuthenticationTypesCodeGenerator extends CodeGeneratorBase {
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
      [f.createTypeParameterDeclaration(undefined, "Authentication")],
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
        f.createTypeReferenceNode(handlerTypeName, [
          f.createTypeReferenceNode(
            f.createIdentifier("Authentication"),
            undefined,
          ),
        ]),
      ),
    );
  }
}
