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
async function build(config) {
    const {
        source,
        error,
        dest,
        hooks,
    } = config
    const {
        init = () => { },
        done = () => { },
    } = hooks

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

    await done()
}

export default build
