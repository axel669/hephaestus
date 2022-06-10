import path from "path"

import { scan, injectHTML } from "./core.mjs"
import loadComponent from "./setup.js"

const basicGET = {
    status: 200,
    props: {}
}
function loadErrorPage(config) {
    if (config.error === undefined) {
        return loadComponent("./error.svelte")
    }

    return loadComponent(
        path.resolve(
            config.source,
            config.error
        )
    )
}
export default async function init(config) {
    const pages = await scan(config.source)
    const wrapper = loadComponent("./renderer.svelte")
    const error = loadErrorPage(config)

    return async function(req, res, next) {
        const page = pages[req.path]
        const method = req.method.toLowerCase()

        if (config.pass !== undefined && config.pass.test(req.path) === true) {
            return next()
        }

        const invalidPage = (
            page === undefined
            || (
                page[method] === undefined
                && method !== "get"
            )
        )
        if (invalidPage === true) {
            res.status(404)
                .send(
                    injectHTML(
                        error.default.render({
                            status: 404,
                            message: "Not Found"
                        })
                    )
                )
            return
        }

        const value = await page[method]?.(req) ?? basicGET

        if (value.redirect !== undefined) {
            res.redirect(
                value.status ?? 302,
                value.redirect
            )
            return
        }

        if (value.status !== 200) {
            res.status(value.status)
                .send(value.message)
            return
        }

        const content = wrapper.default.render({
            seq: [
                ...page.layout,
                {
                    component: page.component,
                    props: value.props
                }
            ]
        })
        res.send(
            injectHTML(content)
        )
    }
}
