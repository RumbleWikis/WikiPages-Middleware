import { spawnSync } from "child_process";
import * as babel from "@babel/core";
// @ts-ignore: Ignore any
import babelPluginProposalClassProperties from "@babel/plugin-proposal-class-properties";
// @ts-ignore: Ignore any
import babelPluginProposalOptionalChaining from "@babel/plugin-proposal-optional-chaining";
// @ts-ignore: Ignore any
import babelPresetEnv from "@babel/preset-env";

import type { Middleware } from "@rumblewikis/wikipages";

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
  type: "Page",
  matchShortExtension: /^\.(j|t)sx?$/,
  settingsIndex: "denoBundler",
  execute: (file, settings?: DenoBundlerSettings) => {
    const bundle = spawnSync("deno", [
      "bundle",
      ...settings?.parameters || [],
      file.originalPath!
    ]);

    if (!bundle.stdout.length) {
      file.errors.push(new Error(bundle.stderr));
      return file.change({ shouldCommit: false })
    };

    if (!settings?.useBabel)
      return file.change({ 
        source: bundle.stdout.toString(),
        path: `${file.path}.js`
      });

    const transformed = babel.transformSync(bundle.stdout.toString(), {
      presets: [[babelPresetEnv, { targets: "> 0.25%, not dead" }]],
      plugins: [
        babelPluginProposalClassProperties,
        babelPluginProposalOptionalChaining,
      ],
    });

    if (!transformed?.code) {
      file.errors.push(new Error("babel.transformSync sent no code"));
      return file.change({ shouldCommit: false })
    };


    return file.change({
      source: transformed.code,
      path: `${file.path}.js`
    });
  }
}

export default denoBundler;