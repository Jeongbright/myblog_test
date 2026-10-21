## requestIdleCallback으로 급하지 않은 작업 미루기

분석 로그 전송, 캐시 정리, 미리보기 렌더링처럼 당장 화면에 영향을 주지 않는 작업을 메인 스레드가 한가할 때만 실행하고 싶을 때가 있습니다. `setTimeout(fn, 0)`으로 미뤄도 브라우저가 바쁘면 여전히 렌더링을 방해할 수 있는데, `requestIdleCallback`은 브라우저가 실제로 유휴 상태일 때만 콜백을 실행해줍니다.

```js
function runTasks(deadline) {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift());
  }

  if (tasks.length > 0) {
    requestIdleCallback(runTasks);
  }
}

requestIdleCallback(runTasks);
```

`deadline.timeRemaining()`으로 이번 유휴 구간에 남은 시간을 확인하면서 작업을 쪼개 처리하면, 한 번에 너무 많은 일을 해서 프레임을 떨어뜨리는 상황을 막을 수 있습니다. 작업이 많이 남았는데 브라우저가 계속 바쁘다면 `timeout` 옵션으로 최대 대기 시간을 지정해 강제로 실행되게 할 수도 있습니다.

```js
requestIdleCallback(runLowPriorityWork, { timeout: 2000 });
```

다만 Safari는 아직 이 API를 지원하지 않으므로, 폴백 경로를 함께 준비해야 합니다.

```js
const scheduleIdle =
  window.requestIdleCallback ||
  ((fn) => setTimeout(() => fn({ timeRemaining: () => 1 }), 1));
```

사용자 입력 처리나 애니메이션처럼 즉시 반응해야 하는 작업에는 적합하지 않지만, 우선순위가 낮은 백그라운드 작업을 메인 스레드와 충돌 없이 처리하고 싶을 때 유용한 도구입니다.
