import { c, css } from "atomico";

export const EditorToolbar = c(
    () => {
        return (
            <host shadowDom>
                <div class="header">
                    <slot name="header" />
                </div>
                <div class="content">
                    <slot name="content" />
                </div>
                <div class="footer">
                    <slot name="footer" />
                </div>
            </host>
        );
    },
    {
        styles: css`
            :host {
                display: flex;
                flex-flow: column;
            }
            .content {
                flex: 0%;
            }
        `
    }
);
