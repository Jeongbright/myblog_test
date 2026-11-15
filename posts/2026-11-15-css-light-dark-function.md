## CSS light-dark() 함수로 다크 모드 변수 중복 줄이기

`prefers-color-scheme` 미디어 쿼리로 다크 모드를 지원하면, 색상 커스텀 프로퍼티를 `:root`와 `@media (prefers-color-scheme: dark)` 양쪽에 각각 선언해야 해서 변수가 늘어날수록 중복이 커집니다. `light-dark()` 함수를 쓰면 라이트/다크 값을 한 줄로 묶어 선언할 수 있습니다.

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(#ffffff, #1a1a1a);
  --text: light-dark(#111111, #eeeeee);
}

body {
  background: var(--bg);
  color: var(--text);
}
```

`color-scheme: light dark`를 선언해야 `light-dark()`가 현재 어떤 모드인지 판단할 수 있고, `data-theme` 속성 등으로 수동 토글을 구현할 때도 `color-scheme`만 바꿔주면 `light-dark()`가 쓰인 모든 변수가 한 번에 따라 바뀝니다. 다만 Chrome 123+, Safari 17.5+, Firefox 120+ 이상에서만 동작하므로, 구형 브라우저까지 지원해야 한다면 기존 미디어 쿼리 방식과 병행하는 점을 참고하세요.
