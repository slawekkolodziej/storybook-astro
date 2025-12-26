<script lang="ts">
  interface AccordionItem {
    title: string;
    content: string;
  }

  let { items = $bindable([]), allowMultiple = false }: {
    items?: AccordionItem[];
    allowMultiple?: boolean;
  } = $props();

  let openIndexes = $state<number[]>([]);

  function toggleItem(index: number) {
    if (allowMultiple) {
      const idx = openIndexes.indexOf(index);
      if (idx > -1) {
        openIndexes = openIndexes.filter(i => i !== index);
      } else {
        openIndexes = [...openIndexes, index];
      }
    } else {
      openIndexes = openIndexes.includes(index) ? [] : [index];
    }
  }

  function isOpen(index: number): boolean {
    return openIndexes.includes(index);
  }
</script>

<div data-testid="svelte-accordion" class="accordion">
  {#each items as item, index}
    <div class="accordion-item">
      <button
        class="accordion-header"
        on:click={() => toggleItem(index)}
        aria-expanded={isOpen(index)}
      >
        {item.title}
        <span class="accordion-icon">
          {isOpen(index) ? '−' : '+'}
        </span>
      </button>
      {#if isOpen(index)}
        <div class="accordion-content">
          {item.content}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .accordion {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }
  .accordion-item {
    border-bottom: 1px solid #e0e0e0;
  }
  .accordion-item:last-child {
    border-bottom: none;
  }
  .accordion-header {
    width: 100%;
    padding: 1rem;
    background: #f5f5f5;
    border: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.2s;
  }
  .accordion-header:hover {
    background: #ebebeb;
  }
  .accordion-icon {
    font-size: 1.25rem;
    font-weight: bold;
  }
  .accordion-content {
    padding: 1rem;
    background: white;
  }
</style>
