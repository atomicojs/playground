import { EditorStore } from "./store";
import { EditorApp } from "./app";
import { EditorCode } from "./components/code";
import { EditorPreview } from "./components/preview";

customElements.define("editor-store", EditorStore);
customElements.define("editor-app", EditorApp);
customElements.define("editor-code", EditorCode);
customElements.define("editor-preview", EditorPreview);
