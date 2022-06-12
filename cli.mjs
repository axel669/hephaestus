#!/usr/bin/env node

import path from "path"
import url from "url"

import build from "./build.mjs"

const [, , configFile, devFlag] = process.argv

if (configFile === undefined) {
    console.log("no config file given")
    process.exit(1)
}

const config = await import(
    url.pathToFileURL(
        path.resolve(configFile)
    )
)

await build(
    config.default,
    devFlag === "dev"
)
