## View Transitions API로 상태 변경에 부드러운 전환 애니메이션 주기

리스트 필터링, 탭 전환, 요소 추가/삭제처럼 DOM이 바뀌는 순간 사용자는 화면이 뚝 끊기는 느낌을 받기 쉽습니다. CSS 트랜지션을 직접 조합하지 않아도, `document.startViewTransition()`으로 감싸기만 하면 브라우저가 변경 전후 스냅샷을 찍어 자동으로 크로스페이드 애니메이션을 만들어 줍니다.

```js
function updateList(newItems) {
  if (!document.startViewTransition) {
    renderList(newItems); // 미지원 브라우저는 즉시 반영
    return;
  }

  document.startViewTransition(() => {
    renderList(newItems);
  });
}
```

특정 요소만 따로 애니메이션시키고 싶다면 `view-transition-name` 속성을 지정하면 됩니다.

```css
.card {
  view-transition-name: card;
}
```

이렇게 하면 카드가 이동하거나 크기가 바뀔 때도 자연스럽게 모핑됩니다. 다만 아직 Safari 등 일부 브라우저는 지원하지 않으므로 반드시 `document.startViewTransition` 존재 여부를 확인하고, 미지원 환경에서는 애니메이션 없이 바로 DOM을 갱신하는 폴백 경로를 남겨두는 것이 안전합니다.
