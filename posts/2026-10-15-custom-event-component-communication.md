## CustomEvent로 컴포넌트 간 통신하기

프레임워크 없이 여러 엘리먼트나 모듈이 서로 상태를 주고받아야 할 때, 전역 변수나 직접 함수 호출 대신 `CustomEvent`를 쓰면 느슨하게 연결된 구조를 만들 수 있습니다. 이벤트를 발생시키는 쪽은 받는 쪽이 누구인지 몰라도 되고, 받는 쪽도 여러 개가 동시에 구독할 수 있습니다.

```js
// 발행
const detail = { cartCount: 3 };
document.dispatchEvent(new CustomEvent('cart:updated', { detail }));

// 구독
document.addEventListener('cart:updated', (e) => {
  console.log(e.detail.cartCount); // 3
});
```

`detail` 속성에는 객체, 배열 등 어떤 값이든 담을 수 있어 컴포넌트 간 데이터 전달이 자유롭습니다. 특정 범위로 이벤트를 제한하고 싶다면 `document` 대신 해당 엘리먼트에 디스패치하고, 상위 요소까지 전파되게 하려면 `{ bubbles: true }` 옵션을 추가하면 됩니다. 반대로 외부로 새어나가면 안 되는 내부 이벤트라면 `bubbles: false`(기본값)를 유지하거나, 구독 쪽에서 `e.stopPropagation()`으로 전파를 막아주세요. 컴포넌트를 제거할 때는 `removeEventListener`로 리스너도 함께 정리해 메모리 누수를 막는 것이 좋습니다.
