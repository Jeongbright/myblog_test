## CSS object-fit과 object-position으로 이미지 썸네일 비율 맞추기

썸네일 목록이나 카드 UI에서 원본 비율이 제각각인 이미지를 같은 크기의 박스에 넣으면 찌그러지기 쉽습니다. `<img>`에 고정 크기를 주고 `object-fit`만 추가하면 비율을 유지한 채 박스를 꽉 채울 수 있습니다.

```css
.thumb {
  width: 240px;
  height: 160px;
  object-fit: cover;
  object-position: center top;
}
```

`object-fit: cover`는 비율을 유지하면서 박스를 가득 채우고 넘치는 부분을 잘라내며, `contain`은 잘리지 않게 전체를 박스 안에 맞추고 남는 공간은 여백으로 둡니다. 인물 사진처럼 중요한 부분이 위쪽에 있다면 `object-position: center top`으로 잘리는 기준점을 옮길 수 있습니다. `<img>`와 `<video>` 양쪽에 모두 적용되고, JS나 래퍼 엘리먼트 없이 CSS 두 줄로 끝나기 때문에 리스트형 UI에서 가장 먼저 시도해볼 만한 방법입니다.
