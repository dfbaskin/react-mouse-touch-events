Demonstration of mouse and touch events in React using RxJS Observables.
Also shows handling edit mode outside of the observables (within the
double-click or double-tap event handler) in order to ensure an iOS/tablet
keyboard displays and hides correctly.

[https://dfbaskin.github.io/react-mouse-touch-events](https://dfbaskin.github.io/react-mouse-touch-events)

The `version-one` branch uses [touch](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
and [mouse](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) events.

The `version-two` branch uses [pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events).
React does not [support pointer events](https://github.com/facebook/react/issues/499)
directly, so the [react-pointable](https://github.com/MilllerTime/react-pointable)
component is used.

The `version-three` branch uses an updated version of React that now has support for
[pointer events](https://reactjs.org/blog/2018/05/23/react-v-16-4.html).

The `master` branch was updated to use
[hooks](https://reactjs.org/docs/hooks-intro.html) and creates
a `usePointerEvents` hook along with a callback API.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
