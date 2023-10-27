import * as oas from "@jns42/jns42-schema-oas-v3-0";
import * as models from "../../models/index.js";
import { Method, methods } from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.Schema20210928> {
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
          }) as models.Parameters,
      );
    const headerParameters = allParameters
      .filter((parameterItem) => parameterItem.in === "header")
      .map(
        (parameterItem) =>
          ({
            name: parameterItem.name,
            required: parameterItem.required ?? false,
          }) as models.Parameters,
      );
    const pathParameters = allParameters
      .filter((parameterItem) => parameterItem.in === "path")
      .map(
        (parameterItem) =>
          ({
            name: parameterItem.name,
            required: true,
          }) as models.Parameters,
      );
    const cookieParameters = allParameters
      .filter((parameterItem) => parameterItem.in === "cookie")
      .map(
        (parameterItem) =>
          ({
            name: parameterItem.name,
            required: parameterItem.required ?? false,
          }) as models.Parameters,
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
    };

    return operationModel;
  }

  protected *getAuthenticationModels() {
    if (this.documentNode.components?.securitySchemes == null) {
      return;
    }

    for (const authenticationName in this.documentNode.components
      .securitySchemes) {
      const authenticationItem =
        this.documentNode.components.securitySchemes[authenticationName];
      yield this.getAuthenticationModel(authenticationName, authenticationItem);
    }
  }

  protected getAuthenticationModel(
    authenticationName: string,
    authenticationItem: oas.SecuritySchemesAZAZ09,
  ) {
    const authenticationModel: models.Authentication = {
      name: authenticationName,
    };
    return authenticationModel;
  }
}
