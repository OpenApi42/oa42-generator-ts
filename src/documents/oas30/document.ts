import * as oas from "@jns42/jns42-schema-oas-v3-0";
import * as models from "../../models/index.js";
import { Method, methods } from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.Schema20210928> {
  public getApiModel(): models.Api {
    const apiModel: models.Api = {
      paths: [...this.getPathModels()],
      authorizations: [...this.getAuthorizationModels()],
    };
    return apiModel;
  }

  protected *getPathModels() {
    if (this.documentNode.paths == null) {
      return;
    }

    for (const pathPattern in this.documentNode.paths) {
      const pathItem = this.documentNode.paths[pathPattern];

      if (oas.isPathItem(pathItem)) {
        yield this.getPathModel(pathPattern, pathItem);
      }
    }
  }

  protected getPathModel(pathPattern: string, pathItem: oas.PathItem) {
    const pathModel: models.Path = {
      pattern: pathPattern,
      operations: Array.from(this.getOperationModels(pathPattern, pathItem)),
    };

    return pathModel;
  }

  protected *getOperationModels(pathPattern: string, pathItem: oas.PathItem) {
    for (const method of methods) {
      const operationItem = pathItem[method];

      if (oas.isOperation(operationItem)) {
        this.getOperationModel(method, operationItem);
      }
    }
  }

  protected getOperationModel(method: Method, operationItem: oas.Operation) {
    const operationModel: models.Operation = {
      method,
      id: operationItem.operationId ?? "",
    };

    return operationModel;
  }

  protected *getAuthorizationModels() {
    if (this.documentNode.security == null) {
      return;
    }

    for (const authorizationName in this.documentNode.security) {
      const authorizationItem = this.documentNode.security[authorizationName];
      yield this.getAuthorizationModel(authorizationName, authorizationItem);
    }
  }

  protected getAuthorizationModel(
    authorizationName: string,
    authorizationItem: oas.SecurityRequirement,
  ) {
    const authorizationModel: models.Authorization = {
      name: authorizationName,
    };
    return authorizationModel;
  }
}
