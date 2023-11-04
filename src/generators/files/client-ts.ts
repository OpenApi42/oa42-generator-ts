import * as models from "../../models/index.js";
import { ClientOperationsCodeGenerator } from "../functions/index.js";

export function* generateClientTsCode(apiModel: models.Api) {
  const clientOperationsCodeGenerator = new ClientOperationsCodeGenerator(
    apiModel,
  );

  yield* clientOperationsCodeGenerator.getCode();
}
