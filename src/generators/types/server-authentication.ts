import { c, joinIterable, l, r, toCamel } from "../../utils/index.js";
import { CodeGeneratorBase } from "../code-generator-base.js";

export class ServerAuthenticationTypeCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield* this.generateServerAuthenticationType();
  }

  private *generateServerAuthenticationType() {
    const authenticationModels = this.apiModel.authentication;

    const typeArgument =
      authenticationModels.length > 0
        ? joinIterable(
            authenticationModels.map((authenticationModel) =>
              l(toCamel(authenticationModel.name)),
            ),
            r(" | "),
          )
        : r("never");

    yield* c`
export type ServerAuthentication = Record<${typeArgument}, unknown>;
`;

    const { factory: f } = this;
  }
}
