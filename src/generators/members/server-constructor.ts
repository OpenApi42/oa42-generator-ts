import * as models from "../../models/index.js";
import { c } from "../../utils/index.js";

export function* generateServerConstructorCode(apiModel: models.Api) {
  yield* generateConstructor(apiModel);
}

function* generateConstructor(apiModel: models.Api) {
  yield c`
public constructor() {
  ${generateConstructorBody(apiModel)}
}
`;
}

function* generateConstructorBody(apiModel: models.Api) {
  yield c`
    super();
  `;

  for (let pathIndex = 0; pathIndex < apiModel.paths.length; pathIndex++) {
    const pathModel = apiModel.paths[pathIndex];
    yield c`
      this.router.insertRoute(
        ${JSON.stringify(pathIndex + 1)},
        ${JSON.stringify(pathModel.pattern)},
      );
    `;
  }
}
