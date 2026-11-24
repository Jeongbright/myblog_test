## Fullscreen API로 전체화면 모드 구현하기

비디오 플레이어나 이미지 갤러리에서 전체화면 버튼을 누르면 브라우저 주소창과 탭까지 가려지는 진짜 전체화면이 되는 걸 본 적 있을 겁니다. CSS로 `position: fixed`에 `width/height: 100%`를 줘도 브라우저 UI는 그대로 남기 때문에, 이건 CSS가 아니라 Fullscreen API 영역입니다.

```js
const player = document.querySelector('#player');

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    player.requestFullscreen().catch((err) => {
      console.error(`전체화면 전환 실패: ${err.message}`);
    });
  }
}

document.addEventListener('fullscreenchange', () => {
  const isFullscreen = document.fullscreenElement === player;
  toggleBtn.textContent = isFullscreen ? '전체화면 종료' : '전체화면';
});
```

`requestFullscreen()`은 반드시 클릭 같은 사용자 제스처 안에서 호출해야 하며, 임의 시점에 코드로 호출하면 Promise가 거부됩니다. 상태 확인은 `document.fullscreenElement`로 하고, 전체화면 진입/종료는 둘 다 `fullscreenchange` 이벤트 하나로 감지하면 됩니다. 전체화면 상태에서만 다른 스타일을 주고 싶다면 `:fullscreen` 의사 클래스를 CSS에서 바로 쓸 수 있습니다. iOS Safari는 `<video>` 같은 일부 엘리먼트에서만 전체화면을 지원하는 제약이 있으니, 지원 범위가 넓어야 하는 프로젝트라면 `document.fullscreenEnabled`로 먼저 가능 여부를 확인하는 것이 안전합니다.
