See the [WikiPages README](https://github.com/RumbleWikis/WikiPages), and [Middlewares README](https://github.com/RumbleWikis/WikiPages-Middleware)

[npm](https://npmjs.com/package/@rumblewikis/wikipages-deno-bundler-middleware)
[GitHub](https://github.com/RumbleWikis/WikiPages-Middleware/tree/master/middleware/deno-bundler)

Bundles `.jsx`, `.tsx`, `.js`, and `.ts` files into `.js` files using the Deno bundler.

Settings index: `denoBundler`

Settings parameters:
* `parameters?: []`
  * Extra parameters for Deno Bundle.
* `useBabel?: boolean`
  * Whether or not it use should use Babel.transform afterwards.