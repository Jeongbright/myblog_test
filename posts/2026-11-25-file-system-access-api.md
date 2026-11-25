## File System Access API로 브라우저에서 로컬 파일 직접 열고 저장하기

메모장 같은 웹 앱을 만들 때 "저장"을 누르면 늘 새 파일이 다운로드 폴더에 떨어지는 게 아쉬웠던 적이 있을 겁니다. File System Access API를 쓰면 사용자가 고른 바로 그 파일에 직접 덮어쓸 수 있습니다.

```js
let fileHandle;

async function openFile() {
  [fileHandle] = await window.showOpenFilePicker({
    types: [{ accept: { 'text/plain': ['.txt'] } }],
  });
  const file = await fileHandle.getFile();
  editor.value = await file.text();
}

async function saveFile() {
  const writable = await fileHandle.createWritable();
  await writable.write(editor.value);
  await writable.close();
}
```

`showOpenFilePicker()`로 받은 `FileSystemFileHandle`을 들고 있으면, 이후에는 `createWritable()`로 쓰기 스트림을 열어 같은 파일에 바로 저장할 수 있습니다. 파일 선택창은 반드시 클릭 같은 사용자 제스처 안에서 호출해야 하고, 핸들은 세션이 끝나면 사라지므로 재방문 시 다시 접근하려면 `navigator.storage.getDirectory()` 기반의 OPFS나 IndexedDB에 핸들을 저장해두고 `queryPermission()`으로 권한을 재확인해야 합니다. 2026년 기준 Chromium 계열 브라우저만 지원하므로, Safari·Firefox에서는 `window.showOpenFilePicker`가 있는지 먼저 확인하고 `<input type="file">` + 다운로드 링크 조합으로 폴백을 준비하는 것이 안전합니다.
