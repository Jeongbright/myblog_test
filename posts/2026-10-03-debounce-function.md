검색창에 `input` 이벤트를 걸어두면 글자를 한 글자 입력할 때마다 핸들러가 실행됩니다. 자동완성 API 호출이나 무거운 연산을 이 핸들러 안에서 바로 처리하면 타이핑할 때마다 불필요한 요청이 쌓입니다. 이런 경우 디바운스(debounce)로 "입력이 멈춘 뒤 일정 시간이 지나야 실행"하도록 바꾸면 요청 횟수를 크게 줄일 수 있습니다.

## 디바운스 구현

```js
function debounce(fn, delay = 300) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce((value) => {
  console.log('검색 요청:', value);
}, 300);

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

호출될 때마다 이전 타이머를 `clearTimeout`으로 취소하고 새 타이머를 등록하기 때문에, 연속 입력 중에는 `fn`이 실행되지 않다가 마지막 입력 후 `delay`만큼 조용해져야 실행됩니다.

## 쓰로틀과의 차이

비슷한 기법으로 쓰로틀(throttle)이 있는데, 쓰로틀은 일정 주기마다 한 번씩은 반드시 실행시키는 방식이라 스크롤이나 리사이즈처럼 "주기적으로는 반응해야 하는" 이벤트에 맞고, 디바운스는 검색 자동완성처럼 "입력이 끝난 뒤 한 번만" 처리하면 되는 경우에 적합합니다.
