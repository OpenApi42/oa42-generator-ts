import * as swagger2 from "@jns42/jns42-schema-swagger-v2";
import { DocumentInitializer } from "../document-context.js";
import { Document } from "./document.js";

export function factory({ documentNode }: DocumentInitializer) {
  if (swagger2.isSchemaJson(documentNode)) {
    return new Document(documentNode);
  }
}
