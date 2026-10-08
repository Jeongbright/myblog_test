모달을 열었는데 `Tab` 키로 배경 콘텐츠에 포커스가 가거나, 스크린 리더가 숨겨진 영역의 텍스트를 읽어버린 경험이 있나요? HTML 전역 속성 `inert`를 쓰면 특정 영역과 그 자식 요소 전체를 한 번에 "비활성" 상태로 만들 수 있습니다. 클릭, 포커스, 텍스트 선택이 모두 막히고 접근성 트리에서도 제외됩니다.

## 기본 사용법

```html
<div id="background">
  <button>배경의 버튼</button>
</div>

<dialog id="modal" open>
  <button>닫기</button>
</dialog>
```

```js
const dialog = document.getElementById('modal');
const background = document.getElementById('background');

background.inert = true; // 모달이 열려있는 동안 배경 비활성화

dialog.addEventListener('close', () => {
  background.inert = false; // 닫히면 다시 상호작용 가능
});
```

## aria-hidden과의 차이

예전에는 `aria-hidden="true"`와 각 요소에 `tabindex="-1"`을 일일이 지정해 비슷한 효과를 냈습니다. 하지만 `aria-hidden`은 포커스 이동이나 클릭을 막지 못해, 마우스나 키보드 조작은 여전히 가능한 버그가 흔했습니다. `inert`는 자식 요소까지 재귀적으로 포커스·클릭·선택을 막아주므로 별도 스크립트 없이 안전합니다.

## CSS로 시각적 표시 더하기

```css
[inert] {
  opacity: 0.5;
  pointer-events: none; /* inert가 이미 막지만 명시적으로 표시 */
}
```

모달, 사이드 드로어, 로딩 중인 폼 섹션처럼 "지금은 조작하면 안 되는 영역"을 표시할 때 `disabled` 속성을 쓸 수 없는 컨테이너 단위에 특히 유용합니다.
