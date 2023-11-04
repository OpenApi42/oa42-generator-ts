import fs from "fs";
import path from "path";
import ts from "typescript";
import * as models from "../models/index.js";
import { formatCode, formatData } from "../utils/index.js";
import { BrowserTsCodeGenerator } from "./files/browser-ts.js";
import { ClientTsCodeGenerator } from "./files/client-ts.js";
import { MainTsCodeGenerator } from "./files/main-ts.js";
import { getPackageJsonData } from "./files/package-json.js";
import { ServerTsCodeGenerator } from "./files/server-ts.js";
import { SharedTsCodeGenerator } from "./files/shared-ts.js";
import { getTsconfigJsonData } from "./files/tsconfig-json.js";

export interface PackageOptions {
  name: string;
  version: string;
  directoryPath: string;
}

export async function generatePackage(
  factory: ts.NodeFactory,
  apiModel: models.Api,
  options: PackageOptions,
) {
  fs.mkdirSync(options.directoryPath, { recursive: true });

  {
    const data = getPackageJsonData(options.name, options.version);
    const filePath = path.join(options.directoryPath, "package.json");
    fs.writeFileSync(filePath, formatData(data));
  }

  {
    const data = getTsconfigJsonData();
    const filePath = path.join(options.directoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, formatData(data));
  }

  {
    const codeGenerator = new MainTsCodeGenerator(factory, apiModel);
    const code = codeGenerator.getCode();
    const filePath = path.join(options.directoryPath, "main.ts");
    fs.writeFileSync(filePath, await formatCode(code));
  }

  {
    const codeGenerator = new BrowserTsCodeGenerator(factory, apiModel);
    const code = codeGenerator.getCode();
    const filePath = path.join(options.directoryPath, "browser.ts");
    fs.writeFileSync(filePath, await formatCode(code));
  }

  {
    const codeGenerator = new SharedTsCodeGenerator(factory, apiModel);
    const code = codeGenerator.getCode();
    const filePath = path.join(options.directoryPath, "shared.ts");
    fs.writeFileSync(filePath, await formatCode(code));
  }

  {
    const codeGenerator = new ClientTsCodeGenerator(factory, apiModel);
    const code = codeGenerator.getCode();
    const filePath = path.join(options.directoryPath, "client.ts");
    fs.writeFileSync(filePath, await formatCode(code));
  }

  {
    const codeGenerator = new ServerTsCodeGenerator(factory, apiModel);
    const code = codeGenerator.getCode();
    const filePath = path.join(options.directoryPath, "server.ts");
    fs.writeFileSync(filePath, await formatCode(code));
  }
}
