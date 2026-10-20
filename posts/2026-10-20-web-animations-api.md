## Web Animations API로 자바스크립트에서 애니메이션 직접 제어하기

CSS `transition`이나 `@keyframes`는 애니메이션을 재생하기는 쉽지만, 특정 시점에 멈추거나 되감거나 진행 상태를 읽어오는 건 번거롭습니다. 브라우저 내장 `element.animate()`를 쓰면 별도 라이브러리 없이 자바스크립트만으로 애니메이션을 재생하고 제어할 수 있습니다.

```js
const box = document.querySelector(".box");

const animation = box.animate(
  [
    { transform: "translateX(0)", opacity: 1 },
    { transform: "translateX(200px)", opacity: 0.3 },
  ],
  {
    duration: 400,
    easing: "ease-out",
    fill: "forwards",
  }
);
```

`animate()`가 반환하는 `Animation` 객체로 `pause()`, `play()`, `reverse()`를 호출하거나, `animation.finished` 프로미스로 애니메이션이 끝나는 시점을 알 수 있습니다.

```js
animation.pause();
// ... 나중에
animation.play();

animation.finished.then(() => {
  box.classList.add("done");
});
```

`fill: "forwards"`를 지정하지 않으면 애니메이션이 끝난 뒤 스타일이 원래 상태로 되돌아가 버리므로, 끝난 모습을 유지하고 싶다면 꼭 함께 써야 합니다. CSS 애니메이션과 달리 타임라인을 코드로 직접 다룰 수 있어서, 사용자 입력에 따라 애니메이션을 중간에 멈추거나 되돌려야 하는 인터랙션을 만들 때 특히 유용합니다.
