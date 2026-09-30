미디어 쿼리는 뷰포트 크기만 볼 수 있어서, 같은 컴포넌트가 사이드바에 있을 때와 본문 영역에 있을 때 서로 다르게 반응하게 만들기 어렵습니다. `@container`를 쓰면 컴포넌트가 자신을 담고 있는 부모 요소의 크기를 기준으로 스타일을 바꿀 수 있습니다.

## 기본 사용법

먼저 크기를 기준으로 삼을 부모에 `container-type`을 지정해 컨테이너로 선언합니다.

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
  }
}
```

`container-type: inline-size`는 가로 크기만 관찰 대상으로 삼겠다는 뜻이고, `container-name`은 여러 컨테이너 중 어떤 것을 기준으로 쿼리할지 지정할 때 씁니다.

## 주의할 점

컨테이너로 선언된 요소 자기 자신은 `@container`로 크기를 참조할 수 없으므로, 위 예시처럼 크기를 재는 바깥 래퍼와 실제로 스타일이 바뀌는 안쪽 요소를 분리하는 게 일반적입니다. 또한 `container-type: inline-size`를 준 요소는 자동으로 레이아웃 격리(containment)가 걸리므로, 적용 전후로 레이아웃이 깨지지 않는지 확인하는 것이 안전합니다.
