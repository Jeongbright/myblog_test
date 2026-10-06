사용자의 OS나 브라우저 설정에서 다크 모드를 켜두면, 별도의 토글 버튼 없이도 CSS만으로 그 선호를 감지해 색을 바꿀 수 있습니다. 미디어 쿼리 `prefers-color-scheme`를 쓰면 라이트/다크 테마를 자바스크립트 없이 자동으로 전환할 수 있습니다.

## 기본 사용법

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a1a;
    --text: #f0f0f0;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
```

색상을 커스텀 프로퍼티로 선언해두면, 다크 모드 미디어 쿼리 안에서 변수 값만 다시 정의하면 되므로 실제 스타일 규칙을 중복해서 쓸 필요가 없습니다.

## 사용자가 직접 선택하게 하기

OS 설정만으로는 부족하고 사이트 안에서 수동 토글도 지원하고 싶다면, `data-theme` 속성으로 우선순위를 둘 수 있습니다.

```css
:root[data-theme="dark"] {
  --bg: #1a1a1a;
  --text: #f0f0f0;
}
```

```js
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;
```

이렇게 하면 기본값은 OS 설정을 따르되, 사용자가 명시적으로 선택한 테마는 `localStorage`에 저장해 다음 방문 때도 유지할 수 있습니다.
