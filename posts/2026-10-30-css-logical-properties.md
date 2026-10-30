## CSS 논리적 속성으로 다국어 레이아웃까지 대응하기

`margin-left`, `padding-right`처럼 물리적 방향을 쓰는 속성은 아랍어 같은 RTL(오른쪽에서 왼쪽) 언어나 세로쓰기 문서에서 그대로 깨집니다. CSS 논리적 속성(logical properties)은 방향 대신 글의 흐름을 기준으로 삼아 이 문제를 해결합니다.

```css
.card {
  margin-inline: 16px;   /* 글이 흐르는 방향의 좌우 여백 */
  padding-block: 12px;   /* 줄이 쌓이는 방향의 상하 여백 */
  border-inline-start: 2px solid #333; /* LTR에서는 왼쪽, RTL에서는 오른쪽 */
}
```

`inline`은 텍스트가 흐르는 축(보통 가로), `block`은 줄이 쌓이는 축(보통 세로)을 뜻합니다. `html`에 `dir="rtl"`이나 `writing-mode: vertical-rl`을 적용해도 `margin-inline`, `padding-block`, `inset-inline` 같은 속성은 자동으로 방향을 맞춰줍니다. 다국어 서비스를 고려하지 않더라도, 좌우 대칭 레이아웃을 짤 때 `margin-inline: auto`처럼 간단히 중앙 정렬할 수 있어 실무에서 바로 쓸모가 있습니다. 주요 브라우저 모두 지원하므로 새 CSS를 작성할 때부터 물리적 속성 대신 논리적 속성을 기본으로 쓰는 것을 추천합니다.
