import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";
import { generateIsAuthenticationCode } from "../functions/index.js";
import {
  generateAuthenticationTypesCode,
  generateOperationsTypeCode,
  generateServerAuthenticationTypeCode,
  generateServerTypeCode,
} from "../types/index.js";

export function* generateServerTsCode(apiModel: models.Api) {
  yield c`
    import { Router } from "goodrouter";
    import * as shared from "./shared.js";
    import * as lib from "@oa42/oa42-lib";
  `;

  yield* generateAuthenticationTypesCode(apiModel);
  yield* generateServerAuthenticationTypeCode(apiModel);
  yield* generateOperationsTypeCode(apiModel);
  yield* generateServerTypeCode(apiModel);
  yield* generateIsAuthenticationCode(apiModel);
}
