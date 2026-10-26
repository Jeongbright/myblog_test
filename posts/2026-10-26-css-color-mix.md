## CSS color-mix()로 호버 색상·투명도 변형 쉽게 만들기

버튼 호버 색상을 만들 때 보통 디자인 토큰 외에 어두운 버전 색상값을 따로 정의해두곤 합니다. `color-mix()`를 쓰면 기준 색상 하나만 두고 필요한 변형을 그때그때 계산할 수 있습니다.

```css
:root {
  --brand: #3366ff;
}

.button:hover {
  background: color-mix(in srgb, var(--brand) 85%, black);
}
```

`color-mix(in <색공간>, 색상1 비율1, 색상2 비율2)` 형태로, 비율은 하나만 적어도 나머지가 자동 계산됩니다. `black`/`white`를 섞으면 단색을 더 어둡거나 밝게 만들 수 있고, `transparent`를 섞으면 별도로 `rgba()` 값을 계산하지 않고도 반투명 버전을 얻을 수 있습니다.

```css
.badge {
  /* 브랜드 색을 30% 불투명도로 */
  background: color-mix(in srgb, var(--brand) 30%, transparent);
}
```

색공간은 `srgb` 외에 `oklch`도 자주 씁니다. `oklch`는 사람이 인지하는 밝기 차이가 균일해서, 여러 브랜드 색상에 같은 비율로 어둡게/밝게 처리를 적용해도 결과가 고르게 보입니다. 다만 구형 Safari 등 일부 환경은 지원하지 않으므로, 폴백이 필요하면 `@supports (background: color-mix(in srgb, red, blue))`로 분기하면 됩니다.
