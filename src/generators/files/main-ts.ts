import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";

/**
 * Main entrypoint for the package, exports client and server and
 * dependencies
 */
export function* generateMainTsCode(apiModel: models.Api) {
  yield c`
export * from "./shared.js";
export * from "./client.js";
export * from "./server.js";
`;
}
