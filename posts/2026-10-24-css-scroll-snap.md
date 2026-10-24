## CSS scroll-snap으로 JS 없이 스와이프 캐러셀 만들기

가로로 스크롤되는 이미지 캐러셀이나 카드 목록을 만들 때, 보통은 라이브러리나 터치 이벤트를 직접 처리하는 JS 코드를 떠올리기 쉽습니다. 하지만 CSS `scroll-snap-type`만으로도 스크롤이 끝났을 때 항목이 딱 맞춰 정렬되는 네이티브 스냅 효과를 구현할 수 있고, 모바일 터치 스크롤과도 자연스럽게 동작합니다.

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
}

.carousel > * {
  flex: 0 0 85%;
  scroll-snap-align: center;
}
```

부모 요소에는 스크롤 축(`x`)과 `mandatory`(스냅 강제) 또는 `proximity`(가까울 때만 스냅)를 지정하고, 자식 요소에는 `scroll-snap-align`으로 정렬 기준점(`start`, `center`, `end`)을 지정하면 끝입니다. `mandatory`는 스크롤이 멈추면 반드시 가장 가까운 스냅 지점으로 이동시키고, `proximity`는 스냅 지점 근처에 있을 때만 당겨서 더 느슨하게 동작합니다.

여기에 `scroll-padding`을 부모에, `scroll-snap-stop: always`를 자식에 추가하면 빠르게 스와이프해도 항목을 건너뛰지 않고 하나씩 멈추게 만들 수 있습니다. 또한 `scroll-behavior: smooth`를 함께 주면 "다음" 버튼을 눌러 `scrollBy()`로 이동할 때도 부드러운 애니메이션이 적용됩니다. 별도의 터치 이벤트 핸들러나 외부 캐러셀 라이브러리 없이도 브라우저 기본 스크롤 동작만으로 완성도 있는 UX를 만들 수 있다는 점이 가장 큰 장점입니다.
