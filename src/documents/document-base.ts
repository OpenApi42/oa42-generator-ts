import * as models from "../models/index.js";

export abstract class DocumentBase<N = unknown> {
  constructor(
    protected readonly documentUri: URL,
    protected readonly documentNode: N,
  ) {
    //
  }

  public abstract getApiModel(): models.Api;
}
