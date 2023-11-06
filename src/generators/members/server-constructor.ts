import * as models from "../../models/index.js";
import { itt } from "../../utils/iterable-text-template.js";

export function* generateServerConstructorCode(apiModel: models.Api) {
  yield* generateConstructor(apiModel);
}

function* generateConstructor(apiModel: models.Api) {
  yield itt`
public constructor() {
  ${generateConstructorBody(apiModel)}
}
`;
}

function* generateConstructorBody(apiModel: models.Api) {
  yield itt`
    super();
  `;

  for (let pathIndex = 0; pathIndex < apiModel.paths.length; pathIndex++) {
    const pathModel = apiModel.paths[pathIndex];
    yield itt`
      this.router.insertRoute(
        ${JSON.stringify(pathIndex + 1)},
        ${JSON.stringify(pathModel.pattern)},
      );
    `;
  }
}
