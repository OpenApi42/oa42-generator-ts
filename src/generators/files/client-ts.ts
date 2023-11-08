import { RouterMode } from "goodrouter";
import * as models from "../../models/index.js";
import { toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { generateClientOperationFunctionBody } from "../bodies/index.js";
import {
  generateOperationIncomingResponseType,
  generateOperationOutgoingRequestType,
} from "../types/index.js";

export function* generateClientTsCode(apiModel: models.Api) {
  yield itt`
    import { Router } from "goodrouter";
    import * as shared from "./shared.js";
    import * as lib from "@oa42/oa42-lib";
  `;

  yield itt`
    const router = new Router({
      parameterValueDecoder: value => value,
      parameterValueEncoder: value => value,
    }).loadFromJson(${JSON.stringify(
      apiModel.router.saveToJson(RouterMode.Client),
    )});
  `;

  yield itt`
      export type ClientOptions = {
        baseUrl?: URL,
      }
  `;

  yield itt`
      export const defaultClientOptions: ClientOptions = {
      }
  `;

  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      const operationFunctionName = toCamel(operationModel.name);

      const operationOutgoingRequestName = toPascal(
        operationModel.name,
        "outgoing",
        "request",
      );

      const operationIncomingResponseName = toPascal(
        operationModel.name,
        "incoming",
        "response",
      );

      yield itt`
        export async function ${operationFunctionName}(
          outgoingRequest: ${operationOutgoingRequestName},
          credentials: unknown,
          options = defaultClientOptions,
        ): Promise<${operationIncomingResponseName}> {
          ${generateClientOperationFunctionBody(
            apiModel,
            pathModel,
            operationModel,
          )}
        }
      `;
      yield* generateOperationOutgoingRequestType(apiModel, operationModel);
      yield* generateOperationIncomingResponseType(apiModel, operationModel);
    }
  }
}
