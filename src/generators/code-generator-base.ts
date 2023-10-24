import ts from "typescript";
import * as models from "../models/index.js";

export abstract class CodeGeneratorBase {
  constructor(
    protected readonly factory: ts.NodeFactory,
    protected readonly apiModel: models.Api,
  ) {}
}
