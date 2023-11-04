import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";

/**
 * Code generator that generates code only for browsers
 */
export function* generateBrowserTsCode(apiModel: models.Api) {
  yield c`
    export * from "./shared.js";
    export * from "./client.js";
  `;
}
