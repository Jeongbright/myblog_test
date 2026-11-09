## addEventListener의 passive 옵션으로 스크롤 버벅임 줄이기

`touchstart`, `touchmove`, `wheel` 같은 이벤트는 브라우저가 스크롤을 실제로 수행하기 전에, 리스너가 `preventDefault()`를 호출해 스크롤을 막을지 먼저 확인해야 합니다. 리스너 안에서 무거운 연산을 하면 이 확인 과정 때문에 스크롤 시작이 눈에 띄게 지연됩니다. 해당 이벤트에서 `preventDefault()`를 쓰지 않는다면, `passive: true`로 "스크롤을 막지 않겠다"고 미리 알려주면 됩니다.

```js
window.addEventListener(
  'touchstart',
  () => {
    // 스크롤을 막지 않는 핸들러
    trackInteraction();
  },
  { passive: true }
);
```

이렇게 선언하면 브라우저는 핸들러 실행이 끝나길 기다리지 않고 바로 스크롤을 진행할 수 있습니다. 반대로 핸들러 안에서 실제로 스크롤을 막아야 한다면(`e.preventDefault()`) `passive: true`를 쓰면 안 됩니다. passive 리스너 안에서 `preventDefault()`를 호출해도 무시되고, 콘솔에 경고만 남습니다.

참고로 Chrome은 `touchstart`/`touchmove`를 document와 window에 등록할 때 기본값을 이미 `passive: true`로 처리하지만, 모든 브라우저와 모든 엘리먼트에 적용되는 건 아니므로 스크롤 관련 리스너를 등록할 때는 옵션을 명시적으로 지정하는 습관을 들이는 게 안전합니다.
