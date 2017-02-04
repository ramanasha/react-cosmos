# React Cosmos [![Build Status](https://travis-ci.org/react-cosmos/react-cosmos.svg?branch=master)](https://travis-ci.org/react-cosmos/react-cosmos) [![Coverage Status](https://coveralls.io/repos/react-cosmos/react-cosmos/badge.svg?branch=master)](https://coveralls.io/r/react-cosmos/react-cosmos?branch=master) [![Join the chat at https://gitter.im/skidding/cosmos](https://img.shields.io/gitter/room/gitterHQ/gitter.svg)](https://gitter.im/skidding/cosmos?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#how-to-contribute)

DX tool for designing reusable [React](http://facebook.github.io/react/) components

![Cosmos](cosmos-150.png)

Cosmos scans your project for React components and loads them inside [Component Playground](https://react-cosmos.github.io/),
enabling you to:

1. Render your components under any combination of props, context and state
2. See component states evolve in real-time as you interact with running
instances

> Working with Cosmos improves component design because it
surfaces implicit dependencies. It also forces you to define sane inputs
for your components, making them predictable and easier to debug down the
road.

![Component Playground](intro.gif)

Read the story of React Cosmos: [Fighting for Component Independence.](https://medium.com/@skidding/fighting-for-component-independence-2a762ee53272)

## Requirements

- [x] Node >=5 and npm >=3 (older versions might work but aren't guaranteed)
- [x] React >=0.13
- [x] webpack or Browserify (or go rogue and roll your own)
- [ ] [Fixtures](examples/flatris/src/components/__fixtures__) to define states for your components (you'll do this after you get started)

## Usage

The easiest way to use React Cosmos is [alongside webpack](examples/flatris/webpack). Making it work with Browserify takes extra work, but a [complete example](examples/flatris/browserify) is available.

### react-cosmos-webpack

Extends your existing webpack config (or uses a [default config](packages/react-cosmos-webpack/src/default-webpack-config.js)) and starts a dev server for Component Playground tuned to your codebase.

By default, it looks for a `__fixtures__` dir next to your components.

```bash
src/components/Button.jsx
src/components/__fixtures__/Button/default.js
src/components/__fixtures__/Button/disabled.js

# also works if you have one folder per component
src/components/Button/Button.jsx
src/components/Button/__fixtures__/default.js
src/components/Button/__fixtures__/disabled.js
```

Follow these steps to get started:

**Step 1: Install package**

```bash
npm i -D react-cosmos-webpack
```

**Step 2: Add `cosmos.config.js` to your project root**

```js
// cosmos.config.js
module.exports = {
  componentPaths: ['src/components'],
};
```

**Step 3: Start and [load playground](http://localhost:8989)** 🎉

```bash
node_modules/.bin/cosmos
# or
node_modules/.bin/cosmos --config path/to/cosmos.config.js
```

**Bonus: Create `npm run cosmos` script for extra sugar**

```js
// package.json
"scripts": {
  "cosmos": "cosmos"
}
```

Voilà! Now you can [extend your config](#configuration), start [creating fixtures](docs/fixtures.md) or be kind and [report what went wrong.](https://github.com/react-cosmos/react-cosmos/issues)

#### *"Cannot GET /loader/"*

Chances are you'll be faced with a blank page when opening *localhost:8989*. There
are two methods for configuring `index.html`:

- Use [HTML Webpack Plugin.](https://github.com/ampedandwired/html-webpack-plugin) See [Flatris example.](https://github.com/react-cosmos/react-cosmos/blob/a33b53ad533ad340fd81335e9d047f90e63c1ff6/examples/flatris/webpack/webpack.config.js#L37-L39)
- Use the `publicPath` option to target the parent folder of your index.html. Details below.

The former is recommended, otherwise **the script tag from your index.html needs to match the webpack *output.filename* generated by react-cosmos-webpack (i.e. `src="bundle.js"`).** [Read more.](https://github.com/react-cosmos/react-cosmos/issues/225#issuecomment-261623836)

#### Configuration

All the options supported by `cosmos.config.js`.

```js
// cosmos.config.js
module.exports = {
  // Read components from multiple locations. Useful for including Redux
  // containers or if you split your UI per sections.
  componentPaths: [
    'src/components',
    'src/containers'
  ],

  // Additional paths to search for fixtures, besides the __fixtures__ folder
  // nested inside component paths. Useful if you keep fixture files separated
  // from components files.
  fixturePaths: [
    'test/fixtures'
  ],

  // Additional entry points that should be present along with any component.
  // Sad, but inevitable.
  globalImports: [
    './reset.css',
    './global.css',
  ],

  // Components will not be loaded in the playground if their names match these.
  // There's no excuse for components that can't be loaded independently, but
  // if you store HoCs (which export functions) next to regular components, well,
  // what are you gonna do, not use this wonderful tool?
  ignore: [
    /notATrueComponent/,
    /itsComplicated/,
    /itsNotMeItsYou/,
  ],

  // Where to serve static files from. Like --content-base in webpack-dev-server.
  publicPath: 'src/public',

  // Read more about proxies below
  proxies: [
    './redux-proxy.js',
    './context-proxy.js',
  ],

  // Render inside custom root element. Useful if that root element already
  // has styles attached, but bad for encapsulation.
  containerQuerySelector: '#app',

  // Enable hot module replacement. Use together with `hmrPlugin` option
  // depending on your webpack configuration.
  hot: true,

  // Add webpack.HotModuleReplacementPlugin. Don't enable this if your webpack
  // config already adds it.
  hmrPlugin: true,

  // These ones are self explanatory
  hostname: 'localhost',
  port: 8989,
  webpackConfigPath: './config/webpack.config.dev',
};
```

#### Using webpack 2

From [the new webpack docs](https://webpack.js.org/guides/migrating/#mixing-es2015-with-amd-and-commonjs):

> It is important to note that you will want to tell Babel to not parse these module symbols so webpack can use them. You can do this by setting the following in your `.babelrc` or babel-loader options.
>
> ```json
> {
>  "presets": [
>    ["es2015", { "modules": false }]
>  ]
> }
> ```

#### Using babel-node

Unless you pass it the `--plain` param, react-cosmos-webpack runs with `babel-node` by default. This is nice because it allows you to write your configs using the same syntax as your source code.

### Proxies

Proxies are a plugin system for React Cosmos, allowing fixtures to go beyond mocking *props* and *state*. As regular React components, they compose in the order they are listed in your config and decorate the functionality of the loaded component, while respecting the contract to render the next proxy in the chain.

The added functionality can range from mocking Redux state (or server requests made from your components) to creating a resizable viewport for seeing how components behave at different scales.

#### react-cosmos-redux-proxy

Most components in a Redux app depend on Redux state–either they're a *container* or one of their descendants is. This proxy creates the store context required for any component you load, just like [Provider](http://redux.js.org/docs/basics/UsageWithReact.html#passing-the-store) does for your root component. Writing Redux fixtures almost feels too easy. Because Redux state is global, once you have one state mock you can render any component you want!

```js
// redux-proxy.js
import createReduxProxy from 'react-cosmos-redux-proxy';

export default () => {
  return createReduxProxy({
    // Called when fixture loads with fixture.reduxState as initial state.
    // See examples/flatris
    createStore: (initialState) => {
      return Redux.createStore(yourReducer, initialState, yourMiddleware);
    },
  })
};
```

#### react-cosmos-context-proxy

Very convenient if your app uses component context. You can provide generic context using a base fixture that all other fixtures extend.

```js
// context-proxy.js
import createContextProxy from 'react-cosmos-context-proxy';

export default () => {
  return createContextProxy({
    // Expects fixture.context to contain `theme` object
    // See examples/context
    childContextTypes: {
      theme: React.PropTypes.object.isRequired,
    },
  });
};
```

*What proxy would you create to improve DX?*

## Thank you!

Explore the [Contributing Guide](CONTRIBUTING.md) for more information.

*Thanks to [Kreativa Studio](http://www.kreativa-studio.com/) for the Cosmos logo.*
