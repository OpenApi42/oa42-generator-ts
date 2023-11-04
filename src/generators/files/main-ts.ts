import { c } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

/**
 * Main entrypoint for the package, exports client and server and
 * dependencies
 */
export class MainTsCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield c`
export * from "./shared.js";
export * from "./client.js";
export * from "./server.js";
`;
  }
}
