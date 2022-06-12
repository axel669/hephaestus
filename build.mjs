import fs from "fs-jetpack"
import path from "path"

import {scan, injectHTML} from "./core.mjs"
import loadComponent from "./setup.js"

async function generateErrorPage(source, dest, errorFile) {
    if (errorFile === undefined) {
        return
    }

    console.log("Loading error page")
    const error = loadComponent(
        path.resolve(source, errorFile)
    )
    const props = await error.buildProps?.() ?? {}
    const content = error.default.render(props)
    const outputFile = errorFile.replace(
        /\.svelte$/,
        ".html"
    )

    console.log("Writing error page")
    await fs.writeAsync(
        `${dest}/${outputFile}`,
        injectHTML(content)
    )
}
async function cleanup(dir, devMode) {
    if (devMode === false) {
        return
    }

    console.log("Cleaning up existing dest folder")
    await fs.removeAsync(dir)
}
async function moveStatic(staticFiles, dest) {
    if (await fs.existsAsync(staticFiles) === false) {
        console.log(`Static file directory "${staticFiles}" doesn't exist`)
        return
    }
    console.log(`Copying static files into ${dest}`)
    await fs.copyAsync(staticFiles, dest, { overwrite: true })
    console.log("Static files copied")
}
async function build(config, devMode = false) {
    const {
        source,
        error,
        dest,
        hooks = {},
        staticFiles = null
    } = config
    const {
        init = () => { },
        done = () => { },
    } = hooks

    await cleanup(dest, devMode)

    await init()
    const pages = await scan(source)
    const wrapper = loadComponent("./renderer.svelte")

    for (const [path, info] of Object.entries(pages)) {
        const props = await info.buildProps?.() ?? {}
        const content = wrapper.default.render({
            seq: [
                ...info.layout,
                {
                    component: info.component,
                    props,
                }
            ]
        })

        const destFile = `${dest}${path}${info.index ? "index" : ""}.html`
        console.log("Writing", destFile)
        await fs.writeAsync(destFile, injectHTML(content))
    }

    await generateErrorPage(source, dest, error)

    await moveStatic(staticFiles, dest)

    await done()
}

export default build
