import * as jns42generator from "@jns42/jns42-generator";
import { Namer } from "@jns42/jns42-generator";
import * as intermediateB from "@jns42/jns42-schema-intermediate-b";
import * as oas from "@jns42/jns42-schema-oas-v3-0";
import { Method, StatusCode, methods, statusCodes } from "@oa42/oa42-lib";
import * as models from "../../models/index.js";
import {
  appendToUriHash,
  statusKindComparer,
  takeStatusCodes,
  toArrayAsync,
} from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";
import { selectSchemas } from "./selectors.js";

export class Document extends DocumentBase<oas.Schema20210928> {
  public async getApiModel(): Promise<models.Api> {
    const uri = this.documentUri;

    const paths = [...this.getPathModels()];
    const authentication = [...this.getAuthenticationModels()];
    const schemas = Object.fromEntries(await toArrayAsync(this.getSchemas()));

    // TODO root name should be dynamic
    const namer = new Namer("Schema");
    for (const nodeId in schemas) {
      const nodeUrl = new URL(nodeId);
      const path = nodeUrl.pathname + nodeUrl.hash.replace(/^#/g, "");
      namer.registerPath(nodeId, path);
    }

    const names = namer.getNames();

    const apiModel: models.Api = {
      uri,
      paths,
      authentication,
      schemas,
      names,
    };
    return apiModel;
  }

  private *getPathModels() {
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

  private getPathModel(
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

  private *getOperationModels(
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

  private getOperationModel(
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

  private *getAuthenticationModels() {
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

  private getAuthenticationModel(
    authenticationName: string,
    authenticationItem: oas.SecurityScheme,
  ) {
    const authenticationModel: models.Authentication = {
      name: authenticationName,
    };
    return authenticationModel;
  }

  private *getOperationResultModels(
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

  private getOperationResultModel(
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

  private *getOperationResultHeaderParameters(
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

  private getParameterModel(
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

  private async *getSchemas(): AsyncIterable<
    readonly [string, intermediateB.Node]
  > {
    const documentContext = new jns42generator.DocumentContext();

    documentContext.registerFactory(
      jns42generator.schemaDraft04.metaSchemaId,
      ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
        new jns42generator.schemaDraft04.Document(
          givenUrl,
          antecedentUrl,
          rootNode,
          documentContext,
        ),
    );

    for (const [pointer, schema] of selectSchemas("", this.documentNode)) {
      const uri = new URL(
        (this.documentUri.hash === "" ? "#" : this.documentUri.hash) + pointer,
        this.documentUri,
      );

      await documentContext.loadFromDocument(
        uri,
        uri,
        null,
        this.documentNode,
        jns42generator.schemaDraft04.metaSchemaId,
      );

      yield* documentContext.getIntermediateSchemaEntries();
    }
  }
}
