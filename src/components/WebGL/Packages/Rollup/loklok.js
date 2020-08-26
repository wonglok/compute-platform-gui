// https://github.com/rollup/plugins/tree/master/packages/virtual
// https://github.com/TrySound/rollup-plugin-string/blob/master/index.js
/* eslint-disable consistent-return */
import path from 'path';

const { createFilter } = require("rollup-pluginutils");

const PREFIX = `virtual:`;

const EXT = `external:`;

export default function virtual({ filesMap, include, exclude }) {
  const resolvedIds = new Map();

  let modules = filesMap

  Object.keys(modules).forEach((id) => {
    resolvedIds.set(path.resolve(id), modules[id]);
  });

  const filter = createFilter(include, exclude);

  return {
    name: 'virtual',

    transform(code, id) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: "" }
        };
      }
    },

    resolveId(id, importer) {
      if (id in modules) {
        return PREFIX + id;
      }

      if (importer) {
        // eslint-disable-next-line no-param-reassign
        if (importer.startsWith(PREFIX)) importer = importer.slice(PREFIX.length);
        const resolved = path.resolve(path.dirname(importer), id);
        if (resolvedIds.has(resolved)) return PREFIX + resolved;
      }
    },

    async load (id) {
      if (id.startsWith(PREFIX)) {
        // eslint-disable-next-line no-param-reassign
        id = id.slice(PREFIX.length);
        let result = id in modules ? modules[id] : resolvedIds.get(id);

        if (filter(id)) {
          return `export default ${JSON.stringify(result)};`
        } else {
          return result
        }
      }
    }
  };
}