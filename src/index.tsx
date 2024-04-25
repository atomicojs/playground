import { EditorStore } from "./store";
import { EditorApp } from "./editor-app";
import { EditorCode } from "./editor-code";
import { EditorPreview } from "./editor-preview";

customElements.define("editor-store", EditorStore);
customElements.define("editor-app", EditorApp);
customElements.define("editor-code", EditorCode);
customElements.define("editor-preview", EditorPreview);
