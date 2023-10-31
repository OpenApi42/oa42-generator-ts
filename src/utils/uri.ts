export function appendToUriHash(uri: URL, ...paths: (string | number)[]) {
  if (paths.length === 0) {
    return uri;
  }

  const pathsString = paths
    .map((path) => encodeURIComponent(path))
    .map((path) => `/${path}`)
    .join("");

  const hash = (uri.hash === "" ? "#" : uri.hash) + pathsString;

  return new URL(hash, uri);
}
