<template>
  <div class="flex h-screen w-full">
    <div class="flex flex-col border-r" :style="{ width: editorWidth }">
      <EditorTabs
        :tabs="tabs"
        :active-tab="activeTab"
        @update:active-tab="activeTab = $event"
        @copy-code="copyCode"
      />
      <div class="flex-1 overflow-hidden">
        <codemirror
          v-if="activeTab === 'HTML'"
          v-model="htmlCode"
          :extensions="htmlExtensions"
          class="h-full"
        />
        <codemirror
          v-else-if="activeTab === 'CSS'"
          v-model="cssCode"
          :extensions="cssExtensions"
          class="h-full"
        />
        <codemirror
          v-else-if="activeTab === 'JavaScript'"
          v-model="jsCode"
          :extensions="jsExtensions"
          class="h-full"
        />
      </div>
    </div>

    <ResizeHandle :is-resizing="isResizing" @start-resize="startResize" />

    <Preview
      :preview-width="previewWidth"
      :combined-code="combinedCode"
      :frameworks="frameworks"
      :selected-framework="selectedFramework"
      :is-loading="isLoading"
      :preview-dimensions="previewDimensions"
      @update:selected-framework="onFrameworkChange"
      @dimensions-ready="updatePreviewDimensions"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";
import { Codemirror } from "vue-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { lintGutter } from "@codemirror/lint";
import {
  htmlSyntaxLinter,
  cssSyntaxLinter,
  jsSyntaxLinter,
} from "./utils/linters.js";
import codes from "./assets/codes.json";
import EditorTabs from "./components/EditorTabs.vue";
import Preview from "./components/Preview.vue";
import ResizeHandle from "./components/ResizeHandle.vue";
import frameworks from "./utils/frameworks.js";

export default defineComponent({
  components: { Codemirror, EditorTabs, Preview, ResizeHandle },
  setup() {
    const tabs = ["HTML", "CSS", "JavaScript"];
    const activeTab = ref("HTML");
    const htmlCode = ref(codes.html);
    const cssCode = ref(codes.css);
    const jsCode = ref(codes.js);

    const selectedFramework = ref("Bootstrap");
    const isLoading = ref(false);
    const previewWidthPercent = ref(50);
    const isResizing = ref(false);
    const previewDimensions = ref("0px × 0px");

    const htmlExtensions = computed(() => [
      html(),
      oneDark,
      htmlSyntaxLinter(),
      lintGutter(),
    ]);
    const cssExtensions = computed(() => [
      css(),
      oneDark,
      cssSyntaxLinter(),
      lintGutter(),
    ]);
    const jsExtensions = computed(() => [
      javascript(),
      oneDark,
      jsSyntaxLinter(),
      lintGutter(),
    ]);

    const editorWidth = computed(() => `${100 - previewWidthPercent.value}%`);
    const previewWidth = computed(() => `${previewWidthPercent.value}%`);

    const combinedCode = computed(() => {
      const framework = frameworks.find(
        (f) => f.name === selectedFramework.value
      );
      const cssLink = framework?.css
        ? `<link href="${framework.css}" rel="stylesheet" />`
        : "";
      const jsScript = framework?.js
        ? `<script src="${framework.js}"><\/script>`
        : "";
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          ${cssLink}
          <style>${cssCode.value}</style>
        </head>
        <body>
          ${htmlCode.value}
          ${jsScript}
          <script>${jsCode.value}<\/script>
        </body>
        </html>
      `;
    });

    const copyCode = async () => {
      const codeToCopy =
        activeTab.value === "HTML"
          ? htmlCode.value
          : activeTab.value === "CSS"
          ? cssCode.value
          : jsCode.value;
      try {
        await navigator.clipboard.writeText(codeToCopy);
        const notification = document.createElement("div");
        notification.textContent = "Code copied!";
        notification.className =
          "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 2000);
      } catch (err) {
        console.error("Failed to copy code: ", err);
      }
    };

    const onFrameworkChange = (newFramework) => {
      selectedFramework.value = newFramework;
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 1200);
    };

    let isDragging = false;
    let startX = 0;
    let startEditorWidth = 0;

    const startResize = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      isResizing.value = true;
      startX = e.clientX;
      startEditorWidth = 100 - previewWidthPercent.value;
      document.documentElement.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.body.style.pointerEvents = "none";
      const overlay = document.createElement("div");
      overlay.id = "resize-overlay";
      overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; cursor: col-resize; z-index: 9999; background: transparent;`;
      document.body.appendChild(overlay);
    };

    const handleGlobalMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newEditorWidth = startEditorWidth + deltaPercent;
      const newPreviewWidth = 100 - newEditorWidth;
      if (newPreviewWidth >= 1 && newPreviewWidth <= 100) {
        previewWidthPercent.value = newPreviewWidth;
        updatePreviewDimensions();
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
      isResizing.value = false;
      document.documentElement.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.pointerEvents = "";
      const overlay = document.getElementById("resize-overlay");
      if (overlay) overlay.remove();
      updatePreviewDimensions();
    };

    const updatePreviewDimensions = (dimensions) => {
      if (dimensions) {
        previewDimensions.value = `${Math.round(
          dimensions.width
        )}px × ${Math.round(dimensions.height)}px`;
      }
    };

    onMounted(() => {
      document.addEventListener("mousemove", handleGlobalMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalMouseUp, {
        passive: false,
      });
      window.addEventListener("resize", updatePreviewDimensions);
      updatePreviewDimensions();
    });

    onUnmounted(() => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("resize", updatePreviewDimensions);
      const overlay = document.getElementById("resize-overlay");
      if (overlay) overlay.remove();
    });

    return {
      tabs,
      activeTab,
      htmlCode,
      cssCode,
      jsCode,
      combinedCode,
      oneDark,
      lintGutter,
      htmlExtensions,
      cssExtensions,
      jsExtensions,
      copyCode,
      editorWidth,
      previewWidth,
      startResize,
      isResizing,
      frameworks,
      selectedFramework,
      isLoading,
      onFrameworkChange,
      previewDimensions,
      updatePreviewDimensions,
    };
  },
});
</script>

<style scoped>
:deep(.cm-editor) {
  height: 100%;
}
:deep(.cm-scroller) {
  max-height: calc(100vh - 41px);
  overflow: auto;
}
</style>
