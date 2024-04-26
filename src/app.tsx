import { c, css, usePromise, useRef, useState } from "atomico";
import { EditorCode } from "./components/code";
import { EditorPreview } from "./components/preview";
import { EditorToolbar } from "./components/toolbar";
import * as Icon from "./components/icons";
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
            lang: "tsx"
        };

        const { active, position } = useDragResize(
            refDragTrigger,
            urlState.split
        );

        const stateToUrl = (state: Partial<UrlState>) => {
            location.hash = btoa(
                JSON.stringify({
                    ...urlState,
                    ...state,
                    split: position.x
                })
            );
        };

        return (
            <host shadowDom>
                <EditorStore state={state} memo={[promise.result]}>
                    <EditorCode
                        {...state}
                        class="code"
                        style={`--split-x: ${position.x};--split-y: ${position.y}`}
                        onChange={({ detail }) => {
                            stateToUrl({ code: detail });
                        }}
                    />
                    <EditorToolbar class="toolbar">
                        <button
                            slot="content"
                            class="drag"
                            ref={refDragTrigger}
                            staticNode
                        >
                            {Icon.Drag}
                        </button>
                    </EditorToolbar>
                    <EditorPreview class="preview" layer={active} />
                </EditorStore>
            </host>
        );
    },
    {
        props: {
            src: String,
            vertical: {
                type: Boolean,
                reflect: true
            }
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
                    max-width: calc(100% * var(--split-x));
                }
                .preview {
                    flex: 0%;
                    min-width: 280px;
                }
                .toolbar {
                    width: 2.75rem;
                }
                .toolbar button {
                    width: 100%;
                    min-height: 2rem;
                    padding: none;
                    background: transparent;
                    border: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                }
                .toolbar button.drag {
                    height: 100%;
                    cursor: w-resize;
                }
                .toolbar button svg {
                    width: 1.5rem;
                    height: 1.5rem;
                }
                .toolbar button {
                    --icon-fill: rgba(255, 255, 255, 0.5);
                    transition: 0.3s ease all;
                }
                .toolbar button:hover,
                .toolbar button:active {
                    --icon-fill: rgba(255, 255, 255, 1);
                }
            `
        ]
    }
);
