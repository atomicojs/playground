import { useDebounceState, useListener } from "@atomico/hooks";
import { Ref, createRef, useEffect, useHost, useState } from "atomico";

const refGlobalThis = createRef(globalThis);

export function useDragResize(refTrigger: Ref, value: number) {
    const refHost = useHost();

    const [active, setActive] = useState(false);
    const [position, setPosition] = useDebounceState(
        1,
        { x: value, y: value },
        "fps"
    );

    const start = () => setActive(true);
    const end = () => setActive(false);

    useEffect(() => {
        if (position.x != value)
            setPosition({
                x: value,
                y: value
            });
    }, [value]);

    useListener(refTrigger, "mousedown", start);
    useListener(refGlobalThis, "mouseup", end);
    useListener(refGlobalThis, "mouseleave", end);
    useListener(refTrigger, "touchstart", start);
    useListener(refGlobalThis, "touchend", end);

    const onMove = (event: MouseEvent | TouchEvent) => {
        const { current } = refHost;

        if (active) {
            const rect = current.getBoundingClientRect();
            const isTouch = event instanceof TouchEvent;
            const offset = isTouch ? event.targetTouches[0] : event;
            const offsetX = offset.clientX - rect.x;
            const offsetY = offset.clientY - rect.y;

            if (isTouch) event.preventDefault();

            setPosition({
                x:
                    offsetX < 0
                        ? 0
                        : offsetX > rect.width
                          ? 1
                          : offsetX / rect.width,
                y:
                    offsetY < 0
                        ? 0
                        : offsetY > rect.height
                          ? 1
                          : offsetY / rect.height
            });
        }
    };

    useListener(refGlobalThis, "touchmove", onMove, { passive: false });
    useListener(refGlobalThis, "mousemove", onMove, { passive: true });

    return {
        active,
        position
    };
}
