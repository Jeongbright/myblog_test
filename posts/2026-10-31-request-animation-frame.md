## requestAnimationFrame으로 부드러운 애니메이션과 스크롤 처리 최적화하기

`setInterval`로 애니메이션을 구현하면 브라우저 화면 주사율과 타이밍이 어긋나 끊기거나, 탭이 백그라운드로 가도 계속 돌아가며 자원을 낭비합니다. `requestAnimationFrame`(rAF)은 브라우저가 다음 화면을 그리기 직전에 콜백을 실행해주는 API로, 이 문제를 해결합니다.

```js
let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateHeaderPosition(window.scrollY);
    ticking = false;
  });
}

window.addEventListener('scroll', onScroll);
```

스크롤, 리사이즈처럼 짧은 시간에 여러 번 발생하는 이벤트에서 매번 DOM을 갱신하면 레이아웃이 반복 계산되어 버벅입니다. 위처럼 `ticking` 플래그로 한 프레임에 한 번만 실제 작업을 예약하면, 브라우저 리페인트 주기에 맞춰 자연스럽게 쓰로틀링됩니다. rAF는 탭이 비활성화되면 자동으로 실행을 멈추므로 배터리와 CPU도 절약됩니다. 연속 애니메이션이 필요하면 콜백 안에서 다시 `requestAnimationFrame`을 호출해 루프를 만들고, 멈추려면 `cancelAnimationFrame`에 반환값을 넘기면 됩니다.
