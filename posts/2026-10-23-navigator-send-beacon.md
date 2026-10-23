## navigator.sendBeacon으로 페이지를 떠날 때도 데이터 안전하게 보내기

사용자가 페이지를 닫거나 다른 곳으로 이동할 때 분석 로그나 "이탈" 이벤트를 서버에 보내야 하는 경우가 많습니다. 이때 `fetch`나 `XMLHttpRequest`를 `unload`/`beforeunload` 이벤트에서 호출하면, 브라우저가 페이지를 바로 정리해 버려서 요청이 중간에 끊기고 서버에 도달하지 못하는 일이 흔합니다. `navigator.sendBeacon()`은 이런 상황을 위해 만들어진 API로, 요청을 비동기로 큐에 넣어두고 페이지가 사라진 뒤에도 브라우저가 백그라운드에서 전송을 이어서 처리해줍니다.

```js
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const data = JSON.stringify({ event: "page_leave", path: location.pathname });
    navigator.sendBeacon("/api/analytics", new Blob([data], { type: "application/json" }));
  }
});
```

`sendBeacon`은 응답을 기다리지 않고 전송 큐 등록 성공 여부만 불리언으로 반환하며, 요청 메서드는 항상 POST로 고정됩니다. 페이로드 크기 제한(브라우저별로 약 64KB 내외)이 있으므로 작은 로그성 데이터에 적합하고, 큰 데이터 전송에는 적합하지 않습니다. 또한 `beforeunload`보다는 `visibilitychange`에서 `hidden` 상태를 감지해 호출하는 편이 모바일 환경을 포함해 더 안정적으로 동작합니다.
