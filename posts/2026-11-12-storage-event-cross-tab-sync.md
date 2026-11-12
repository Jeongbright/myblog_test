## storage 이벤트로 다른 탭 간 localStorage 변경 동기화하기

한 탭에서 로그인/로그아웃하거나 설정을 바꿨을 때 다른 탭에도 즉시 반영하고 싶다면, 폴링 없이 브라우저가 기본 제공하는 `storage` 이벤트를 쓰면 됩니다. 같은 오리진의 다른 문서(탭/창)에서 `localStorage`가 변경되면 발생하며, 변경을 일으킨 탭 자신에게는 발생하지 않는다는 점이 핵심입니다.

```js
window.addEventListener('storage', (event) => {
  if (event.key === 'theme') {
    document.documentElement.dataset.theme = event.newValue;
  }
  if (event.key === 'auth-token' && event.newValue === null) {
    location.reload(); // 다른 탭에서 로그아웃하면 새로고침
  }
});

// 다른 탭에 변경을 알리고 싶을 때
localStorage.setItem('theme', 'dark');
```

`event.key`, `event.oldValue`, `event.newValue`로 무엇이 어떻게 바뀌었는지 알 수 있고, `localStorage.clear()`를 호출하면 `key`가 `null`로 전달됩니다. 탭 간 동기화에 메시지 전달까지 필요하다면 `BroadcastChannel`을 쓰는 방법도 있지만, 값 하나를 동기화하는 정도라면 `storage` 이벤트만으로 충분합니다.
