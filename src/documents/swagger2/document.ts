import * as swagger2 from "@jns42/jns42-schema-swagger-v2";
import { methods } from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<swagger2.SchemaJson> {
  public print(): void {
    console.log("swagger2");

    for (const path in this.documentNode.paths) {
      const pathItem = this.documentNode.paths[path];

      if (swagger2.isPathItem(pathItem)) {
        for (const method of methods) {
          const operation = pathItem[method];
          if (swagger2.isOperation(operation)) {
            console.log(
              `${method.toUpperCase()} ${path}: ${operation.operationId}`,
            );

            const { parameters } = operation;
            for (const parameter of parameters ?? []) {
              if (swagger2.isBodyParameter(parameter)) {
                console.log(parameter.schema);
              }
            }
          }
        }
      }
    }
  }
}
