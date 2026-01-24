export type EndpointDefinition<I, O> = {
  /** Endpoint name without namespace, e.g. "get" */
  name: string;
  /** Actual implementation */
  handler: (input: I) => Promise<O> | O;
};

export type ApiModuleDefinition = {
  /** Namespace, e.g. "prompt" */
  namespace: string;
  endpoints: EndpointDefinition<any, any>[];
};

export class ApiRegistry {
  private readonly endpoints = new Map<string, EndpointDefinition<any, any>>();
  private readonly apiTree: Record<string, any> = Object.create(null);

  registerModule(moduleDef: ApiModuleDefinition) {
    if (!moduleDef?.namespace) throw new Error('ApiModuleDefinition.namespace is required');

    if (!this.apiTree[moduleDef.namespace]) {
      this.apiTree[moduleDef.namespace] = Object.create(null);
    }

    for (const ep of moduleDef.endpoints) {
      const fullName = `${moduleDef.namespace}.${ep.name}`;
      if (this.endpoints.has(fullName)) {
        throw new Error(`Duplicate endpoint: ${fullName}`);
      }

      this.endpoints.set(fullName, ep);

      // Create a friendly namespace object API.
      this.apiTree[moduleDef.namespace][ep.name] = (input: any) => this.call(fullName, input);
    }
  }

  async call<TInput, TOutput>(fullName: string, input: TInput): Promise<TOutput> {
    const ep = this.endpoints.get(fullName);
    if (!ep) throw new Error(`Unknown endpoint: ${fullName}`);
    return await ep.handler(input);
  }

  /**
   * Lists all endpoints in "namespace.endpoint" format.
   */
  listEndpoints(): string[] {
    return Array.from(this.endpoints.keys()).sort();
  }

  /**
   * Documentation path convention.
   * Docs are maintained under /docs following the API path.
   * Example: "prompt.get" -> "docs/prompt/get.md"
   */
  getDocPath(fullName: string): string {
    const [namespace, endpoint] = fullName.split('.', 2);
    if (!namespace || !endpoint) return '';
    return `docs/${namespace}/${endpoint}.md`;
  }

  /**
   * Public API exposed to window.ST_API
   */
  getPublicApi(version: string) {
    return {
      version,
      call: this.call.bind(this),
      listEndpoints: this.listEndpoints.bind(this),
      getDocPath: this.getDocPath.bind(this),
      ...this.apiTree,
    };
  }
}
