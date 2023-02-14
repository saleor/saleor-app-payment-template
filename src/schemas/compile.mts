import Fs from "node:fs/promises";
import Path from "node:path";
import StandaloneCode from "ajv/dist/standalone";
import type { AnySchemaObject } from "ajv";
import { compile } from "json-schema-to-typescript";
import { getAjv } from "./ajv.mjs";
import type { JSONValue } from "@/types.js";

type JSONSchema4 = Parameters<typeof compile>[0];

const __filename = new URL("", import.meta.url).pathname;
const __dirname = new URL(".", import.meta.url).pathname;

async function run() {
  const allSchemas = (await listdir(__dirname)).filter((path) => path.endsWith(`.schema.json`));

  await Promise.all(
    allSchemas.map(async (filepath) => {
      const ajv = getAjv({
        code: {
          source: true,
          esm: true,
          optimize: true,
        },
      });
      const schema = await readJson(filepath);
      const filename = Path.basename(filepath);
      const schemaName = filename.replace(/\.schema\.json$/, "");
      const jsFilename = schemaName + ".mjs";
      const tsFilename = schemaName + ".d.mts";
      const dirname = Path.dirname(filepath);

      const validate = ajv.compile(schema as AnySchemaObject);
      const sourceCode = StandaloneCode(ajv, validate);
      await Fs.writeFile(Path.join(dirname, jsFilename), sourceCode, "utf-8");

      const types = await compile(schema as JSONSchema4, schemaName, { unknownAny: true });
      const typesWithDefaultExport = [
        `import type { ValidateFunction } from "ajv";`,
        types,
        `declare const Validate${schemaName}: ValidateFunction<${schemaName}>;`,
        `export default Validate${schemaName};`,
      ].join("\n");
      await Fs.writeFile(Path.join(dirname, tsFilename), typesWithDefaultExport, "utf-8");

      return { filename, dirname, schemaName };
    }),
  );
}

async function readJson(filepath: string): Promise<JSONValue> {
  const file = await Fs.readFile(filepath, "utf-8");
  return JSON.parse(file) as JSONValue;
}

async function listdir(dir: string): Promise<readonly string[]> {
  const dirs = await Fs.readdir(dir, { withFileTypes: true });
  const nestedDirs = await Promise.all(
    dirs.map((d) => {
      const path = Path.join(dir, d.name);
      if (d.isDirectory()) {
        return listdir(path);
      }
      if (d.isFile()) {
        return path;
      }
    }),
  );
  return nestedDirs.flat().filter((el): el is Exclude<typeof el, undefined> => el !== undefined);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
