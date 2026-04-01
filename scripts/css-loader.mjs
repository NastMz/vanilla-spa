export async function resolve(specifier, context, defaultResolve) {
  if (specifier.endsWith(".css")) {
    return {
      shortCircuit: true,
      url: new URL(specifier, context.parentURL).href,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith(".css")) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default undefined;",
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
