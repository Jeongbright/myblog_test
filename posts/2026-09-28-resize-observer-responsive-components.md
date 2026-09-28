화면 크기가 아니라 "요소 자체의 크기"가 바뀔 때 반응해야 하는 경우가 있습니다. 사이드바가 열리고 닫히면서 콘텐츠 영역 너비가 변할 때가 대표적입니다. 미디어 쿼리는 뷰포트 기준이라 이런 상황을 잡아내지 못하는데, `ResizeObserver`를 쓰면 특정 요소의 크기 변화를 직접 감지할 수 있습니다.

## 기본 사용법

관찰할 요소를 `observe()`에 넘기면, 크기가 바뀔 때마다 콜백이 실행됩니다.

```js
const box = document.querySelector('.panel');

const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const width = entry.contentBoxSize[0].inlineSize;
    entry.target.classList.toggle('is-narrow', width < 300);
  }
});

ro.observe(box);
```

## 정리가 필요할 때

컴포넌트가 화면에서 사라지면 관찰도 멈춰야 메모리 누수를 막을 수 있습니다.

```js
ro.unobserve(box);
// 또는 모든 관찰 대상을 한 번에 해제
ro.disconnect();
```

## 주의할 점

콜백은 레이아웃이 실제로 바뀐 뒤 비동기로 호출되므로, 콜백 안에서 다시 관찰 대상의 크기를 바꾸는 코드는 무한 루프를 유발할 수 있습니다. 또한 `entry.contentBoxSize`는 배열이라 브라우저에 따라 값이 없을 수 있으니, 필요하면 `entry.contentRect.width`로 대체 처리를 해두는 것이 안전합니다. 컨테이너 쿼리(`@container`)로 CSS만으로 해결되는 경우라면 그쪽을 먼저 검토하고, JS 로직과 크기 값이 함께 필요할 때 `ResizeObserver`를 쓰는 것이 좋습니다.
