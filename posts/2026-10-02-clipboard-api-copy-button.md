"복사하기" 버튼을 만들 때 예전에는 보이지 않는 `<textarea>`를 만들고 값을 넣은 뒤 `document.execCommand('copy')`를 호출하는 식으로 구현했습니다. 지금은 비동기 Clipboard API인 `navigator.clipboard.writeText()`로 훨씬 간단하게 같은 기능을 만들 수 있습니다.

## 기본 사용법

```js
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('복사 완료');
  } catch (err) {
    console.error('복사 실패', err);
  }
}

button.addEventListener('click', () => {
  copyToClipboard(codeBlock.textContent);
});
```

`writeText`는 프라미스를 반환하므로 복사 성공 여부에 따라 버튼 텍스트를 "복사됨!"으로 잠깐 바꿔주는 등의 피드백을 주기 좋습니다.

## 주의할 점

Clipboard API는 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작하며, 대부분의 브라우저는 클릭 같은 사용자 제스처 이벤트 핸들러 안에서 호출했을 때만 권한 없이 허용합니다. `setTimeout` 등으로 호출 시점을 늦추면 권한 오류가 날 수 있으니, 반드시 이벤트 리스너 콜백 안에서 바로 호출하세요. 구형 브라우저 지원이 필요하다면 `navigator.clipboard` 존재 여부를 확인하고 `execCommand` 방식으로 폴백하는 것도 고려할 만합니다.
