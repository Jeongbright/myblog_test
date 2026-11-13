## CSS @property로 커스텀 프로퍼티에 타입 부여하고 애니메이션하기

일반 CSS 커스텀 프로퍼티(`--variable`)는 타입이 없는 문자열 취급이라, 브라우저가 중간값을 계산하지 못해 색상이나 각도 같은 값을 그대로 트랜지션·애니메이션할 수 없습니다. `@property`로 커스텀 프로퍼티를 등록하면 `syntax`로 타입을 지정하고 `inherits`, `initial-value`까지 정해줄 수 있어, 해당 프로퍼티도 일반 CSS 속성처럼 보간됩니다.

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.button {
  --angle: 0deg;
  background: conic-gradient(from var(--angle), #6366f1, #ec4899, #6366f1);
  transition: --angle 0.4s ease;
}

.button:hover {
  --angle: 360deg;
}
```

`syntax`에는 `<color>`, `<length>`, `<number>`, `<percentage>` 같은 타입을 쓸 수 있고, CSS 대신 JS의 `CSS.registerProperty()`로 동일하게 등록할 수도 있습니다. 그라디언트 각도 회전, 그림자 색상 전환처럼 기존엔 JS로 프레임마다 값을 갱신해야 했던 효과를 순수 CSS 트랜지션만으로 구현할 수 있다는 점이 핵심입니다. 다만 Safari는 16.4부터 지원하므로, 미지원 브라우저에서는 `@property` 블록이 무시되고 트랜지션 없이 값만 즉시 바뀌는 폴백 동작을 확인해두는 것이 좋습니다.
