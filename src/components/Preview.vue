<template>
  <div
    class="flex flex-col"
    :style="{ width: previewWidth }"
    ref="previewContainer"
  >
    <div
      class="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2"
    >
      <div class="flex items-center gap-2">
        <button
          @click="$emit('download-image')"
          class="rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          :disabled="isLoading"
        >
          Screenshot
        </button>
        <div class="relative">
          <select
            :value="selectedFramework"
            @change="$emit('update:selected-framework', $event.target.value)"
            class="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isLoading"
          >
            <option
              v-for="framework in frameworks"
              :key="framework.name"
              :value="framework.name"
            >
              {{ framework.name }}
            </option>
          </select>
          <div
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center rounded bg-white bg-opacity-90"
          >
            <div
              class="h-3 w-3 animate-spin rounded-full border-b-2 border-blue-600"
            ></div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="$emit('save-code')"
          class="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          :disabled="isLoading"
        >
          Save
        </button>
        <div class="text-xs font-mono text-gray-500">
          {{ previewDimensions }}
        </div>
      </div>
    </div>
    <div class="relative flex-1 overflow-auto bg-white" ref="previewContent">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      >
        <div class="text-center">
          <div class="relative">
            <div
              class="h-16 w-16 animate-spin rounded-full border-4 border-blue-200"
            ></div>
            <div
              class="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-600"
            ></div>
            <div
              class="absolute top-2 left-2 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-purple-500"
              style="animation-duration: 0.8s; animation-direction: reverse"
            ></div>
          </div>
          <div class="mt-4 text-sm font-medium text-gray-700">
            Loading {{ selectedFramework
            }}<span class="inline-block animate-bounce">.</span
            ><span
              class="inline-block animate-bounce"
              style="animation-delay: 0.1s"
              >.</span
            ><span
              class="inline-block animate-bounce"
              style="animation-delay: 0.2s"
              >.</span
            >
          </div>
          <div class="mt-3 h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              style="animation-duration: 1.5s"
            ></div>
          </div>
        </div>
      </div>
      <iframe
        class="h-full w-full border-0 transition-opacity duration-300"
        :class="{ 'opacity-50': isLoading }"
        :srcdoc="combinedCode"
        style="min-height: 100vh"
        @load="onFrameLoad"
      ></iframe>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
} from "vue";

export default defineComponent({
  props: {
    previewWidth: {
      type: String,
      required: true,
    },
    combinedCode: {
      type: String,
      required: true,
    },
    frameworks: {
      type: Array,
      required: true,
    },
    selectedFramework: {
      type: String,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    previewDimensions: {
      type: String,
      required: true,
    },
  },
  // Tambahkan event 'download-image'
  emits: [
    "update:selected-framework",
    "dimensions-ready",
    "save-code",
    "download-image",
  ],
  setup(props, { emit }) {
    const previewContainer = ref(null);

    const updateDimensions = () => {
      nextTick(() => {
        if (previewContainer.value) {
          const rect = previewContainer.value.getBoundingClientRect();
          emit("dimensions-ready", { width: rect.width, height: rect.height });
        }
      });
    };

    const onFrameLoad = () => updateDimensions();
    const handleWindowResize = () => updateDimensions();

    watch(
      () => props.previewWidth,
      () => {
        updateDimensions();
      }
    );

    onMounted(() => {
      window.addEventListener("resize", handleWindowResize);
      updateDimensions();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleWindowResize);
    });

    return { previewContainer, onFrameLoad };
  },
});
</script>
