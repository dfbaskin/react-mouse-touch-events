import { useRef, useEffect, useCallback } from "react";
import { Subject } from "rxjs";
import { tap, switchMap, takeUntil } from "rxjs/operators";

const DOUBLE_TAP_DELAY = 300;

function elapsedTimeKeeper() {
  let lastTime = Date.now();
  return () => {
    const thisTime = Date.now();
    const elapsedTime = thisTime - lastTime;
    lastTime = thisTime;
    return elapsedTime;
  };
}

function getPointerEventData(evt, container) {
  const { clientX, clientY, target } = evt;
  const { left, top } = container.getBoundingClientRect();
  const { left: targetLeft, top: targetTop } = target.getBoundingClientRect();
  const x = clientX - left;
  const y = clientY - top;
  const offsetX = clientX - targetLeft;
  const offsetY = clientY - targetTop;
  return { x, y, offsetX, offsetY };
}

export function usePointerEvents(containerRef, callbackApi) {
  const elapsedTime = useRef(elapsedTimeKeeper());
  const subjects = useRef({
    pointerDownSubject: new Subject(),
    pointerMoveSubject: new Subject(),
    pointerUpSubject: new Subject()
  });

  const onPointerDown = useCallback(
    evt => {
      const evtData = getPointerEventData(evt, containerRef.current);
      if (elapsedTime.current() > DOUBLE_TAP_DELAY) {
        containerRef.current.setPointerCapture(evt.pointerId);
        subjects.current.pointerDownSubject.next(evtData);
      } else {
        callbackApi.editItem(evtData);
      }
    },
    [containerRef, elapsedTime, callbackApi]
  );
  const onPointerMove = useCallback(
    evt => {
      const evtData = getPointerEventData(evt, containerRef.current);
      subjects.current.pointerMoveSubject.next(evtData);
    },
    [containerRef]
  );
  const onPointerUp = useCallback(
    evt => {
      const evtData = getPointerEventData(evt, containerRef.current);
      subjects.current.pointerUpSubject.next(evtData);
    },
    [containerRef]
  );
  const onPointerCancel = useCallback(
    evt => {
      containerRef.current.releasePointerCapture(evt.pointerId);
    },
    [containerRef]
  );

  useEffect(() => {
    const pointerDownStream = subjects.current.pointerDownSubject.asObservable();
    const pointerMoveStream = subjects.current.pointerMoveSubject.asObservable();
    const pointerUpStream = subjects.current.pointerUpSubject.asObservable();

    const orchestrationStream = pointerDownStream.pipe(
      tap(evtData => {
        callbackApi.findItem(evtData);
      }),
      switchMap(({ offsetX, offsetY }) => {
        return pointerMoveStream.pipe(
          tap(({ x, y }) => {
            callbackApi.dragItem({ x, y, offsetX, offsetY });
          }),
          takeUntil(
            pointerUpStream.pipe(
              tap(() => {
                callbackApi.dragComplete();
              })
            )
          )
        );
      })
    );

    const subscription = orchestrationStream.subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [callbackApi]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  };
}
