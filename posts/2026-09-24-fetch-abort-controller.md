검색어를 입력할 때마다 `fetch` 요청을 보내는 자동완성 기능을 만들다 보면, 이전 요청이 끝나기 전에 새 요청이 나가면서 응답 순서가 뒤바뀌는 문제가 생깁니다. 이럴 때 `AbortController`로 이전 요청을 취소하면 깔끔하게 해결됩니다.

## 기본 사용법

`AbortController`는 `signal`을 만들어 `fetch`에 넘기고, 필요할 때 `abort()`를 호출해 요청을 중단시킵니다.

```js
const controller = new AbortController();

fetch('/api/search?q=abc', { signal: controller.signal })
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => {
    if (err.name === 'AbortError') {
      console.log('요청이 취소되었습니다.');
    }
  });

// 필요할 때 취소
controller.abort();
```

## 이전 요청을 취소하고 새 요청 보내기

입력 이벤트가 발생할 때마다 이전 컨트롤러를 취소하면, 마지막 요청의 응답만 화면에 반영됩니다.

```js
let currentController = null;

input.addEventListener('input', () => {
  currentController?.abort();
  currentController = new AbortController();

  fetch(`/api/search?q=${input.value}`, {
    signal: currentController.signal,
  })
    .then((res) => res.json())
    .then(renderResults)
    .catch((err) => {
      if (err.name !== 'AbortError') console.error(err);
    });
});
```

## 정리

`AbortError`는 정상적인 취소 동작이므로 다른 에러와 구분해서 무시하면 됩니다. 같은 방식으로 `setTimeout`과 `abort()`를 조합하면 일정 시간이 지난 요청을 자동으로 취소하는 타임아웃 처리도 만들 수 있습니다.
