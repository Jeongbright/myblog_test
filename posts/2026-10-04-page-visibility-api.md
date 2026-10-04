탭을 백그라운드에 두고 다른 작업을 해도 `setInterval`로 돌아가는 폴링이나 비디오 재생, 애니메이션은 그대로 실행됩니다. 사용자 눈에 보이지도 않는데 네트워크 요청과 CPU를 계속 쓰는 셈입니다. Page Visibility API를 쓰면 탭이 보이는지 숨겨졌는지 감지해서 불필요한 작업을 멈추고 다시 보일 때 재개할 수 있습니다.

## 사용법

```js
let timerId;

function startPolling() {
  timerId = setInterval(() => {
    console.log('서버 상태 확인 중...');
  }, 5000);
}

function stopPolling() {
  clearInterval(timerId);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling();
  } else {
    startPolling();
  }
});

startPolling();
```

`document.hidden`은 탭이 숨겨지면 `true`, 다시 보이면 `false`가 되는 불리언 값이고, `document.visibilityState`로는 `"visible"` / `"hidden"` 문자열을 확인할 수 있습니다. 둘 다 같은 정보를 보여주므로 조건문에서는 편한 쪽을 쓰면 됩니다.

## window의 blur/focus와의 차이

`blur`/`focus`는 다른 창이나 다른 앱으로 포커스가 옮겨갈 때도 발생하지만, 탭이 화면에 보이는 상태에서 다른 프로그램 창만 앞으로 와도 똑같이 발생해 "진짜로 안 보이는지"를 정확히 구분하지 못합니다. 반면 `visibilitychange`는 해당 탭이 실제로 화면에서 가려졌는지에 집중한 이벤트라, 폴링이나 애니메이션을 멈출 기준으로는 이쪽이 더 적합합니다.
