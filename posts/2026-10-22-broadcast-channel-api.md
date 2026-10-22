## BroadcastChannel API로 같은 출처의 탭/창 간 메시지 주고받기

로그인 상태나 장바구니 데이터처럼 여러 탭에서 동시에 열어볼 수 있는 상태는, 한 탭에서 바뀌면 다른 탭에도 즉시 반영돼야 자연스럽습니다. `localStorage`의 `storage` 이벤트로도 비슷한 걸 할 수 있지만 값을 직접 저장해야 하고 같은 탭에서는 이벤트가 안 뜨는 제약이 있습니다. `BroadcastChannel`은 같은 이름의 채널을 연 모든 탭·창·iframe에 메시지를 바로 보낼 수 있는 더 단순한 방법입니다.

```js
// 로그인 상태를 알리는 탭
const channel = new BroadcastChannel("auth");
channel.postMessage({ type: "logout" });
```

```js
// 다른 탭들에서 수신
const channel = new BroadcastChannel("auth");
channel.addEventListener("message", (event) => {
  if (event.data.type === "logout") {
    location.reload();
  }
});
```

채널은 같은 출처(origin) 안에서만 동작하며, 더 이상 쓰지 않을 때는 `channel.close()`로 반드시 정리해야 메모리 누수와 불필요한 이벤트 수신을 막을 수 있습니다. 탭을 넘나드는 간단한 알림이나 동기화가 필요할 때, 서버 왕복 없이 가볍게 쓸 수 있는 브라우저 내장 기능입니다.
