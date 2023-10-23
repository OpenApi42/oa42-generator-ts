import * as oas from "@jns42/jns42-schema-oas-v3-1";
import * as models from "../../models/index.js";
import { Method, methods } from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.Schema20221007> {
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
        yield this.getOperationModel(method, operationItem);
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
    if (this.documentNode.components?.securitySchemes == null) {
      return;
    }

    for (const authorizationName in this.documentNode.components
      .securitySchemes) {
      const authorizationItem =
        this.documentNode.components.securitySchemes[authorizationName];

      if (!oas.isSecurityScheme(authorizationItem)) {
        continue;
      }

      yield this.getAuthorizationModel(authorizationName, authorizationItem);
    }
  }

  protected getAuthorizationModel(
    authorizationName: string,
    authorizationItem: oas.SecurityScheme,
  ) {
    const authorizationModel: models.Authorization = {
      name: authorizationName,
    };
    return authorizationModel;
  }
}
