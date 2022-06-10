<script context="module">
    export async function buildProps() {
        return {
            when: new Date()
        }
    }

    export async function get(req) {
        return {
            status: 200,
            props: {
                when: new Date(),
                who: req.query.user,
            }
        }
    }
</script>

<script>
    export let when
    export let who

    const titleTime = when.toString()
</script>

<svelte:head>
    <title>Index @{titleTime}</title>
</svelte:head>

<div>
    I'm the index! Hi, {who}
    <div>
        Load Time: {titleTime}
    </div>
</div>
