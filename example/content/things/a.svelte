<script context="module">
    export function post(req) {
        return {
            status: 200,
            props: {
                name: req.body.name
            }
        }
    }
</script>

<script>
    export let name
</script>

<div>
    Posted Name: {name}
</div>
