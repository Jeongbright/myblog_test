## CSS만으로 스크롤 연동 애니메이션 만들기 (animation-timeline: scroll)

스크롤 진행률에 맞춰 요소를 움직이는 효과(상단 진행 바, 패럴랙스, 패이드인 등)는 보통 `scroll` 이벤트를 듣고 매 프레임 `transform`이나 `opacity`를 계산해야 했습니다. `animation-timeline: scroll()`을 쓰면 이 작업을 JS 없이 브라우저가 직접 처리합니다. 애니메이션의 진행 축을 "시간"이 아니라 "스크롤 위치"로 바꿔주는 것이 핵심입니다.

```css
@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.progress-bar {
  transform-origin: left;
  animation: grow-progress linear;
  animation-timeline: scroll(root);
}
```

`scroll()`은 스크롤 컨테이너 전체를 기준으로 삼고, 특정 요소가 뷰포트에 들고 나는 구간만 보고 싶다면 `animation-timeline: view()`를 대신 사용합니다. 두 방식 모두 `requestAnimationFrame`과 스크롤 리스너를 완전히 제거할 수 있어 메인 스레드 부담이 크게 줄고, 스크롤 자체가 끊겨도 애니메이션은 컴포지터에서 매끄럽게 유지됩니다. 다만 Safari 지원이 아직 늦어, 프로그레시브 인핸스먼트로 `@supports (animation-timeline: scroll())` 안에 넣고 미지원 브라우저에서는 기존 JS 폴백을 유지하는 편이 안전합니다.
