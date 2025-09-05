import { linter } from "@codemirror/lint";

/**
 * Linter untuk JavaScript
 */
export function jsSyntaxLinter() {
  return linter((view) => {
    let diagnostics = [];
    const code = view.state.doc.toString();
    try {
      new Function(code);
    } catch (err) {
      const msg = err.message;
      let line = 1,
        col = 0;
      const match = msg.match(/(\d+):(\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
        col = parseInt(match[2], 10);
      }
      const lines = code.split("\n");
      let pos = 0;
      for (let i = 0; i < line - 1 && i < lines.length; i++) {
        pos += lines[i].length + 1;
      }
      pos += col;
      diagnostics.push({
        from: pos,
        to: pos + 1,
        severity: "error",
        message: msg,
      });
    }

    const pairs = [
      { open: "{", close: "}" },
      { open: "(", close: ")" },
      { open: "[", close: "]" },
    ];
    pairs.forEach(({ open, close }) => {
      let openCount = (code.match(new RegExp(`\\${open}`, "g")) || []).length;
      let closeCount = (code.match(new RegExp(`\\${close}`, "g")) || []).length;
      if (openCount !== closeCount) {
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

/**
 * Linter untuk HTML
 */
export function htmlSyntaxLinter() {
  return linter((view) => {
    let diagnostics = [];
    const code = view.state.doc.toString();
    const tagRegex = /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g;
    let match;
    let stack = [];
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
      const tag = tagName.toLowerCase();
      const isClosing = full.startsWith("</");
      if (!isClosing) {
        if (!voidElements.has(tag)) {
          stack.push({ tag, pos: match.index });
        }
      } else {
        const last = stack[stack.length - 1];
        if (last && last.tag === tag) {
          stack.pop();
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

/**
 * Linter untuk CSS
 */
export function cssSyntaxLinter() {
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
