<script>
    export let message
    export let status
</script>

<svelte:head>
    <title>Error {status ?? ""}</title>
</svelte:head>

{message}
