import { c, css, usePromise, useRef, useState } from "atomico";
import { EditorCode } from "./components/code";
import { EditorPreview } from "./components/preview";
import { EditorStore } from "./store";
import { useDragResize } from "./use-drag-resize";
import { tokens } from "./tokens";

type UrlState = { code: string; split: number };

const initialUrlState = (): UrlState => {
  try {
    return JSON.parse(atob(location.hash.replace(/#(\/){0,}/, "")));
  } catch {
    return { code: "", split: 0.5 };
  }
};

export const EditorApp = c(
  ({ src }) => {
    const refDragTrigger = useRef();

    const [urlState] = useState(initialUrlState);

    const promise = usePromise(
      async (src: string) =>
        urlState.code || (await fetch(src).then((res) => res.text())),
      [src]
    );

    const state = {
      code: promise.fulfilled ? promise.result : "",
      lang: "tsx",
    };

    const { active, position } = useDragResize(refDragTrigger, urlState.split);

    const stateToUrl = (state: Partial<UrlState>) => {
      location.hash = btoa(
        JSON.stringify({
          ...urlState,
          ...state,
          split: position.x,
        })
      );
    };

    return (
      <host shadowDom>
        <EditorStore state={state} memo={[promise.result]}>
          <EditorCode
            {...state}
            class="code"
            style={`--max-width: ${position.x}`}
            onChange={({ detail }) => {
              stateToUrl({ code: detail });
            }}
          />
          <button class="drag" ref={refDragTrigger} staticNode>
            <svg viewBox="0 0 32 32">
              <rect x="12" y="0" width="2" height="100%" rx="1" />
              <rect x="18" y="0" width="2" height="100%" rx="1" />
            </svg>
          </button>
          <EditorPreview class="preview" layer={active} />
        </EditorStore>
      </host>
    );
  },
  {
    props: {
      src: String,
    },
    styles: [
      tokens,
      css`
        :host {
          height: 100%;
          display: flex;
          gap: 0;
          padding: 2rem;
          box-sizing: border-box;
          background: var(--container-background);
        }
        .code {
          width: 100%;
          max-width: calc(100% * var(--max-width));
        }
        .preview {
          flex: 0%;
        }
        .drag {
          all: unset;
          width: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: col-resize;
        }
        .drag svg {
          width: 2rem;
          height: 2rem;
        }
        .drag rect {
          fill: rgba(255, 255, 255, 0.25);
          transition: 0.3s ease all;
        }
        .drag:hover rect,
        .drag:active rect {
          fill: rgba(255, 255, 255, 1);
        }
      `,
    ],
  }
);
