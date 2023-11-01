import * as oas from "@jns42/jns42-schema-swagger-v2";
import * as models from "../../models/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.SchemaJson> {
  public getApiModel(): models.Api {
    throw new Error("Method not implemented.");
  }

  public getSchemas(): Iterable<[URL, unknown]> {
    throw new Error("Method not implemented.");
  }
}
