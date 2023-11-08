import * as models from "../../models/index.js";
import { toCamel } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { generateClientOperationFunctionBody } from "../bodies/index.js";

export function* generateClientTsCode(apiModel: models.Api) {
  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      const operationFunctionName = toCamel(operationModel.name);

      yield itt`
        export function ${operationFunctionName}(){
          ${generateClientOperationFunctionBody(pathModel, operationModel)}
        }
      `;
    }
  }
}
