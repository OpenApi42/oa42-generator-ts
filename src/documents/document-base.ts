export abstract class DocumentBase<N = unknown> {
  protected readonly documentNode: N;

  constructor(documentNode: N) {
    this.documentNode = documentNode;
  }

  public abstract print(): void;
}
