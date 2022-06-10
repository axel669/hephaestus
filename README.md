# Hephaestus
Library for doing fast and dirty work with generating static content from
svelte files on a server.

## Installation
```bash
yarn add @axel669/hephaestus
```

## Usage

### Svelte Context Script
Hephaestus uses the `<script context="module">` feature of Svelte to pass
information to components when they are rendered (either on page load, or
during the build proces).

A user should treat this script as a hook that runs when a page is loaded as
a component, before it is rendered in any context.

The `buildProps` and `get` functions are optional exports for build-time and
http GET requests to render, but `post` **must** be exported if the page
needs to respond to a POST request.

```html
<script context="module">
    //  buildProps runs during the build phase (never during dynamic renders
    //  in a server). The return value is an object that will be used as the
    //  props that are passed into the component when rendering it.
    export async function buildProps() {
        return {
            when: new Date()
        }
    }

    //  The get/post functions are used to respond to http requests to the page.
    //  Both functions can be optoinally async, and both take a single argument
    //  that is the Express Request object, unmodified.
    //  The return value should have a "status" property that is an http status
    //  code to use for the response, and either a "redirect" or "props"
    //  property.
    //  The "redirect" property should be a URL to redirect to, and the status
    //  property should say which kind of redirection it is (will default to
    //  302 if one is not given).
    //  The "props" property is an object that will be passed as the props to
    //  the component when it is rendered and sent.
    export async function get(req) {
        return {
            status: 200,
            props: {
                when: new Date(),
                who: req.query.user,
            }
        }
    }

    export function post(req) {
        return {
            status: 200,
            props: {
                name: req.body.name
            }
        }
    }
</script>
```

### Express
```js
import express from "express"
import heph from "@axel669/hephaestus"

const server = express()

server.use(
    await heph({
        source: "content",
        error: "$error.svelte",
        pass: /^api\//,
    })
)
```

#### Expess API
```js
heph(config)

config {
    //  source is the directory where the svelte files are.
    //  Files named $layout are automatically wrapped around page files inside
    //  the given folder, and are nested in the order of the folders.
    //  files that are prefixed with "$" will not be loaded as pages, but can
    //  still be imported as components normally.
    "source": String,

    //  The filename of the error page (recommended to use $error.svelte).
    //  The error page does not have any layout applied to it, and is sent
    //  for any non 2xx response that is not a redirect.
    //  Optional
    "error?": String,

    //  Any route that matches the given regex will not be processed at all
    //  and handed to the next middleware function as normal for express.
    //  If a route is not passed on and is not found as a page, a 404 is
    //  returned even if a later piece of middleware might have it.
    //  Optional
    "pass?": RegExp,
}
```

### Static Build
`package.json`
```json
{
    "scripts": {
        "build-static": "heph config.mjs"
    }
}
```

#### CLI Config
> `.mjs` file
```js
export default {
    //  source is the directory where the svelte files are.
    //  Files named $layout are automatically wrapped around page files inside
    //  the given folder, and are nested in the order of the folders.
    //  files that are prefixed with "$" will not be loaded as pages, but can
    //  still be imported as components normally.
    "source": "content",

    //  The filename of the error page (recommended to use $error.svelte).
    //  The error page does not have any layout applied to it.
    //  Optional
    "error?": "$error.svelte",

    //  The output folder for the static files.
    "dest": "public",

    //  Hooks that are run at specific times in the build process.
    "hooks?": {
        //  Hook that is run at startup, before any files are loaded or
        //  processed.
        async init() {
        },
        //  Hook that is run after all files have been written to disk.
        async done() {
        }
    }
}
```

## TODO
- possibly add more hooks around build events
Open to sugestions for features.
