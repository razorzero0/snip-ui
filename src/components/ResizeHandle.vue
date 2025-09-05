<template>
  <div
    class="w-2 bg-gray-300 cursor-col-resize relative transition-colors duration-200 select-none flex-shrink-0 group"
    :class="{
      'bg-blue-500': isResizing,
      'hover:bg-blue-400': !isResizing,
    }"
    @mousedown="$emit('start-resize', $event)"
    title="Click and drag to resize panels"
  >
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="w-0.5 h-8 bg-white rounded opacity-70 group-hover:opacity-90 transition-opacity"
      ></div>
    </div>
    <div
      v-if="isResizing"
      class="absolute inset-0 bg-blue-500 opacity-50 animate-pulse"
    ></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    isResizing: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["start-resize"],
});
</script>

<style scoped>
.cursor-col-resize:hover {
  background-color: #3b82f6 !important;
}

.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
