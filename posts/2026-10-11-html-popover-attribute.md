## popover 속성으로 JS 없이 팝오버 만들기

드롭다운 메뉴나 툴팁 같은 팝오버 UI는 보통 `position: absolute`와 열고 닫는 JS 이벤트 리스너를 직접 작성해야 했습니다. HTML `popover` 속성을 쓰면 이런 로직 없이도 네이티브 팝오버를 만들 수 있습니다. 팝오버는 기본적으로 다른 요소 위에 떠 있는 최상위 레이어(top layer)에 렌더링되고, 바깥을 클릭하거나 Esc를 누르면 자동으로 닫힙니다.

```html
<button popovertarget="menu">메뉴 열기</button>

<div id="menu" popover>
  <p>팝오버 내용입니다.</p>
  <button popovertarget="menu" popovertargetaction="hide">닫기</button>
</div>
```

`popover` 속성만 붙이면 해당 요소는 기본적으로 숨겨진 상태가 되고, `popovertarget`으로 그 id를 가리키는 버튼을 누르면 열리고 닫힙니다. `popovertargetaction`을 `show`, `hide`, `toggle`(기본값) 중 하나로 지정해 동작을 세분화할 수도 있습니다. 열림/닫힘 애니메이션은 `:popover-open` 의사 클래스와 CSS 전환으로 처리하면 됩니다. 최신 Chrome, Edge, Firefox, Safari에서 지원하지만, 구형 브라우저 대응이 필요하다면 폴리필을 함께 검토하세요.
