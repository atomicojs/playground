import { useStore } from "@atomico/store";
import { replaceImport } from "@uppercod/replace-import";
import { c, css, useCallback, usePromise } from "atomico";
import { transform } from "sucrase";
import { EditorStore } from "../store";

export const EditorPreview = c(
  () => {
    const store = useStore(EditorStore);

    const promise = usePromise(
      async (code) => {
        const result = transform(code, {
          transforms: ["typescript", "jsx"],
          jsxRuntime: "automatic",
          jsxImportSource: "atomico",
          production: true,
        });

        const { code: nextCode } = await replaceImport({
          code: result.code,
          filter: () => true,
          replace(token) {
            token.toString = () =>
              `import ${token.scope} from "https://esm.sh/${token.src}"`;
            return token;
          },
        });

        return nextCode;
      },
      [store.code]
    );

    const ref = useCallback(
      (iframe: HTMLIFrameElement) => {
        if (!promise.fulfilled) return;
        const style = document.createElement("style");

        style.textContent = `
          body{ 
            margin: 0; 
            font-family: sans-serif;
          }
          body[center]{
            display: flex;
            justify-content: center;
            align-items: center;
          }
        `;

        const script = document.createElement("script");

        script.type = "module";

        script.textContent = String.raw`
          import { render } from "https://esm.sh/atomico";
          import * as view from "data:text/javascript;base64,${btoa(
            promise.result
          )}";
          const { default: host, ...components } = view;
          for(const prop in components){
            const tagName = prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            customElements.define(tagName, components[prop]);
          }
          render(host,document.body);
        `;

        setTimeout(() => {
          if (!iframe.contentDocument) return;
          iframe.contentDocument.body.append(style);
          iframe.contentDocument.head.append(script);
        }, 100);
      },
      [promise.result]
    );

    return (
      <host shadowDom>
        <iframe
          $sandbox="allow-scripts allow-same-origin allow-forms"
          ref={ref}
          key={ref}
          frameborder="0"
        ></iframe>
        <div class="layer"></div>
      </host>
    );
  },
  {
    props: {
      layer: { type: Boolean, reflect: true },
    },
    styles: css`
      :host {
        width: 100%;
        background: white;
        border-radius: 1rem;
        box-shadow: -20px 0px 40px rgba(0, 0, 0, 0.2);
        position: relative;
      }

      :host([layer]) .layer {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        z-index: 1;
      }
      iframe {
        width: 100%;
        height: 100%;
      }
    `,
  }
);
