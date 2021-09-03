import * as sass from "sass";

import type { Middleware } from "@rumblewikis/wikipages";

const sassCompiler: Middleware = {
  type: "Page",
  matchShortExtension: /^\.s(c|a)ss$/,
  settingsIndex: "sassCompiler",
  execute: (file, settings?: sass.Options) => {
    try {
      const compiled = sass.renderSync({
        ...settings,
        file: file.originalPath
      });

      return file.change({
        path: `${file.path}.css`,
        source: compiled.css.toString()
      })
      
    } catch {
      return file.change({
        shouldCommit: false
      });
    }
  }
}

export default sassCompiler;