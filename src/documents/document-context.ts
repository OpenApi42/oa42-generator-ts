import { loadYAML } from "../utils/index.js";
import { DocumentBase } from "./document-base.js";

export interface DocumentInitializer<N = unknown> {
  documentNode: N;
}

export type DocumentFactory<N = unknown> = (
  initializer: DocumentInitializer<N>,
) => DocumentBase<N> | undefined;

export class DocumentContext {
  private factories = new Array<DocumentFactory>();
  private document?: DocumentBase;

  public registerFactory(factory: DocumentFactory) {
    this.factories.push(factory);
  }

  public async loadFromUrl(url: URL) {
    url = new URL("", url);

    const documentNode = await loadYAML(url);
    this.loadFromDocument(url, documentNode);
  }

  public loadFromDocument(url: URL, documentNode: unknown) {
    url = new URL("", url);

    for (const factory of this.factories) {
      const document = factory({ documentNode });
      if (document != null) {
        this.document = document;
        break;
      }
    }
  }

  public print() {
    this.document!.print();
  }
}
