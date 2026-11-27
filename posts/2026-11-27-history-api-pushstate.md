## History API로 새로고침 없이 주소창 URL 바꾸기 (pushState/replaceState)

필터나 탭처럼 화면 내용만 바뀌는 상황에서 `location.href = '/foo'`로 URL을 바꾸면 페이지 전체가 다시 로드돼 버립니다. `history.pushState()`를 쓰면 실제 요청을 보내지 않고도 주소창 URL과 히스토리 스택만 바꿀 수 있습니다.

```js
function showTab(name) {
  renderTab(name); // 화면 갱신은 직접 호출
  history.pushState({ tab: name }, '', `?tab=${name}`);
}

// 뒤로/앞으로 가기 버튼을 눌렀을 때만 발생
window.addEventListener('popstate', (e) => {
  renderTab(e.state?.tab ?? 'default');
});
```

주의할 점은 `pushState()`를 호출해도 `popstate` 이벤트는 발생하지 않는다는 것입니다. 그래서 URL을 바꾸는 코드와 화면을 렌더링하는 코드를 항상 같이 호출해줘야 하고, 뒤로가기·앞으로가기로 돌아왔을 때 화면을 복원하는 로직은 `popstate` 핸들러에 따로 작성해야 합니다. 히스토리에 새 항목을 남기지 않고 현재 URL만 조용히 교체하고 싶다면 `pushState` 대신 `replaceState()`를 쓰면 됩니다.
