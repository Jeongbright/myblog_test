## Performance API의 User Timing으로 커스텀 성능 구간 측정하기

"이 함수가 느린 것 같다"는 느낌일 뿐입니다. `console.time()`/`console.timeEnd()`도 쓸 만하지만, 브라우저 내장 `performance.mark()`와 `performance.measure()`를 쓰면 측정값이 Performance 엔트리로 남아서 나중에 모아서 분석하거나 DevTools 타임라인에서 바로 확인할 수 있습니다.

```js
performance.mark('render-start');
renderList(items);
performance.mark('render-end');

performance.measure('render', 'render-start', 'render-end');

const [entry] = performance.getEntriesByName('render', 'measure');
console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
```

측정이 끝나면 `performance.clearMarks()`와 `performance.clearMeasures()`로 엔트리를 정리해, 반복 호출될 때 버퍼가 계속 쌓이지 않게 합니다.

측정 코드와 로깅 코드를 분리하고 싶다면 `PerformanceObserver`로 구독하는 방식도 있습니다.

```js
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(entry.name, entry.duration.toFixed(2));
  });
}).observe({ type: 'measure', buffered: true });
```

크롬 DevTools의 Performance 패널 타임라인에도 이 mark/measure 구간이 "Timings" 트랙으로 그대로 표시되므로, 어떤 구간이 실제로 느린지 코드 수정 없이 눈으로 바로 확인할 수 있습니다.
