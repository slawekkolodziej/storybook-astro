<script>
  let count = 1;

  function increment() {
    count += 1;
  }
</script>

<div data-test-id="svelte-counter">
  <span>Svelte counter: {count}</span>
  <button on:click={increment}>+1</button>
</div>