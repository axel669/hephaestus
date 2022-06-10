<script>
    export let seq

    const target = seq[0]
</script>

{#if target !== undefined}
    <svelte:component this={target.component} {...target.props}>
        <svelte:self seq={seq.slice(1)} />
    </svelte:component>
{/if}
