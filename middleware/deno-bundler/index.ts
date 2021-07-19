import { spawnSync } from "child_process";
import * as babel from "@babel/core";
// @ts-ignore: Ignore any
import babelPluginProposalClassProperties from "@babel/plugin-proposal-class-properties";
// @ts-ignore: Ignore any
import babelPluginProposalOptionalChaining from "@babel/plugin-proposal-optional-chaining";
// @ts-ignore: Ignore any
import babelPresetEnv from "@babel/preset-env";

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

/**
 * Settings for Deno Bundler.
 */
interface DenoBundlerSettings {
  /**
   * Extra parameters for Deno Bundle.
   */
  parameters?: string[];
  /**
   * Whether or not it use should use babel afterwards.
   */
  useBabel?: boolean;
}

const denoBundler: Middleware = {
  matchShortExtension: /^\.((\j|\t)sx?)$/,
  settingsIndex: "denoBundler",
  execute: (file, settings?: DenoBundlerSettings) => {
    const bundle = spawnSync("deno", [
      "bundle",
      ...settings?.parameters || [],
      file.originalDirectory
    ]);

    if (bundle.error) return { ...file, shouldCommit: false };

    if (settings?.useBabel) return { 
      ...file,
      source: bundle.stdout.toString(),
      path: `${file.path}.js`
    }

    const transformed = babel.transformSync(bundle.stdout.toString(), {
      presets: [[babelPresetEnv, { targets: "> 0.25%, not dead" }]],
      plugins: [
        babelPluginProposalClassProperties,
        babelPluginProposalOptionalChaining,
      ],
    });

    if (!transformed?.code) return { ...file, shouldCommit: false };

    return {
      ...file,
      source: transformed.code,
      path: `${file.path}${file.longExtension.slice(0, -(file.shortExtension))}.js`
    }
  }
}

export default denoBundler;