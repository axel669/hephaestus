import fs from "fs-jetpack"
import path from "path"
import url from "url"

import loadComponent from "./setup.js"
import glob from "fast-glob"

const htmlWrapper = await fs.readAsync(
    url.fileURLToPath(
        new URL(
            "./html-wrapper.html",
            import.meta.url,
        )
    ),
    "utf8"
)
function injectHTML(content) {
    return htmlWrapper
        .replace("${head}", content.head)
        .replace("${css}", content.css.code)
        .replace("${html}", content.html)
}

function layoutSeq(seq, layouts) {
    if (seq.length === 0) {
        return []
    }

    const dir = seq.join("")
    return [
        ...layoutSeq(seq.slice(0, -1), layouts),
        layouts[dir],
    ]
}
async function prepLayouts(sourceDir, files) {
    const layoutComponents = {}
    const layoutFiles = files.filter(
        file => file.endsWith("$layout.svelte")
    )
    const layouts = {}

    for (const file of layoutFiles) {
        const dir = file.split("/").slice(0, -1)
        const dirname = dir.join("/")

        console.log("Loading layout:", file)
        const componentInfo = loadComponent(
            path.resolve(
                sourceDir,
                file,
            )
        )
        const props = await componentInfo.buildProps?.() ?? {}
        layoutComponents[dirname] = {
            component: componentInfo.default,
            props,
        }

        layouts[dirname] = layoutSeq(["", ...dir], layoutComponents)
    }

    return layouts
}
async function prepPages(dir, files, layouts) {
    const pages = files.filter(
        file => path.basename(file).startsWith("$") === false
    )

    const routes = {}
    for (const file of pages) {
        const route = `/${file}`
            .replace(/\.svelte$/, "")
            .replace(/\/index$/, "/")
        console.log("Loading page:", file)
        const pageInfo = loadComponent(
            path.resolve(
                dir,
                file,
            )
        )
        const dirname = file.split("/").slice(0, -1).join("/")
        routes[route] = {
            layout: layouts[dirname] ?? [],
            component: pageInfo.default,
            get: pageInfo.get,
            post: pageInfo.post,
            buildProps: pageInfo.buildProps,
            index: path.basename(file) === "index.svelte",
        }
    }

    return routes
}
async function scan(dir) {
    const files = await glob(
        "**/*.svelte",
        {
            cwd: path.resolve(dir),
            onlyFiles: false,
            markDirectories: true,
        }
    )

    const layouts = await prepLayouts(dir, files)
    const pages = await prepPages(dir, files, layouts)

    return pages
}

export {scan, injectHTML}
