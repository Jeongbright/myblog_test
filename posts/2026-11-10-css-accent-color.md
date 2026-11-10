## CSS accent-color로 체크박스·라디오 색상 쉽게 바꾸기

체크박스, 라디오 버튼, `range`, `progress` 같은 폼 컨트롤은 브라우저 기본 스타일이 사이트 디자인과 어울리지 않는 경우가 많습니다. 예전에는 `appearance: none`으로 기본 모양을 지우고 배경, 테두리, 체크 아이콘까지 직접 그려야 했지만, `accent-color` 속성을 쓰면 네이티브 모양과 키보드 포커스, 접근성 동작은 그대로 둔 채 강조 색상만 바꿀 수 있습니다.

```css
input[type="checkbox"],
input[type="radio"] {
  accent-color: #6366f1;
}

input[type="range"] {
  accent-color: #10b981;
}
```

요소마다 다른 색을 주고 싶지 않다면 `:root`에 `accent-color`를 한 번만 선언해도 체크박스, 라디오, range, progress 전체에 적용됩니다.

```css
:root {
  accent-color: #6366f1;
}
```

직접 그린 커스텀 컨트롤과 달리 OS의 다크 모드나 `prefers-contrast` 설정에 맞춰 컨트롤의 나머지 부분(체크 아이콘, 테두리 명암 등)은 브라우저가 알아서 보정해주기 때문에, 색상 대비 접근성을 따로 계산하지 않아도 되는 것도 장점입니다.
