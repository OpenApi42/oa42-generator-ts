import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerConstructorCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    yield* this.generateConstructorDeclaration();
  }

  protected *generateConstructorDeclaration() {
    const { factory } = this;

    yield factory.createConstructorDeclaration(
      undefined,
      [],
      factory.createBlock([...this.generateConstructorStatements()], true),
    );
  }

  protected *generateConstructorStatements() {
    const { factory: f } = this;

    yield f.createExpressionStatement(
      f.createCallExpression(f.createSuper(), undefined, undefined),
    );

    for (
      let pathIndex = 0;
      pathIndex < this.apiModel.paths.length;
      pathIndex++
    ) {
      const pathModel = this.apiModel.paths[pathIndex];
      yield f.createExpressionStatement(
        f.createCallExpression(
          f.createPropertyAccessExpression(
            f.createPropertyAccessExpression(f.createThis(), "router"),
            f.createIdentifier("insertRoute"),
          ),
          undefined,
          [
            f.createNumericLiteral(pathIndex + 1),
            f.createStringLiteral(pathModel.pattern),
          ],
        ),
      );
    }
  }
}
