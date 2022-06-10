import express from "express"

import heph from "@axel669/hephaestus"

const server = express()

server.use(
    express.urlencoded({ extended: true })
)
server.use(
    await heph({
        source: "content",
        // error: "$error.svelte",
        pass: /^api\//,
    })
)

server.listen(
    2002,
    () => console.log("running")
)
