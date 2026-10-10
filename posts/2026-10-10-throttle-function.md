## 스크롤마다 실행되는 핸들러, 스로틀로 묶기

`scroll`이나 `resize` 이벤트는 짧은 시간에 수십~수백 번 발생합니다. 여기에 매번 무거운 연산(레이아웃 계산, API 호출 등)을 붙이면 화면이 버벅일 수 있습니다. 이전 글에서 다룬 디바운스가 "입력이 멈춘 뒤 한 번만" 실행한다면, 스로틀은 "일정 간격으로 최소 한 번씩" 실행되도록 빈도를 제한합니다. 스크롤 위치 추적처럼 중간에도 반응이 보여야 하는 경우엔 디바운스보다 스로틀이 적합합니다.

```js
function throttle(fn, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

const onScroll = throttle(() => {
  console.log('scrollY:', window.scrollY);
}, 200);

window.addEventListener('scroll', onScroll);
```

이 구현은 호출 간격을 보장하는 대신 마지막 이벤트는 건너뛸 수 있습니다. 스크롤이 멈춘 직후의 최종 상태까지 반영하고 싶다면, 마지막 호출을 `setTimeout`으로 한 번 더 예약하는 방식(leading + trailing)을 함께 쓰면 됩니다. 또한 스크롤 관련 레이아웃 읽기는 `requestAnimationFrame`과 묶어 처리하면 더 매끄러운 경우도 많으니, 상황에 맞게 선택하세요.
