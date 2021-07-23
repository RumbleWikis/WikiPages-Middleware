import * as sass from "sass";

import type { Middleware } from "@rumblewikis/wikipages";

const sassCompiler: Middleware = {
  matchShortExtension: /^\.s(c|a)ss$/,
  settingsIndex: "sassCompiler",
  execute: (file, settings?: sass.Options) => {
    try {
      const compiled = sass.renderSync({
        ...settings,
        file: file.originalPath
      });

      
      return {
        ...file,
        shortExtension: ".css",
        longExtension: `${file.longExtension.slice(0, -file.shortExtension.length)}.css`,
        path: `${file.path}.css`,
        source: compiled.css.toString()
      }
      
    } catch {
      return {
        ...file,
        shouldCommit: false
      }
    }
  }
}

export default sassCompiler;