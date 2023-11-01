import * as oas from "@jns42/jns42-schema-oas-v3-0";
import { methods } from "@oa42/oa42-lib";
import { appendToUriHash } from "../../utils/uri.js";

export function selectSchemas(document: oas.Schema20210928, uri: URL) {
  return selectFromDocument(uri);

  function* selectFromDocument(uri: URL) {
    for (const [path, pathObject] of Object.entries(document.paths)) {
      yield* selectFromPath(appendToUriHash(uri, "paths", path), pathObject);
    }

    for (const [schema, schemaObject] of Object.entries(
      document.components?.schemas ?? {},
    )) {
      yield* selectFromSchema(
        appendToUriHash(uri, "components", "schemas", schema),
        schemaObject,
      );
    }

    for (const [requestBody, requestBodyObject] of Object.entries(
      document.components?.requestBodies ?? {},
    )) {
      yield* selectFromRequestBody(
        appendToUriHash(uri, "components", "requestBodies", requestBody),
        requestBodyObject,
      );
    }

    for (const [response, responseObject] of Object.entries(
      document.components?.responses ?? {},
    )) {
      yield* selectFromResponse(
        appendToUriHash(uri, "components", "responses", response),
        responseObject,
      );
    }

    for (const [parameter, parameterObject] of Object.entries(
      document.components?.parameters ?? {},
    )) {
      yield* selectFromParameter(
        appendToUriHash(uri, "components", "parameters", parameter),
        parameterObject,
      );
    }

    for (const [header, headerObject] of Object.entries(
      document.components?.headers ?? {},
    )) {
      yield* selectFromHeader(
        appendToUriHash(uri, "components", "headers", header),
        headerObject,
      );
    }
  }

  function* selectFromPath(uri: URL, pathObject: unknown) {
    if (oas.isReference(pathObject)) {
      return;
    }

    if (!oas.isPathItem(pathObject)) {
      return;
    }

    for (const [parameter, parameterObject] of Object.entries(
      pathObject.parameters ?? {},
    )) {
      yield* selectFromParameter(
        appendToUriHash(uri, "parameters", parameter),
        parameterObject,
      );
    }

    for (const method of Object.values(methods)) {
      const operationObject = pathObject[method];

      yield* selectFromOperation(appendToUriHash(uri, method), operationObject);
    }
  }

  function* selectFromOperation(uri: URL, operationObject: unknown) {
    if (!oas.isOperation(operationObject)) {
      return;
    }

    for (const [parameter, parameterObject] of Object.entries(
      operationObject.parameters ?? [],
    )) {
      yield* selectFromParameter(
        appendToUriHash(uri, "parameters", parameter),
        parameterObject,
      );
    }

    for (const [response, responseObject] of Object.entries(
      operationObject.responses ?? {},
    )) {
      yield* selectFromResponse(
        appendToUriHash(uri, "responses", response),
        responseObject,
      );
    }

    if (operationObject.requestBody) {
      yield* selectFromRequestBody(
        appendToUriHash(uri, "requestBody"),
        operationObject.requestBody,
      );
    }
  }

  function* selectFromRequestBody(
    uri: URL,
    requestBodyObject: oas.OperationPropertiesRequestBody,
  ) {
    if (oas.isReference(requestBodyObject)) {
      return;
    }

    for (const [contentType, contentObject] of Object.entries(
      requestBodyObject.content,
    )) {
      yield* selectFromMediaTypeObject(
        appendToUriHash(uri, "content", contentType),
        contentObject,
      );
    }
  }

  function* selectFromMediaTypeObject(
    uri: URL,
    mediaTypeObject: oas.RequestBodyContentAdditionalProperties,
  ) {
    if (oas.isReference(mediaTypeObject)) {
      return;
    }

    yield* selectFromSchema(
      appendToUriHash(uri, "schema"),
      mediaTypeObject.schema,
    );
  }

  function* selectFromResponse(uri: URL, responseObject: unknown) {
    if (oas.isReference(responseObject)) {
      return;
    }

    if (!oas.isResponse(responseObject)) {
      return;
    }

    for (const [contentType, contentObject] of Object.entries(
      responseObject.content ?? {},
    )) {
      yield* selectFromSchema(
        appendToUriHash(uri, "content", contentType, "schema"),
        contentObject.schema,
      );
    }

    for (const [header, headerObject] of Object.entries(
      responseObject.headers ?? {},
    )) {
      yield* selectFromHeader(
        appendToUriHash(uri, "headers", header),
        headerObject,
      );
    }
  }

  function* selectFromParameter(
    uri: URL,
    parameterObject: oas.Reference | oas.Parameter,
  ) {
    if (oas.isReference(parameterObject)) return;

    yield* selectFromSchema(
      appendToUriHash(uri, "schema"),
      parameterObject.schema,
    );
  }

  function* selectFromHeader(
    uri: URL,
    headerObject: oas.Reference | oas.Header,
  ) {
    if (oas.isReference(headerObject)) {
      return;
    }

    yield* selectFromSchema(
      appendToUriHash(uri, "schema"),
      headerObject.schema,
    );
  }

  function* selectFromSchema(
    uri: URL,
    schemaObject: oas.Reference | oas.DefinitionsSchema | undefined,
  ) {
    if (schemaObject == null) {
      return;
    }

    if (oas.isReference(schemaObject)) {
      return;
    }

    yield [uri, schemaObject] as const;
  }

  // function* selectFromSchema(
  //   schemaObject:
  //     | oas.Reference
  //     | oas.SchemaObject
  //     | undefined,
  //   uri: URL,
  // ): Iterable<{
  //   schemaObject: oas.SchemaObject;
  //   pointerParts: string[];
  // }> {
  //   if (!schemaObject) return;
  //   if (oas.isReference(schemaObject)) return;

  //   yield {
  //     schemaObject,
  //     pointerParts,
  //   };

  //   for (const [property, propertyObject] of Object.entries(
  //     schemaObject.properties ?? {},
  //   )) {
  //     yield* selectFromSchema(propertyObject, [
  //       ...pointerParts,
  //       "properties",
  //       property,
  //     ]);
  //   }

  //   for (const [allOf, allOfObject] of Object.entries(
  //     schemaObject.allOf ?? {},
  //   )) {
  //     yield* selectFromSchema(allOfObject, [...pointerParts, "allOf", allOf]);
  //   }

  //   for (const [anyOf, anyOfObject] of Object.entries(
  //     schemaObject.anyOf ?? {},
  //   )) {
  //     yield* selectFromSchema(anyOfObject, [...pointerParts, "anyOf", anyOf]);
  //   }

  //   for (const [oneOf, oneOfObject] of Object.entries(
  //     schemaObject.oneOf ?? {},
  //   )) {
  //     yield* selectFromSchema(oneOfObject, [...pointerParts, "oneOf", oneOf]);
  //   }

  //   if ("items" in schemaObject) {
  //     if (Array.isArray(schemaObject.items)) {
  //       for (const [item, itemObject] of Object.entries(schemaObject.items)) {
  //         yield* selectFromSchema(itemObject, [...pointerParts, "items", item]);
  //       }
  //     } else {
  //       yield* selectFromSchema(schemaObject.items, [...pointerParts, "items"]);
  //     }
  //   }

  //   if (typeof schemaObject.additionalProperties === "object") {
  //     yield* selectFromSchema(schemaObject.additionalProperties, [
  //       ...pointerParts,
  //       "additionalProperties",
  //     ]);
  //   }

  //   yield* selectFromSchema(schemaObject.not, [...pointerParts, "not"]);
  // }
}
