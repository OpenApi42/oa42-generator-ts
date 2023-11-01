import * as oas from "@jns42/jns42-schema-oas-v3-0";
import { Method, StatusCode, methods, statusCodes } from "@oa42/oa42-lib";
import * as models from "../../models/index.js";
import {
  appendToUriHash,
  statusKindComparer,
  takeStatusCodes,
} from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<oas.Schema20210928> {
  public getApiModel(): models.Api {
    const uri = this.documentUri;
    const apiModel: models.Api = {
      uri,
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
        yield this.getPathModel(
          appendToUriHash(this.documentUri, "paths", pathPattern),
          pathPattern,
          pathItem,
        );
      }
    }
  }

  protected getPathModel(
    pathUri: URL,
    pathPattern: string,
    pathItem: oas.PathItem,
  ) {
    const pathModel: models.Path = {
      uri: pathUri,
      pattern: pathPattern,
      operations: Array.from(
        this.getOperationModels(pathUri, pathPattern, pathItem),
      ),
    };

    return pathModel;
  }

  protected *getOperationModels(
    pathUri: URL,
    pathPattern: string,
    pathItem: oas.PathItem,
  ) {
    for (const method of methods) {
      const operationItem = pathItem[method];

      if (oas.isOperation(operationItem)) {
        yield this.getOperationModel(
          pathUri,
          pathItem,
          appendToUriHash(pathUri, method),
          method,
          operationItem,
        );
      }
    }
  }

  protected getOperationModel(
    pathUri: URL,
    pathItem: oas.PathItem,
    operationUri: URL,
    method: Method,
    operationItem: oas.Operation,
  ) {
    const allParameters = [
      ...(pathItem.parameters ?? []).map(
        (item, index) =>
          [
            appendToUriHash(pathUri, "parameters", index),
            item.name,
            item,
          ] as const,
      ),
      ...(operationItem.parameters ?? []).map(
        (item, index) =>
          [
            appendToUriHash(operationUri, "parameters", index),
            item.name,
            item,
          ] as const,
      ),
    ];

    const queryParameters = allParameters
      .filter(([, , parameterItem]) => parameterItem.in === "query")
      .map((args) => this.getParameterModel(...args));
    const headerParameters = allParameters
      .filter(
        ([, , parameterItem]) => (parameterItem.in as string) === "header",
      )
      .map((args) => this.getParameterModel(...args));
    const pathParameters = allParameters
      .filter(([, , parameterItem]) => (parameterItem.in as string) === "path")
      .map((args) => this.getParameterModel(...args));
    const cookieParameters = allParameters
      .filter(
        ([, , parameterItem]) => (parameterItem.in as string) === "cookie",
      )
      .map((args) => this.getParameterModel(...args));

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

    const operationResults = [
      ...this.getOperationResultModels(operationUri, operationItem),
    ];

    const operationModel: models.Operation = {
      uri: operationUri,
      method,
      name: operationItem.operationId ?? "",
      queryParameters,
      headerParameters,
      pathParameters,
      cookieParameters,
      authenticationRequirements,
      operationResults,
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

      if (!oas.isSecurityScheme(authenticationItem)) {
        continue;
      }

      yield this.getAuthenticationModel(authenticationName, authenticationItem);
    }
  }

  protected getAuthenticationModel(
    authenticationName: string,
    authenticationItem: oas.SecurityScheme,
  ) {
    const authenticationModel: models.Authentication = {
      name: authenticationName,
    };
    return authenticationModel;
  }

  protected *getOperationResultModels(
    operationUrl: URL,
    operationItem: oas.Operation,
  ) {
    const statusCodesAvailable = new Set(statusCodes);
    const statusKinds = Object.keys(operationItem.responses ?? {}).sort(
      statusKindComparer,
    );

    for (const statusKind of statusKinds) {
      const responseItem = operationItem.responses![statusKind];

      if (!oas.isResponse(responseItem)) {
        continue;
      }

      const statusCodes = [
        ...takeStatusCodes(statusCodesAvailable, statusKind),
      ];

      yield this.getOperationResultModel(
        appendToUriHash(operationUrl, statusKind),
        statusKind,
        statusCodes,
        responseItem,
      );
    }
  }

  protected getOperationResultModel(
    operationUri: URL,
    statusKind: string,
    statusCodes: StatusCode[],
    responseItem: oas.Response,
  ): models.OperationResult {
    const headerParameters = [
      ...this.getOperationResultHeaderParameters(operationUri, responseItem),
    ];
    return {
      uri: operationUri,
      statusKind,
      statusCodes,
      headerParameters,
    };
  }

  protected *getOperationResultHeaderParameters(
    operationUri: URL,
    responseItem: oas.Response,
  ) {
    for (const parameterName in responseItem.headers ?? {}) {
      const headerItem = responseItem.headers![parameterName];
      if (!oas.isHeader(headerItem)) {
        continue;
      }

      yield this.getParameterModel(
        appendToUriHash(operationUri, "headers", parameterName),
        parameterName,
        headerItem,
      );
    }
  }

  protected getParameterModel(
    parameterUri: URL,
    parameterName: string,
    parameterItem: oas.Parameter | oas.Header,
  ): models.Parameter {
    return {
      uri: parameterUri,
      name: parameterName,
      required: parameterItem.required ?? false,
      entitySchemaUri:
        parameterItem.schema == null
          ? undefined
          : appendToUriHash(parameterUri, "schema"),
    };
  }

  public getSchemas(): Iterable<[URL, unknown]> {
    throw new Error("Method not implemented.");
  }
}
