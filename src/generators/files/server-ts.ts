import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";
import { IsAuthenticationCodeGenerator } from "../functions/index.js";
import {
  AuthenticationTypesCodeGenerator,
  OperationsTypeCodeGenerator,
  ServerAuthenticationTypeCodeGenerator,
  ServerTypeCodeGenerator,
} from "../types/index.js";

export function* generateServerTsCode(apiModel: models.Api) {
  const serverAuthenticationTypeCodeGenerator =
    new ServerAuthenticationTypeCodeGenerator(apiModel);
  const authenticationTypesCodeGenerator = new AuthenticationTypesCodeGenerator(
    apiModel,
  );
  const operationsTypeCodeGenerator = new OperationsTypeCodeGenerator(apiModel);
  const serverTypeCodeGenerator = new ServerTypeCodeGenerator(apiModel);
  const isAuthenticationCodeGenerator = new IsAuthenticationCodeGenerator(
    apiModel,
  );

  yield c`
  import { Router } from "goodrouter";
  import * as shared from "./shared.js";
  import * as lib from "@oa42/oa42-lib";
  `;

  yield* authenticationTypesCodeGenerator.getCode();
  yield* serverAuthenticationTypeCodeGenerator.getCode();
  yield* operationsTypeCodeGenerator.getCode();
  yield* serverTypeCodeGenerator.getCode();
  yield* isAuthenticationCodeGenerator.getCode();
}
