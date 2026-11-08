## Constraint Validation API로 폼 에러 메시지 커스터마이징하기

`required`, `pattern`, `type="email"` 같은 속성만으로도 브라우저가 기본 유효성 검사를 해주지만, 말풍선 메시지는 브라우저마다 다르고 한글로 바꾸기도 어렵습니다. `setCustomValidity()`와 `reportValidity()`를 쓰면 네이티브 말풍선 UI는 그대로 유지하면서 메시지만 원하는 대로 바꿀 수 있습니다.

```html
<form id="signup">
  <input id="password" type="password" required minlength="8" />
  <button type="submit">가입</button>
</form>
```

```js
const input = document.getElementById('password');

input.addEventListener('input', () => {
  if (input.validity.tooShort) {
    input.setCustomValidity('비밀번호는 8자 이상이어야 합니다.');
  } else {
    input.setCustomValidity('');
  }
});

document.getElementById('signup').addEventListener('submit', (e) => {
  if (!input.checkValidity()) {
    input.reportValidity();
    e.preventDefault();
  }
});
```

`setCustomValidity()`에 빈 문자열이 아닌 값을 넣으면 그 필드는 즉시 invalid 상태가 되므로, 조건이 해소되면 반드시 빈 문자열로 되돌려야 합니다. `validity` 객체의 `valueMissing`, `patternMismatch`, `tooShort` 같은 속성으로 어떤 조건이 실패했는지 구분할 수 있어, 필드마다 다른 안내 문구를 쉽게 보여줄 수 있습니다.
