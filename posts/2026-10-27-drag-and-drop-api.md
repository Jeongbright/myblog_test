## HTML5 Drag and Drop API로 순서 바꾸는 리스트 만들기

할 일 목록처럼 항목 순서를 드래그로 바꾸는 UI는 외부 라이브러리 없이도 브라우저 내장 Drag and Drop API로 만들 수 있습니다. 끌리는 요소에 `draggable` 속성을 주고, 드롭을 받을 영역에서 `dragover`를 반드시 막아줘야 `drop` 이벤트가 발생합니다.

```html
<ul id="list">
  <li draggable="true">할 일 1</li>
  <li draggable="true">할 일 2</li>
  <li draggable="true">할 일 3</li>
</ul>
```

```js
const list = document.getElementById('list');
let dragging = null;

list.addEventListener('dragstart', (e) => {
  dragging = e.target;
  e.dataTransfer.effectAllowed = 'move';
});

list.addEventListener('dragover', (e) => {
  e.preventDefault(); // 기본 동작을 막아야 drop이 발생한다
  const target = e.target.closest('li');
  if (!target || target === dragging) return;
  const rect = target.getBoundingClientRect();
  const isAfter = e.clientY - rect.top > rect.height / 2;
  target.parentNode.insertBefore(dragging, isAfter ? target.nextSibling : target);
});
```

`dataTransfer`에는 드롭 대상(다른 탭, 파일 탐색기 등)에 전달할 데이터를 `setData`로 담을 수 있어서, 리스트 내부 재정렬뿐 아니라 외부 파일 드롭 영역을 만들 때도 같은 API를 씁니다.

다만 이 API는 마우스 기반이라 터치 기기에서는 기본적으로 동작하지 않고, 키보드만으로는 순서를 바꿀 수 없어 접근성이 떨어집니다. 실제 서비스에서는 화살표 버튼 같은 키보드 대안을 함께 제공하거나, 터치까지 지원해야 한다면 Pointer Events 기반 구현이나 전용 라이브러리를 고려하는 것이 안전합니다.
