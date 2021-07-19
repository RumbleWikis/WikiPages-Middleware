import * as sass from "sass";

/**
 * A file interface for WikiPages.
 */
interface WPFile {
  /**
   * The original directory of the file.
   */
  readonly originalDirectory: string;
  /**
   * The short extension of the file, ex `.lua`, not including `.client.lua`
   */
  shortExtension: string;
  /**
   * The long extension o fthe file, ex `.client.lua`, not including **just** `.lua`
   */
  longExtension: string;
  /**
   * The comment for the MediaWiki commit
   */
  commitComment: string;
  /**
   * Whether or not it should commit when it goes through all middlewares
   */
  shouldCommit: boolean;
  /**
   * THe new MediaWiki path of the file.
   */
  path: string;
  /**
   * The source string of the file.
   */
  source: string;
}

/**
 * Middleware that will be called on every file found.
 */
interface Middleware {
  /**
   * The RegExp/string to match in the short extension,  ex `.lua`, not including `.client.lua`
   */
  matchShortExtension?: RegExp | string;
  /**
   * The RegExp/string to match in the long extension, ex `.client.lua`, not including **just** `.lua`
   */
  matchLongExtension?: RegExp | string;
  /**
   * The Regexp/string to match in the path of the file
   */
  matchPath?: RegExp | string;
  /**
   * The settings index to be indexed with
   */
  settingsIndex?: string;
  /**
   * The execute function of the middleware
   */
  execute: (file: WPFile, settings?: Record<string, unknown>) => WPFile
}

const sassCompiler: Middleware = {
  matchShortExtension: /^\.s(c|a)ss$/,
  settingsIndex: "sassCompiler",
  execute: (file, settings?: sass.Options) => {
    try {
      const compiled = sass.renderSync({
        ...settings,
        file: file.originalDirectory
      });

      return {
        ...file,
        path: `${file.path}${file.shortExtension}`,
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