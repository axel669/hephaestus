<script context="module">
    export function get(req) {
        if (req.query.user === undefined) {
            return {
                redirect: "wat?user=Nobody"
            }
        }

        return {
            status: 200,
            props: {
                user: req.query.user
            }
        }
    }
</script>

<script>
    export let user
</script>

<div>
    Hi, {user}
</div>
