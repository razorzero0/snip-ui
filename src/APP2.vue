<template>
  <div class="flex h-screen w-full">
    <!-- Editor -->
    <div class="flex flex-col border-r" :style="{ width: editorWidth }">
      <div class="flex border-b bg-gray-100 items-center">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 text-sm font-medium border-r border-gray-200 hover:bg-gray-50"
          :class="
            activeTab === tab
              ? 'bg-white text-blue-600 border-b-2 border-b-blue-600'
              : 'text-gray-600'
          "
        >
          {{ tab }}
        </button>
        <!-- Copy Button -->
        <button
          @click="copyCode"
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
      <div class="flex-1 overflow-hidden">
        <!-- HTML -->
        <codemirror
          v-if="activeTab === 'HTML'"
          v-model="htmlCode"
          :extensions="[html(), oneDark, htmlLinter, lintGutter()]"
          class="h-full"
        />
        <!-- CSS -->
        <codemirror
          v-else-if="activeTab === 'CSS'"
          v-model="cssCode"
          :extensions="[css(), oneDark, cssLinter, lintGutter()]"
          class="h-full"
        />
        <!-- JavaScript -->
        <codemirror
          v-else-if="activeTab === 'JavaScript'"
          v-model="jsCode"
          :extensions="[javascript(), oneDark, jsLinter, lintGutter()]"
          class="h-full"
        />
      </div>
    </div>

    <!-- Resize Handle -->
    <div
      class="w-2 bg-gray-300 cursor-col-resize relative transition-colors duration-200 select-none flex-shrink-0 group"
      :class="{
        'bg-blue-500': isResizing,
        'hover:bg-blue-400': !isResizing,
      }"
      @mousedown="startResize"
      title="Click and drag to resize panels"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="w-0.5 h-8 bg-white rounded opacity-70 group-hover:opacity-90 transition-opacity"
        ></div>
      </div>
      <!-- Visual indicator when dragging -->
      <div
        v-if="isResizing"
        class="absolute inset-0 bg-blue-500 opacity-50 animate-pulse"
      ></div>
    </div>

    <!-- Preview -->
    <div
      class="flex flex-col"
      :style="{ width: previewWidth }"
      ref="previewContainer"
    >
      <!-- Preview Header -->
      <div class="flex border-b bg-gray-100 items-center px-4 py-2">
        <span class="text-sm font-medium text-gray-700">Preview</span>

        <!-- Framework Selector -->
        <div class="ml-auto flex items-center gap-2">
          <label class="text-xs text-gray-600 font-medium">Framework:</label>
          <div class="relative">
            <select
              v-model="selectedFramework"
              @change="onFrameworkChange"
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
            <!-- Loading spinner overlay -->
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

      <!-- Preview Content -->
      <div class="flex-1 overflow-auto bg-white relative" ref="previewContent">
        <!-- Loading overlay with animated background -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 z-10 flex items-center justify-center animate-pulse"
        >
          <div class="text-center">
            <!-- Fancy loading spinner -->
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
            <!-- Loading text with typewriter effect -->
            <div class="mt-4 text-sm font-medium text-gray-700">
              Loading {{ selectedFramework }}
              <span class="inline-block animate-bounce">.</span>
              <span
                class="inline-block animate-bounce"
                style="animation-delay: 0.1s"
                >.</span
              >
              <span
                class="inline-block animate-bounce"
                style="animation-delay: 0.2s"
                >.</span
              >
            </div>
            <!-- Progress bar -->
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
        ></iframe>
      </div>
    </div>
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
import { linter, lintGutter } from "@codemirror/lint";
import codes from "./codes.json"; // Import file JSON

function jsSyntaxLinter() {
  return linter((view) => {
    let diagnostics = [];
    const code = view.state.doc.toString();

    try {
      new Function(code);
    } catch (err) {
      const msg = err.message;

      // Coba cari line & column dari pesan error (misalnya: "Unexpected token ')' (2:10)")
      let line = 1,
        col = 0;
      const match = msg.match(/(\d+):(\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
        col = parseInt(match[2], 10);
      }

      // Konversi line+col ke posisi index dalam string
      const lines = code.split("\n");
      let pos = 0;
      for (let i = 0; i < line - 1 && i < lines.length; i++) {
        pos += lines[i].length + 1; // +1 untuk newline
      }
      pos += col;

      diagnostics.push({
        from: pos,
        to: pos + 1, // tandai karakter yang error
        severity: "error",
        message: msg,
      });
    }

    // 🚨 Check matching brackets { }, ( ), [ ]
    const pairs = [
      { open: "{", close: "}" },
      { open: "(", close: ")" },
      { open: "[", close: "]" },
    ];

    pairs.forEach(({ open, close }) => {
      let openCount = (code.match(new RegExp(`\\${open}`, "g")) || []).length;
      let closeCount = (code.match(new RegExp(`\\${close}`, "g")) || []).length;
      if (openCount !== closeCount) {
        // cari posisi terakhir bracket yang error
        const lastIdx = code.lastIndexOf(openCount > closeCount ? open : close);
        diagnostics.push({
          from: lastIdx >= 0 ? lastIdx : 0,
          to: lastIdx >= 0 ? lastIdx + 1 : code.length,
          severity: "error",
          message: `Mismatched ${open} and ${close}`,
        });
      }
    });

    return diagnostics;
  });
}

function htmlSyntaxLinter() {
  return linter((view) => {
    let diagnostics = [];
    const code = view.state.doc.toString();

    // Regex untuk semua tag
    const tagRegex = /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g;
    let match;
    let stack = [];

    // Daftar void elements (tidak butuh closing tag)
    const voidElements = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    while ((match = tagRegex.exec(code)) !== null) {
      const [full, tagName] = match;
      const tag = tagName.toLowerCase(); // supaya aman case-insensitive
      const isClosing = full.startsWith("</");

      if (!isClosing) {
        // opening tag → hanya push kalau bukan void element
        if (!voidElements.has(tag)) {
          stack.push({ tag, pos: match.index });
        }
      } else {
        // closing tag
        const last = stack[stack.length - 1];
        if (last && last.tag === tag) {
          stack.pop(); // matched
        } else {
          diagnostics.push({
            from: match.index,
            to: match.index + full.length,
            severity: "error",
            message: `Mismatched closing tag </${tag}>`,
          });
        }
      }
    }

    // tag yang masih tersisa (belum ditutup)
    stack.forEach((unclosed) => {
      diagnostics.push({
        from: unclosed.pos,
        to: unclosed.pos + unclosed.tag.length + 1,
        severity: "warning",
        message: `Unclosed tag <${unclosed.tag}>`,
      });
    });

    return diagnostics;
  });
}

function cssSyntaxLinter() {
  return linter((view) => {
    let diagnostics = [];
    const code = view.state.doc.toString();
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(code);
    } catch (err) {
      diagnostics.push({
        from: 0,
        to: code.length,
        severity: "error",
        message: err.message || "CSS syntax error",
      });
    }
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      diagnostics.push({
        from: 0,
        to: code.length,
        severity: "error",
        message: "Mismatched number of { and }",
      });
    }
    return diagnostics;
  });
}

export default defineComponent({
  components: { Codemirror },
  setup() {
    const tabs = ["HTML", "CSS", "JavaScript"];
    const activeTab = ref("HTML");
    const htmlCode = ref(codes.html); // Gunakan kode dari file JSON
    const cssCode = ref(codes.css); // Gunakan kode dari file JSON
    const jsCode = ref(codes.js); // Gunakan kode dari file JSON

    const htmlLinter = htmlSyntaxLinter();
    const cssLinter = cssSyntaxLinter();
    const jsLinter = jsSyntaxLinter();

    // Framework options
    const frameworks = [
      {
        name: "Bootstrap",
        css: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
        js: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
      },
      {
        name: "Tailwind CSS",
        css: "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css",
        js: null,
      },
      {
        name: "Bulma",
        css: "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css",
        js: null,
      },
      {
        name: "Foundation",
        css: "https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/css/foundation.min.css",
        js: "https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/js/foundation.min.js",
      },
      {
        name: "Material Design Lite",
        css: "https://code.getmdl.io/1.3.0/material.indigo-pink.min.css",
        js: "https://code.getmdl.io/1.3.0/material.min.js",
      },
      {
        name: "Semantic UI",
        css: "https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css",
        js: "https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.js",
      },
      {
        name: "Pure CSS",
        css: "https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css",
        js: null,
      },
      {
        name: "None",
        css: null,
        js: null,
      },
    ];

    const selectedFramework = ref("Bootstrap");
    const isLoading = ref(false);

    // Function to handle framework change with loading animation
    const onFrameworkChange = () => {
      isLoading.value = true;

      // Simulate loading time for framework switch
      setTimeout(() => {
        isLoading.value = false;
      }, 1200); // 1.2 seconds loading animation
    };

    // Width management
    const previewWidthPercent = ref(50);
    const isResizing = ref(false);
    const previewContainer = ref(null);
    const previewDimensions = ref("0px × 0px");

    const editorWidth = computed(() => `${100 - previewWidthPercent.value}%`);
    const previewWidth = computed(() => `${previewWidthPercent.value}%`);

    // Function to update preview dimensions
    const updatePreviewDimensions = () => {
      nextTick(() => {
        if (previewContainer.value) {
          const rect = previewContainer.value.getBoundingClientRect();
          previewDimensions.value = `${Math.round(rect.width)}px × ${Math.round(
            rect.height
          )}px`;
        }
      });
    };

    const combinedCode = computed(() => {
      const framework = frameworks.find(
        (f) => f.name === selectedFramework.value
      );

      let cssLink = "";
      let jsScript = "";

      if (framework && framework.css) {
        cssLink = `<link href="${framework.css}" rel="stylesheet" />`;
      }

      if (framework && framework.js) {
        jsScript = `<script src="${framework.js}"><\/script>`;
      }

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

    const copyCode = () => {
      let codeToCopy = "";
      if (activeTab.value === "HTML") codeToCopy = htmlCode.value;
      else if (activeTab.value === "CSS") codeToCopy = cssCode.value;
      else if (activeTab.value === "JavaScript") codeToCopy = jsCode.value;

      navigator.clipboard
        .writeText(codeToCopy)
        .then(() => {
          // Create a temporary notification
          const notification = document.createElement("div");
          notification.textContent = "Code copied!";
          notification.className =
            "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
          document.body.appendChild(notification);
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy code: ", err);
        });
    };

    // Drag resize functionality
    let isDragging = false;
    let startX = 0;
    let startEditorWidth = 0;

    const startResize = (e) => {
      e.preventDefault();
      e.stopPropagation();

      isDragging = true;
      isResizing.value = true;
      startX = e.clientX;
      startEditorWidth = 100 - previewWidthPercent.value; // Get current editor width

      // Set cursor for entire document
      document.documentElement.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.body.style.pointerEvents = "none"; // Prevent iframe from capturing events

      // Create overlay to capture all mouse events
      const overlay = document.createElement("div");
      overlay.id = "resize-overlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        cursor: col-resize;
        z-index: 9999;
        background: transparent;
      `;
      document.body.appendChild(overlay);
    };

    const handleGlobalMouseMove = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;

      // Calculate new editor width (moving right increases editor width)
      const newEditorWidth = startEditorWidth + deltaPercent;
      const newPreviewWidth = 100 - newEditorWidth;

      // Constrain between 20% and 80% for preview
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

      // Reset cursor and selection
      document.documentElement.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.pointerEvents = "";

      // Remove overlay
      const overlay = document.getElementById("resize-overlay");
      if (overlay) {
        overlay.remove();
      }

      // Final dimension update
      updatePreviewDimensions();
    };

    // Window resize handler
    const handleWindowResize = () => {
      updatePreviewDimensions();
    };

    // Global event listeners for mouse events
    onMounted(() => {
      document.addEventListener("mousemove", handleGlobalMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalMouseUp, {
        passive: false,
      });
      window.addEventListener("mousemove", handleGlobalMouseMove, {
        passive: false,
      });
      window.addEventListener("mouseup", handleGlobalMouseUp, {
        passive: false,
      });
      window.addEventListener("resize", handleWindowResize);

      // Initial dimension calculation
      updatePreviewDimensions();
    });

    onUnmounted(() => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("resize", handleWindowResize);

      // Cleanup any remaining state
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
      javascript,
      html,
      css,
      lintGutter,
      htmlLinter,
      cssLinter,
      jsLinter,
      copyCode,
      previewWidthPercent,
      editorWidth,
      previewWidth,
      startResize,
      isResizing,
      handleGlobalMouseMove,
      handleGlobalMouseUp,
      frameworks,
      selectedFramework,
      isLoading,
      onFrameworkChange,
      previewContainer,
      previewDimensions,
    };
  },
});
</script>

<style scoped>
/* Ensure proper height and overflow */
:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  max-height: calc(100vh - 41px); /* Subtract header height */
  overflow: auto;
}

/* Custom scrollbar */
:deep(.cm-scroller)::-webkit-scrollbar {
  width: 8px;
}

:deep(.cm-scroller)::-webkit-scrollbar-track {
  background: #2c3e50;
}

:deep(.cm-scroller)::-webkit-scrollbar-thumb {
  background: #708eab;
  border-radius: 4px;
}

:deep(.cm-scroller)::-webkit-scrollbar-thumb:hover {
  background: #4a5f7a;
}

/* Resize handle hover effect */
.cursor-col-resize:hover {
  background-color: #3b82f6 !important;
}

/* Disable text selection during resize */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
