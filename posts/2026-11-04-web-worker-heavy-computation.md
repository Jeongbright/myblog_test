## Web Worker로 무거운 연산을 메인 스레드에서 분리하기

큰 배열 정렬이나 이미지 픽셀 처리 같은 무거운 연산을 메인 스레드에서 그대로 실행하면, 그동안 화면이 멈추고 스크롤과 클릭 같은 입력에도 반응하지 않습니다. JS는 싱글 스레드이기 때문입니다. `Web Worker`는 별도 스레드에서 스크립트를 실행해 이 문제를 해결합니다.

```js
// worker.js
self.onmessage = (e) => {
  const sorted = e.data.sort((a, b) => a - b);
  self.postMessage(sorted);
};

// main.js
const worker = new Worker('worker.js');
worker.postMessage(hugeArray);
worker.onmessage = (e) => {
  renderList(e.data);
};
```

워커는 메인 스레드와 메모리를 공유하지 않고 `postMessage`로 데이터를 복사해서 주고받기 때문에, DOM에는 직접 접근할 수 없습니다. 대신 `fetch`, `setTimeout`, 대부분의 연산용 JS 문법은 그대로 쓸 수 있습니다. 더 이상 필요 없어지면 `worker.terminate()`로 반드시 종료해 메모리를 정리하세요. 큰 데이터를 자주 주고받는다면 복사 비용이 큰 `postMessage` 대신, 소유권만 넘기는 `Transferable Objects`(예: `ArrayBuffer`)를 전달해 복사를 생략할 수 있습니다.
