import * as models from "../../models/index.js";
import { generateClientOperationsCode } from "../functions/index.js";

export function* generateClientTsCode(apiModel: models.Api) {
  yield* generateClientOperationsCode(apiModel);
}
