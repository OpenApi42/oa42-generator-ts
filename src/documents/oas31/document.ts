import * as oas31 from "@jns42/jns42-schema-oas-v3-1";
import { methods } from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas31.Schema20221007> {
  public print(): void {
    console.log("oas31");

    for (const path in this.documentNode.paths) {
      const pathItem = this.documentNode.paths[path];

      if (oas31.isPathItem(pathItem)) {
        for (const method of methods) {
          const operation = pathItem[method];
          if (oas31.isOperation(operation)) {
            console.log(
              `${method.toUpperCase()} ${path}: ${operation.operationId}`,
            );

            const { requestBody } = operation;
            if (requestBody != null) {
              if (oas31.isReference(requestBody)) {
                console.log(requestBody.$ref);
              } else {
                for (const type in requestBody.content) {
                  const { schema } = requestBody.content[type];
                  if (oas31.isDefsSchema(schema)) {
                    console.log(schema);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
