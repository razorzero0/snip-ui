<template>
  <div
    class="flex flex-col"
    :style="{ width: previewWidth }"
    ref="previewContainer"
  >
    <div class="flex border-b bg-gray-100 items-center px-4 py-2">
      <span class="text-sm font-medium text-gray-700">Preview</span>
      <div class="ml-auto flex items-center gap-2">
        <label class="text-xs text-gray-600 font-medium">Framework:</label>
        <div class="relative">
          <select
            :value="selectedFramework"
            @change="$emit('update:selected-framework', $event.target.value)"
            class="text-xs bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            class="absolute inset-0 bg-white bg-opacity-90 rounded flex items-center justify-center"
          >
            <div
              class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"
            ></div>
          </div>
        </div>
      </div>
      <div class="ml-4 text-xs text-gray-500 font-mono">
        {{ previewDimensions }}
      </div>
    </div>
    <div class="flex-1 overflow-auto bg-white relative" ref="previewContent">
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 z-10 flex items-center justify-center animate-pulse"
      >
        <div class="text-center">
          <div class="relative">
            <div
              class="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"
            ></div>
            <div
              class="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"
            ></div>
            <div
              class="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
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
          <div class="mt-3 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
              style="animation-duration: 1.5s"
            ></div>
          </div>
        </div>
      </div>
      <iframe
        class="w-full h-full border-0 transition-opacity duration-300"
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
  emits: ["update:selected-framework", "dimensions-ready"],
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

    // 🔹 Tambahkan watch agar update saat previewWidth berubah
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
