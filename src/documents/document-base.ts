import * as models from "../models/index.js";

export abstract class DocumentBase<N = unknown> {
  protected readonly documentNode: N;

  constructor(documentNode: N) {
    this.documentNode = documentNode;
  }

  public abstract getApiModel(): models.Api;
}
