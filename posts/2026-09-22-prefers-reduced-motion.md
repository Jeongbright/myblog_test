모션에 민감한 사용자를 위해 화면 전환이나 스크롤 애니메이션을 줄이거나 꺼주는 것은 접근성의 기본입니다. CSS의 `prefers-reduced-motion` 미디어 쿼리를 쓰면 별도의 JS 없이도 시스템 설정을 감지해 애니메이션을 조정할 수 있습니다.

## CSS에서 적용하기

```css
.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .fade-in {
    animation: none;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}
```

`reduce`를 선호하는 사용자에게는 애니메이션 지속 시간을 사실상 0에 가깝게 줄이거나 아예 제거해, 전정 기관에 문제가 있는 사용자가 어지러움을 겪지 않도록 배려할 수 있습니다.

## JavaScript에서 감지하기

스크립트로 애니메이션을 직접 제어해야 할 때는 `matchMedia`로 같은 설정을 읽을 수 있습니다.

```js
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  element.animate(keyframes, { duration: 400 });
}
```

## 정리

화려한 트랜지션을 넣기 전에 `prefers-reduced-motion`을 먼저 확인하는 습관을 들이면, 별도의 설정 UI 없이도 더 많은 사용자에게 편안한 경험을 제공할 수 있습니다.
