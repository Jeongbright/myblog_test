이미지나 비디오를 반응형으로 배치할 때, 로딩 전까지 요소 높이가 0이었다가 콘텐츠가 들어오는 순간 레이아웃이 밀리는 CLS(Cumulative Layout Shift) 문제를 자주 겪습니다. 예전에는 `padding-top` 퍼센트 트릭으로 비율을 고정했지만, 이제는 CSS `aspect-ratio` 속성 한 줄로 해결할 수 있습니다.

## 기본 사용법

```css
.thumbnail {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}
```

`aspect-ratio: 16 / 9`는 요소의 너비를 기준으로 높이를 자동 계산해줍니다. 이미지나 비디오처럼 고유 비율이 있는 요소에 적용하면 실제 콘텐츠가 로드되기 전부터 공간을 미리 확보해서 레이아웃 이동을 막을 수 있습니다. 이때 내용물이 비율에 맞게 잘려서 채워지도록 `object-fit: cover`를 함께 지정하는 게 좋습니다.

## padding-top 트릭 대신 쓰기

과거에는 부모 요소에 다음처럼 padding-top 퍼센트를 줘서 비율을 흉내냈습니다.

```css
.wrapper {
  position: relative;
  padding-top: 56.25%; /* 16:9 */
}
.wrapper > img {
  position: absolute;
  inset: 0;
}
```

`aspect-ratio`를 쓰면 래퍼 요소와 `position: absolute` 없이 같은 효과를 낼 수 있어 마크업이 단순해집니다. 다만 `width`, `height` 속성이 이미 지정된 `<img>`는 최신 브라우저가 자동으로 비율을 계산해 주므로, `aspect-ratio`는 그 속성이 없거나 비율을 다르게 강제하고 싶을 때 사용하면 됩니다.
