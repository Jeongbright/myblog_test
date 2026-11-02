## CSS overscroll-behavior로 스크롤 체이닝과 당겨서 새로고침 막기

모달이나 사이드 드로어 안에서 스크롤을 끝까지 내렸을 때, 이어서 뒤에 있는 페이지 본문까지 스크롤되어 버리는 현상을 "스크롤 체이닝"이라고 합니다. 모바일에서는 여기에 더해 브라우저의 당겨서 새로고침(pull-to-refresh)까지 함께 발동해 사용자 경험을 해치기도 합니다. `overscroll-behavior` 속성으로 두 문제를 모두 막을 수 있습니다.

```css
.modal-body {
  overflow-y: auto;
  overscroll-behavior: contain;
}

html,
body {
  overscroll-behavior-y: none;
}
```

`overscroll-behavior: contain`을 스크롤 가능한 내부 요소에 주면, 그 요소의 스크롤이 끝에 도달해도 상위 요소로 스크롤이 전파되지 않습니다. 값을 `none`으로 주면 전파 차단은 물론 브라우저 기본 동작(당겨서 새로고침, 바운스 효과)까지 제거합니다. `html`과 `body`에 `overscroll-behavior-y: none`을 적용하면 모바일 사파리나 크롬에서 페이지 최상단을 아래로 당길 때 발생하는 새로고침을 막을 수 있어, 커스텀 당김 제스처 UI를 만들 때 특히 유용합니다. JS나 `touch-action` 트릭 없이 CSS 한 줄로 해결된다는 점이 장점입니다.
