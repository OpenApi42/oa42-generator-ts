import { c } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";
import { IsAuthenticationCodeGenerator } from "../functions/index.js";
import {
  AuthenticationTypesCodeGenerator,
  OperationsTypeCodeGenerator,
  ServerAuthenticationTypeCodeGenerator,
  ServerTypeCodeGenerator,
} from "../types/index.js";

export class ServerTsCodeGenerator extends CodeGeneratorBase {
  private serverAuthenticationTypeCodeGenerator =
    new ServerAuthenticationTypeCodeGenerator(this.factory, this.apiModel);
  private authenticationTypesCodeGenerator =
    new AuthenticationTypesCodeGenerator(this.factory, this.apiModel);
  private operationsTypeCodeGenerator = new OperationsTypeCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private serverTypeCodeGenerator = new ServerTypeCodeGenerator(
    this.factory,
    this.apiModel,
  );
  private isAuthenticationCodeGenerator = new IsAuthenticationCodeGenerator(
    this.factory,
    this.apiModel,
  );

  public *getCode() {
    yield* c`
import { Router } from "goodrouter";
import * as shared from "./shared.js";
import * as lib from "@oa42/oa42-lib";
`;

    yield* this.authenticationTypesCodeGenerator.getCode();
    yield* this.serverAuthenticationTypeCodeGenerator.getCode();
    yield* this.operationsTypeCodeGenerator.getCode();
    yield* this.serverTypeCodeGenerator.getCode();
    yield* this.isAuthenticationCodeGenerator.getCode();
  }
}
