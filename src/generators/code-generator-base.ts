import * as models from "../models/index.js";

export abstract class CodeGeneratorBase {
  constructor(protected readonly apiModel: models.Api) {}
}
