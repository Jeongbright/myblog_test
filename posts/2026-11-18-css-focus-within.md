## CSS :focus-within으로 자식이 포커스됐을 때 부모 스타일링하기

입력 필드 하나에 포커스 스타일을 주는 건 `:focus`로 충분하지만, "이 필드를 감싼 카드 전체"를 강조하고 싶을 땐 JS로 `focus`/`blur` 이벤트를 듣고 클래스를 토글해야 했습니다. `:focus-within`을 쓰면 자식 요소 중 하나라도 포커스를 받으면 부모에 스타일을 바로 적용할 수 있습니다.

```css
.search-box {
  border: 1px solid #ddd;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-box:focus-within {
  border-color: #4f7cff;
  box-shadow: 0 0 0 3px rgb(79 124 255 / 0.15);
}
```

`input`이 아니라 `.search-box`에 테두리를 그려도, 안에 있는 `input`이 포커스되는 순간 `.search-box:focus-within`이 매칭되어 카드 전체 테두리가 강조됩니다. 자식이 포커스를 잃으면 자동으로 원래 스타일로 돌아오므로 별도 blur 처리도 필요 없습니다.

참고로 비슷한 이름의 `:focus-visible`은 "키보드 포커스인지"를 구분하는 의사 클래스로 역할이 다릅니다. `:focus-within`은 포커스 주체가 자신이 아니라 자손이라는 점에 집중한 선택자이므로, 폼 그룹·검색창·드롭다운처럼 "내부 요소가 활성화되면 컨테이너도 강조"하고 싶은 레이아웃에 적합합니다.
