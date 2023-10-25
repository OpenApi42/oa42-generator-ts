import { CodeGeneratorBase } from "../code-generator-base.js";
import {
  OperationsTypeCodeGenerator,
  ServerAuthorizationTypeCodeGenerator,
  ServerTypeCodeGenerator,
} from "../types/index.js";

export class ServerTsCodeGenerator extends CodeGeneratorBase {
  private serverAuthorizationTypeCodeGenerator =
    new ServerAuthorizationTypeCodeGenerator(this.factory, this.apiModel);
  private operationsTypeCodeGenerator = new OperationsTypeCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private serverTypeCodeGenerator = new ServerTypeCodeGenerator(
    this.factory,
    this.apiModel,
  );

  public *getStatements() {
    const { factory: f } = this;

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamedImports([
          f.createImportSpecifier(
            false,
            undefined,
            f.createIdentifier("Router"),
          ),
        ]),
      ),
      f.createStringLiteral("goodrouter"),
    );

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamespaceImport(f.createIdentifier("shared")),
      ),
      f.createStringLiteral("./shared.js"),
    );

    yield f.createImportDeclaration(
      undefined,
      f.createImportClause(
        false,
        undefined,
        f.createNamespaceImport(f.createIdentifier("lib")),
      ),
      f.createStringLiteral("@oa42/oa42-lib"),
    );

    yield* this.serverAuthorizationTypeCodeGenerator.getStatements();
    yield* this.serverTypeCodeGenerator.getStatements();
    yield* this.operationsTypeCodeGenerator.getStatements();
  }
}
