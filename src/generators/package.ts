import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import * as models from "../models/index.js";
import { formatData, formatStatements } from "../utils/index.js";
import { BrowserTsCodeGenerator } from "./browser-ts.js";
import { ClientTsCodeGenerator } from "./client-ts.js";
import { MainTsCodeGenerator } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { ServerTsCodeGenerator } from "./server-ts.js";
import { SharedTsCodeGenerator } from "./shared-ts.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";

export interface PackageOptions {
  name: string;
  version: string;
  directoryPath: string;
}

export function generatePackage(
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
    const statements = codeGenerator.getStatements();
    const filePath = path.join(options.directoryPath, "main.ts");
    fs.writeFileSync(filePath, formatStatements(factory, statements));
  }

  {
    const codeGenerator = new BrowserTsCodeGenerator(factory, apiModel);
    const statements = codeGenerator.getStatements();
    const filePath = path.join(options.directoryPath, "browser.ts");
    fs.writeFileSync(filePath, formatStatements(factory, statements));
  }

  {
    const codeGenerator = new SharedTsCodeGenerator(factory, apiModel);
    const statements = codeGenerator.getStatements();
    const filePath = path.join(options.directoryPath, "shared.ts");
    fs.writeFileSync(filePath, formatStatements(factory, statements));
  }

  {
    const codeGenerator = new ClientTsCodeGenerator(factory, apiModel);
    const statements = codeGenerator.getStatements();
    const filePath = path.join(options.directoryPath, "client.ts");
    fs.writeFileSync(filePath, formatStatements(factory, statements));
  }

  {
    const codeGenerator = new ServerTsCodeGenerator(factory, apiModel);
    const statements = codeGenerator.getStatements();
    const filePath = path.join(options.directoryPath, "server.ts");
    fs.writeFileSync(filePath, formatStatements(factory, statements));
  }
}
