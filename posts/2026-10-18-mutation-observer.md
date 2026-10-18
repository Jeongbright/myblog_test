## MutationObserver로 DOM 변경 감지하기

외부 스크립트가 DOM을 바꾸거나, 특정 요소가 언제 추가·삭제·속성 변경되는지 감지해야 할 때 `setInterval`로 폴링하는 대신 `MutationObserver`를 쓰면 변경이 실제로 일어나는 시점에만 콜백이 실행됩니다.

```js
const target = document.querySelector('#list');

const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === 'childList') {
      console.log('추가된 노드:', m.addedNodes.length);
    }
    if (m.type === 'attributes') {
      console.log(`${m.attributeName} 속성 변경됨`);
    }
  }
});

observer.observe(target, {
  childList: true,      // 자식 노드 추가/삭제 감지
  attributes: true,     // 속성 변경 감지
  subtree: true,        // 하위 트리 전체 감지
});

// 더 이상 필요 없으면 반드시 해제
observer.disconnect();
```

자주 쓰는 경우는 서드파티 위젯이 비동기로 DOM에 요소를 그려 넣을 때 그 시점을 잡아 초기화 코드를 실행하거나, 챗봇처럼 메시지가 계속 추가되는 리스트에서 새 메시지가 들어올 때마다 스크롤을 맨 아래로 내리는 상황입니다. `subtree: true`를 켜면 감시 대상이 넓어져 콜백이 자주 호출될 수 있으니, 꼭 필요한 범위만 관찰 대상으로 지정하고 컴포넌트가 사라질 때 `disconnect()`를 호출해 메모리 누수를 막아야 합니다.
