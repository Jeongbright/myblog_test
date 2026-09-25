모달 창을 만들 때 흔히 `div`에 `position: fixed`와 어두운 배경, 포커스 트랩용 JS를 직접 구현하곤 합니다. 하지만 HTML 표준 `<dialog>` 엘리먼트를 쓰면 이런 작업 대부분을 브라우저가 대신 처리해줍니다.

## 기본 사용법

`showModal()`을 호출하면 모달로 열리고, 배경은 `::backdrop`으로 자동 어두워지며, 포커스도 다이얼로그 안으로 이동합니다.

```html
<dialog id="confirm-dialog">
  <p>정말 삭제하시겠습니까?</p>
  <button id="cancel">취소</button>
  <button id="confirm">삭제</button>
</dialog>

<button id="open">삭제</button>
```

```js
const dialog = document.getElementById('confirm-dialog');

document.getElementById('open').addEventListener('click', () => {
  dialog.showModal();
});

document.getElementById('cancel').addEventListener('click', () => {
  dialog.close();
});
```

## Esc 키와 바깥 클릭 닫기

Esc 키로 닫히는 동작은 기본 제공됩니다. 배경 클릭으로 닫으려면 클릭 좌표가 다이얼로그 영역 밖인지 확인하면 됩니다.

```js
dialog.addEventListener('click', (e) => {
  const rect = dialog.getBoundingClientRect();
  const inside =
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (!inside) dialog.close();
});
```

## 정리

`<dialog>`는 포커스 트랩, Esc 닫기, 배경 스타일링을 기본 제공해서 커스텀 모달보다 코드가 훨씬 줄어듭니다. 모바일을 포함한 최신 브라우저에서 폭넓게 지원되므로, 새 모달을 만들 때는 먼저 고려해볼 만한 선택지입니다.
