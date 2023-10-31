import * as oas from "@jns42/jns42-schema-oas-v3-1";
import * as models from "../../models/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.Schema20221007> {
  public getApiModel(): models.Api {
    const apiModel: models.Api = {
      uri: this.documentUri,
      paths: [],
      authentication: [],
    };
    return apiModel;
  }
}
