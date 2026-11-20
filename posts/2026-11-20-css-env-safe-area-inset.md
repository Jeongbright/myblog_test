## CSS env()로 노치·홈 인디케이터 피해서 콘텐츠 배치하기

iPhone처럼 노치나 하단 홈 인디케이터가 있는 기기에서는 화면 끝에 딱 붙인 버튼이나 고정 바가 잘리거나 제스처 영역과 겹칠 수 있습니다. `viewport-fit=cover`를 설정하고 `env(safe-area-inset-*)` 값을 패딩에 더해주면, 콘텐츠가 안전 영역 밖으로 밀려나지 않게 자동으로 여백이 생깁니다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
.bottom-nav {
  position: fixed;
  inset-block-end: 0;
  padding-block-end: max(12px, env(safe-area-inset-bottom));
  padding-inline: max(16px, env(safe-area-inset-left), env(safe-area-inset-right));
}
```

`env()` 값은 노치가 없는 기기에서는 0이 반환되므로, `max()`로 최소 여백과 비교해두면 노치 유무와 관계없이 일정한 여백을 보장할 수 있습니다. 반대로 `viewport-fit=cover`를 메타 태그에 넣지 않으면 `env()` 값 자체가 항상 0으로 계산되니, 둘은 반드시 짝으로 설정해야 합니다.
