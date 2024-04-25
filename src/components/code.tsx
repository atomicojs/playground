import { useStore } from "@atomico/store";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { c, css, useEffect, useRef, Host, useEvent } from "atomico";
import { basicSetup } from "codemirror";
import { EditorStore } from "../store";
import { tokens } from "../tokens";

export const EditorCode = c(
  ({ code }): Host<{ onChange: CustomEvent<string> }> => {
    const dispatch = useEvent("Change");
    const store = useStore(EditorStore);
    const ref = useRef();
    useEffect(() => {
      const watcher = EditorView.updateListener.of((view) => {
        if (!view.docChanged) return;
        store.code = `${view.state.doc}`.trim();
        dispatch(`${view.state.doc}`.trim());
      });
      new EditorView({
        extensions: [
          oneDark,
          basicSetup,
          keymap.of([indentWithTab]),
          javascript({ jsx: true, typescript: true }),
          watcher,
        ],
        parent: ref.current,
        doc: code,
      });
    }, [code, store]);

    return (
      <host shadowDom>
        <div class="editor" key={code} ref={ref}></div>
      </host>
    );
  },
  {
    props: {
      code: String,
      lang: String,
    },
    styles: [
      tokens,
      css`
        :host {
          max-height: 100%;
        }
        .editor {
          height: 100%;
          font-size: var(--code-font-size);
          padding: 1rem;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.05);
          border: var(--code-border-size) solid var(--code-border-color);
          border-radius: 12px;
          font-family: "Fira Code", monospace;
          overflow: auto;
        }
        .cm-editor {
          height: 100%;
          background: transparent;
        }
        .ͼo .cm-gutters {
          background: transparent;
          color: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
        }
        .ͼo .cm-activeLine {
          background: rgb(134 174 255 / 10%);
          border-radius: 0px 4px 4px 0px;
          color: rgba(255, 255, 255, 0.8);
        }
        .ͼ1.cm-focused {
          outline: none;
        }
        .ͼ1 .cm-scroller {
          font-family: unset;
          flex: 0%;
          /**
        * https://developer.chrome.com/docs/css-ui/scrollbar-styling?hl=es-419
        * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scrollbars_styling
        */
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
          scrollbar-width: thin;
        }
        .ͼ1 .cm-lineNumbers .cm-gutterElement {
          border-radius: 4px 0px 0px 4px;
        }
      `,
    ],
  }
);
