const svelteCompiler = require("svelte/compiler")
const fs = require("fs")
// const path = require("path")

require.extensions[".svelte"] = function (module, filename) {
    const content = fs.readFileSync(filename, "utf8")
    const { js } = svelteCompiler.compile(
        content,
        {
            generate: "ssr",
            format: "cjs",
            css: false
        }
    )
    // console.log(js.code)
    return module._compile(js.code, filename)
}

module.exports = function(module) {
    return require(module)
}
