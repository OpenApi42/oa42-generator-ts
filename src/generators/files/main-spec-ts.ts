import { c } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class MainSpecTsCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield c`
import assert from "assert/strict";
import test from "node:test";
import main from "./main.js";
`;
  }
}
