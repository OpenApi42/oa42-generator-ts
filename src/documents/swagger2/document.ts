import * as oas from "@jns42/jns42-schema-swagger-v2";
import { Method, methods } from "@oa42/oa42-lib";
import * as models from "../../models/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.SchemaJson> {
  public getApiModel(): models.Api {
    const apiModel: models.Api = {
      paths: [...this.getPathModels()],
      authentication: [...this.getAuthenticationModels()],
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
        yield this.getOperationModel(pathItem, method, operationItem);
      }
    }
  }

  protected getOperationModel(
    pathItem: oas.PathItem,
    method: Method,
    operationItem: oas.Operation,
  ) {
    const allParameters = [
      ...(pathItem.parameters ?? []),
      ...(operationItem.parameters ?? []),
    ];

    const queryParameters = allParameters
      .filter((parameterItem) => parameterItem.in === "query")
      .map(
        (parameterItem) =>
          ({
            name: parameterItem.name,
            required: parameterItem.required ?? false,
          }) as models.Parameter,
      );
    const headerParameters = allParameters
      .filter((parameterItem) => parameterItem.in === "header")
      .map(
        (parameterItem) =>
          ({
            name: parameterItem.name,
            required: parameterItem.required ?? false,
          }) as models.Parameter,
      );
    const pathParameters = allParameters
      .filter((parameterItem) => parameterItem.in === "path")
      .map(
        (parameterItem) =>
          ({
            name: parameterItem.name,
            required: true,
          }) as models.Parameter,
      );
    const cookieParameters = allParameters
      .filter((parameterItem) => parameterItem.in === "cookie")
      .map(
        (parameterItem) =>
          ({
            name: parameterItem.name,
            required: parameterItem.required ?? false,
          }) as models.Parameter,
      );

    const authenticationRequirements = (
      operationItem.security ??
      this.documentNode.security ??
      []
    ).map((item) =>
      Object.entries(item).map(([authenticationName, scopes]) => ({
        authenticationName,
        scopes,
      })),
    );

    const operationModel: models.Operation = {
      method,
      name: operationItem.operationId ?? "",
      queryParameters,
      headerParameters,
      pathParameters,
      cookieParameters,
      authenticationRequirements,
      operationResults: [],
    };

    return operationModel;
  }

  protected *getAuthenticationModels() {
    if (this.documentNode.security == null) {
      return;
    }

    // TODO
    for (const authenticationName in this.documentNode.security) {
      const authenticationItem = this.documentNode.security[authenticationName];
      yield this.getAuthenticationModel(authenticationName, authenticationItem);
    }
  }

  protected getAuthenticationModel(
    authenticationName: string,
    authenticationItem: oas.SecurityRequirement,
  ) {
    const authenticationModel: models.Authentication = {
      name: authenticationName,
    };
    return authenticationModel;
  }
}
