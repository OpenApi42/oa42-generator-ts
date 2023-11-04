import * as models from "../../models/index.js";
import { c, toCamel, toPascal } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class IsAuthenticationCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateAllFunctions();
  }

  public *getStatements() {
    yield* this.generateAllFunctions();
  }

  private *generateAllFunctions() {
    for (const pathModel of this.apiModel.paths) {
      for (const operationModel of pathModel.operations) {
        yield* this.generateFunction(pathModel, operationModel);
      }
    }
  }

  private *generateFunction(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    const functionName = toCamel("is", operationModel.name, "authentication");

    const typeName = toPascal(operationModel.name, "authentication");

    yield c`
  export function ${functionName}<A extends ServerAuthentication>(
    authentication: Partial<${typeName}<A>>,
  ): authentication is ${typeName}<A> {
    ${this.generateFunctionBody(pathModel, operationModel)}
  }
  `;
  }

  private *generateFunctionBody(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    yield c`
throw new Error("TODO");
`;
  }
}
