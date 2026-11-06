## Screen Wake Lock API로 화면 꺼짐 방지하기

레시피를 읽거나, QR 코드를 띄워두거나, 타이머가 돌아가는 화면에서는 사용자가 아무것도 만지지 않아도 화면이 꺼지면 안 됩니다. 예전에는 보이지 않는 비디오를 재생시키는 식의 편법을 쓰기도 했지만, 이제는 브라우저 내장 `Screen Wake Lock API`로 명시적으로 화면 꺼짐을 막을 수 있습니다.

```js
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      console.log('wake lock이 해제됨');
    });
  } catch (err) {
    console.error(`${err.name}: ${err.message}`);
  }
}
```

주의할 점은, 탭이 백그라운드로 가거나 화면이 최소화되면 브라우저가 wake lock을 자동으로 해제한다는 것입니다. 따라서 `visibilitychange` 이벤트로 탭이 다시 보일 때 재요청해주는 처리가 필요합니다.

```js
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    wakeLock = await navigator.wakeLock.request('screen');
  }
});
```

더 이상 필요 없을 때는 `wakeLock.release()`로 직접 해제하면 됩니다. Chrome, Edge, 최신 Safari에서 지원하지만 일부 구형 브라우저에서는 `navigator.wakeLock`이 아예 없을 수 있으므로, 사용 전에 `if ('wakeLock' in navigator)`로 지원 여부를 확인하고 분기하는 것이 안전합니다.
