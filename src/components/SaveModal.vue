<template>
  <transition name="modal-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
      @click.self="$emit('close')"
    >
      <div
        class="relative w-full max-w-lg overflow-hidden rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <div
          class="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Save Snippet
          </h2>
          <button
            @click="$emit('close')"
            class="rounded-md p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div class="mt-4 space-y-4">
          <div>
            <label
              for="title"
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >Title</label
            >
            <input
              type="text"
              id="title"
              v-model="snippetData.title"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label
              for="description"
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >Description</label
            >
            <textarea
              id="description"
              v-model="snippetData.description"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label
              for="tags"
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >Tags (Comma Separated)</label
            >
            <input
              type="text"
              id="tags"
              v-model="snippetData.tags"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div
          class="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700"
        >
          <button
            @click="$emit('close')"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            @click="saveSnippet"
            class="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close", "save"],
  setup(props, { emit }) {
    const snippetData = ref({
      title: "",
      description: "",
      tags: "",
    });

    const saveSnippet = () => {
      emit("save", { ...snippetData.value });
      emit("close");
      snippetData.value = {
        title: "",
        description: "",
        tags: "",
      };
    };

    watch(
      () => props.isVisible,
      (newValue) => {
        if (newValue) {
          snippetData.value = {
            title: "",
            description: "",
            tags: "",
          };
        }
      }
    );

    return {
      snippetData,
      saveSnippet,
    };
  },
});
</script>

<style scoped>
/* Tambahkan properti CSS backdrop-filter di sini */
.fixed.inset-0.bg-opacity-50 {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px); /* Untuk kompatibilitas Safari */
}

/* Transisi untuk modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
