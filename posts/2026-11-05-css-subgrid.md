## CSS Subgrid로 중첩 그리드 정렬 맞추기

카드 여러 개를 그리드로 나열할 때, 각 카드 내부의 제목·본문·버튼 높이가 카드마다 달라서 줄이 어긋나는 경우가 많습니다. 각 카드를 독립된 그리드로 만들면 부모 그리드의 트랙 정보를 모르기 때문입니다. `subgrid`를 쓰면 자식 그리드가 부모의 행/열 트랙을 그대로 물려받아 정렬을 맞출 수 있습니다.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* 부모의 행 트랙을 그대로 사용 */
}
```

`.card` 안의 제목, 본문, 버튼을 각각 1~3번째 행에 배치하면, 카드마다 내용 길이가 달라도 모든 카드의 제목 줄과 버튼 줄이 같은 높이에서 정렬됩니다. 기존에는 JS로 높이를 재서 맞추거나 `align-items: stretch` 정도로 우회해야 했던 문제를, 레이아웃 차원에서 해결하는 것입니다.

`grid-template-columns: subgrid`도 동일한 방식으로 열 정렬에 쓸 수 있습니다. 다만 subgrid는 부모가 명시적 그리드 트랙을 가지고 있을 때만 의미가 있으므로, 부모의 `grid-template-columns`/`rows` 설계를 먼저 끝낸 뒤 적용하는 것이 좋습니다. 최신 Chrome, Firefox, Safari에서 모두 지원하지만, 구형 브라우저를 지원해야 한다면 폴백 레이아웃을 함께 준비하세요.
