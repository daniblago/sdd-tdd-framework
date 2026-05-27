import yaml from 'js-yaml';

const HTTP_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch', 'options', 'head']);

export class ContractExtractor {
  fromYaml(source: string): string[] {
    const doc = yaml.load(source) as { paths?: Record<string, Record<string, unknown>> } | null;
    if (!doc || typeof doc !== 'object' || !doc.paths) {
      throw new Error('OpenAPI inválido: falta la sección "paths"');
    }
    const endpoints: string[] = [];
    for (const [path, operations] of Object.entries(doc.paths)) {
      if (!operations || typeof operations !== 'object') continue;
      for (const key of Object.keys(operations)) {
        if (HTTP_METHODS.has(key.toLowerCase())) {
          endpoints.push(`${key.toUpperCase()} ${path}`);
        }
      }
    }
    return endpoints;
  }
}
