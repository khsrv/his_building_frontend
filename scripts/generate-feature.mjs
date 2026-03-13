#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function toKebabCase(input) {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function toPascalCase(input) {
  return input
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("");
}

function writeFileSafe(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`skip (exists): ${filePath}`);
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`create: ${filePath}`);
}

const rawFeatureName = process.argv[2];
if (!rawFeatureName) {
  console.error("Usage: npm run generate:feature -- <feature-name>");
  process.exit(1);
}

const featureName = toKebabCase(rawFeatureName);
if (!featureName) {
  console.error("Invalid feature name");
  process.exit(1);
}

const featureNamePascal = toPascalCase(featureName);
const rootDir = process.cwd();
const featureRoot = path.join(rootDir, "src", "modules", featureName);

const files = [
  {
    file: path.join(featureRoot, "domain", "entities.ts"),
    content: `export interface ${featureNamePascal}Item {\n  id: string;\n  title: string;\n  createdAtIso: string;\n}\n`,
  },
  {
    file: path.join(featureRoot, "domain", "errors.ts"),
    content: `export class ${featureNamePascal}DomainError extends Error {\n  constructor(message: string) {\n    super(message);\n    this.name = "${featureNamePascal}DomainError";\n  }\n}\n`,
  },
  {
    file: path.join(featureRoot, "application", "ports.ts"),
    content: `import type { ${featureNamePascal}Item } from "@/modules/${featureName}/domain/entities";\n\nexport interface ${featureNamePascal}Repository {\n  list(): Promise<${featureNamePascal}Item[]>;\n}\n`,
  },
  {
    file: path.join(featureRoot, "application", "use-cases", `list-${featureName}.use-case.ts`),
    content: `import type { ${featureNamePascal}Repository } from "@/modules/${featureName}/application/ports";\n\nexport function createList${featureNamePascal}UseCase(repository: ${featureNamePascal}Repository) {\n  return async function list${featureNamePascal}() {\n    return repository.list();\n  };\n}\n`,
  },
  {
    file: path.join(featureRoot, "infrastructure", "dto.ts"),
    content: `export interface ${featureNamePascal}ItemDto {\n  id: string;\n  title: string;\n  created_at: string;\n}\n\nexport interface ${featureNamePascal}ListResponseDto {\n  data: ${featureNamePascal}ItemDto[];\n}\n`,
  },
  {
    file: path.join(featureRoot, "infrastructure", "mappers.ts"),
    content: `import type { ${featureNamePascal}Item } from "@/modules/${featureName}/domain/entities";\nimport type { ${featureNamePascal}ItemDto } from "@/modules/${featureName}/infrastructure/dto";\n\nexport function map${featureNamePascal}DtoToDomain(dto: ${featureNamePascal}ItemDto): ${featureNamePascal}Item {\n  return {\n    id: dto.id,\n    title: dto.title,\n    createdAtIso: dto.created_at,\n  };\n}\n`,
  },
  {
    file: path.join(featureRoot, "infrastructure", "repository.ts"),
    content: `import type { ${featureNamePascal}Repository } from "@/modules/${featureName}/application/ports";\nimport { createList${featureNamePascal}UseCase } from "@/modules/${featureName}/application/use-cases/list-${featureName}.use-case";\nimport type { ${featureNamePascal}ListResponseDto } from "@/modules/${featureName}/infrastructure/dto";\nimport { map${featureNamePascal}DtoToDomain } from "@/modules/${featureName}/infrastructure/mappers";\nimport { httpRequest } from "@/shared/lib/http/http-client";\n\nexport class Api${featureNamePascal}Repository implements ${featureNamePascal}Repository {\n  async list() {\n    const response = await httpRequest<${featureNamePascal}ListResponseDto>("/${featureName}", { method: "GET" });\n    return response.data.map(map${featureNamePascal}DtoToDomain);\n  }\n}\n\nconst repository = new Api${featureNamePascal}Repository();\nexport const list${featureNamePascal} = createList${featureNamePascal}UseCase(repository);\n`,
  },
  {
    file: path.join(featureRoot, "presentation", "query-keys.ts"),
    content: `export const ${featureName.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}QueryKeys = {\n  all: ["${featureName}"] as const,\n  list: () => ["${featureName}", "list"] as const,\n};\n`,
  },
  {
    file: path.join(featureRoot, "presentation", "hooks", `use-${featureName}.query.ts`),
    content: `"use client";\n\nimport { useQuery } from "@tanstack/react-query";\nimport { list${featureNamePascal} } from "@/modules/${featureName}/infrastructure/repository";\nimport { ${featureName.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}QueryKeys } from "@/modules/${featureName}/presentation/query-keys";\n\nexport function use${featureNamePascal}Query() {\n  return useQuery({\n    queryKey: ${featureName.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}QueryKeys.list(),\n    queryFn: list${featureNamePascal},\n  });\n}\n`,
  },
  {
    file: path.join(featureRoot, "presentation", "components", `${featureName}-list.tsx`),
    content: `"use client";\n\nimport { use${featureNamePascal}Query } from "@/modules/${featureName}/presentation/hooks/use-${featureName}.query";\nimport { PageState } from "@/shared/ui/feedback/page-state";\n\nexport function ${featureNamePascal}List() {\n  const { data = [], isLoading, error } = use${featureNamePascal}Query();\n\n  return (\n    <section className=\"space-y-2\">\n      <PageState isEmpty={data.length === 0} isLoading={isLoading} error={error}>\n        <ul className=\"space-y-2\">\n          {data.map((item) => (\n            <li className=\"rounded border border-border p-3\" key={item.id}>\n              <p className=\"font-medium\">{item.title}</p>\n              <p className=\"text-xs text-muted-foreground\">{item.createdAtIso}</p>\n            </li>\n          ))}\n        </ul>\n      </PageState>\n    </section>\n  );\n}\n`,
  },
  {
    file: path.join(featureRoot, "presentation", "index.ts"),
    content: `export { ${featureNamePascal}List } from "@/modules/${featureName}/presentation/components/${featureName}-list";\n`,
  },
];

files.forEach(({ file, content }) => writeFileSafe(file, content));

console.log(`\nFeature scaffold ready: src/modules/${featureName}`);
