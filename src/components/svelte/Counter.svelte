<script lang="ts">
  let count = 1;

  function increment() {
    count += 1;
  }
</script>

<div data-testid="svelte-counter">
  <span>Svelte counter: {count}</span>
  <button on:click={increment}>+1</button>
</div>