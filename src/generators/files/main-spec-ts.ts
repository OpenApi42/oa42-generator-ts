import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";

export function* generateMainSpecTsCode(apiModel: models.Api) {
  yield c`
import assert from "assert/strict";
import test from "node:test";
import main from "./main.js";
`;
}
