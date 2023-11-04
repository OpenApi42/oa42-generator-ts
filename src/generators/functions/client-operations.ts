import * as models from "../../models/index.js";
import { c, i, toCamel } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ClientOperationsCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
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
    const name = toCamel(operationModel.name);

    yield c`
function ${i(name)}(){
  ${this.generateFunctionBody(pathModel, operationModel)}
}
`;
  }

  private *generateFunctionBody(
    pathModel: models.Path,
    operationModel: models.Operation,
  ) {
    yield c``;
  }
}
