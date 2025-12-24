<template>
  <div data-testid="vue-accordion" class="accordion">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="accordion-item"
    >
      <button
        class="accordion-header"
        @click="toggleItem(index)"
        :aria-expanded="isOpen(index)"
      >
        {{ item.title }}
        <span class="accordion-icon">
          {{ isOpen(index) ? '-' : '+' }}
        </span>
      </button>
      <div v-if="isOpen(index)" class="accordion-content">
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'AccordionComponent',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    allowMultiple: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const openIndexes = ref([]);

    const toggleItem = (index) => {
      if (props.allowMultiple) {
        const idx = openIndexes.value.indexOf(index);
        if (idx > -1) {
          openIndexes.value.splice(idx, 1);
        } else {
          openIndexes.value.push(index);
        }
      } else {
        openIndexes.value = openIndexes.value.includes(index) ? [] : [index];
      }
    };

    const isOpen = (index) => {
      return openIndexes.value.includes(index);
    };

    return {
      openIndexes,
      toggleItem,
      isOpen
    };
  }
};
</script>

