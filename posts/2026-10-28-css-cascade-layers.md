## CSS @layer로 스타일 우선순위 충돌 정리하기

CSS에서 가장 골치 아픈 문제 중 하나는 "분명 나중에 쓴 스타일인데 왜 안 먹히지?"입니다. 보통 선택자 명시도(specificity) 때문인데, `@layer`를 쓰면 명시도 싸움 대신 레이어 순서로 우선순위를 명확하게 관리할 수 있습니다.

```css
@layer reset, base, components, utilities;

@layer reset {
  button { all: unset; }
}

@layer components {
  .btn { padding: 8px 16px; background: #333; color: #fff; }
}

@layer utilities {
  .text-red { color: red; }
}
```

먼저 선언한 `@layer reset, base, components, utilities;`가 레이어의 우선순위를 정합니다. 이렇게 하면 `utilities` 레이어의 `.text-red`가 `components` 레이어의 `.btn`보다 선택자 명시도가 낮더라도 항상 뒤에 적용됩니다. 레이어에 속하지 않은 일반 스타일은 모든 레이어보다 우선순위가 높으니, 서드파티 CSS를 가장 낮은 레이어에 몰아넣으면 내 스타일을 깨지 않고 덮어쓸 수 있습니다. 다만 `!important`는 레이어 순서를 반대로 뒤집는다는 점은 주의해야 합니다.
