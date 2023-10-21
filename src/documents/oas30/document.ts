import * as oas30 from "@jns42/jns42-schema-oas-v3-0";
import { methods } from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas30.Schema20210928> {
  public print(): void {
    console.log("oas30");

    for (const path in this.documentNode.paths) {
      const pathItem = this.documentNode.paths[path];

      if (oas30.isPathItem(pathItem)) {
        for (const method of methods) {
          const operation = pathItem[method];
          if (oas30.isOperation(operation)) {
            console.log(
              `${method.toUpperCase()} ${path}: ${operation.operationId}`,
            );

            const { requestBody } = operation;
            if (requestBody != null) {
              if (oas30.isReference(requestBody)) {
                console.log(requestBody.$ref);
              } else {
                for (const type in requestBody.content) {
                  const { schema } = requestBody.content[type];
                  if (oas30.isDefinitionsSchema(schema)) {
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
