## IntersectionObserver로 스크롤 이벤트 없이 요소 노출 감지하기

요소가 화면에 들어왔는지 확인하려고 `scroll` 이벤트에서 `getBoundingClientRect()`를 매번 계산하면, 스크롤할 때마다 레이아웃을 강제로 다시 읽게 되어 성능이 나빠지기 쉽습니다. `IntersectionObserver`는 브라우저가 비동기로 교차 여부를 알려주는 방식이라 메인 스레드를 막지 않고, `scroll`/`resize` 리스너도 따로 붙일 필요가 없습니다.

```js
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // 한 번만 처리하면 관찰 중단
    }
  }
}, {
  root: null,       // 뷰포트 기준
  threshold: 0.2,   // 20% 이상 보이면 콜백 실행
});

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
```

`rootMargin: '200px 0px'`을 주면 요소가 실제로 보이기 200px 전에 미리 콜백을 받을 수 있어서, 무한 스크롤이나 이미지 지연 로딩의 트리거 시점을 앞당기는 데 유용합니다. 한 번 처리한 요소는 반드시 `unobserve()`로 관찰을 끊어줘야 불필요한 콜백 호출과 메모리 누수를 막을 수 있습니다.
