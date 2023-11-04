import { c } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

/**
 * Code generator that generates code only for browsers
 */
export class BrowserTsCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* c`
export * from "./shared.js";
export * from "./client.js";
`;
  }
}
