<script>
  let count = 1;

  function increment() {
    count += 1;
  }
</script>

<div>
  Svelte counter: {count}
  <button on:click={increment}>+1</button>
</div>