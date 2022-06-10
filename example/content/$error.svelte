<script context="module">
    export function buildProps() {
        return {
            message: "This is not the page you are looking for"
        }
    }
</script>

<script>
    export let message
    export let status
</script>

<style>
    div {
        background-color: teal;
        text-align: center;
        font-size: 16px;
    }
</style>

<svelte:head>
    <title>Error {status ?? ""}</title>
</svelte:head>

<div>
    {message}
</div>
