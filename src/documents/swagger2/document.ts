import * as oas from "@jns42/jns42-schema-swagger-v2";
import * as models from "../../models/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.SchemaJson> {
  public getApiModel(): models.Api {
    const apiModel: models.Api = {
      uri: this.documentUri,
      paths: [],
      authentication: [],
    };
    return apiModel;
  }
}
