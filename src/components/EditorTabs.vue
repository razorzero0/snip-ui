<template>
  <div class="flex border-b bg-gray-100 items-center">
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="$emit('update:active-tab', tab)"
      class="px-4 py-2 text-sm font-medium border-r border-gray-200 hover:bg-gray-50"
      :class="
        activeTab === tab
          ? 'bg-white text-blue-600 border-b-2 border-b-blue-600'
          : 'text-gray-600'
      "
    >
      {{ tab }}
    </button>
    <button
      @click="$emit('copy-code')"
      class="ml-auto mr-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200 flex items-center gap-1"
      title="Copy code"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      Copy
    </button>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    activeTab: {
      type: String,
      required: true,
    },
  },
  emits: ["update:active-tab", "copy-code"],
});
</script>
