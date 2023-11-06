import * as models from "../../models/index.js";
import { iterableTextTemplate as itt } from "../../utils/iterable-text.js";

/**
 * Main entrypoint for the package, exports client and server and
 * dependencies
 */
export function* generateMainTsCode(apiModel: models.Api) {
  yield itt`
    export * from "./shared.js";
    export * from "./client.js";
    export * from "./server.js";
  `;
}
