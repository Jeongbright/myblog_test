## Web Share API로 모바일 네이티브 공유 시트 띄우기

링크나 글을 공유할 때 직접 만든 공유 버튼 목록(트위터, 페이스북 아이콘들) 대신, `navigator.share()`를 쓰면 운영체제가 제공하는 네이티브 공유 시트를 그대로 띄울 수 있습니다. 모바일 브라우저에서 특히 효과적이고, 사용자가 이미 설치한 메신저·메모 앱으로 바로 공유할 수 있습니다.

```js
async function sharePost(title, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  } else {
    await navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다.');
  }
}
```

`navigator.share`는 지원하지 않는 브라우저(주로 데스크톱 일부)도 많으므로, 반드시 기능 감지 후 `Clipboard API` 같은 대체 수단으로 폴백해야 합니다. 사용자가 공유 시트를 취소하면 `AbortError`가 발생하는데, 이는 실패가 아니라 정상적인 취소이므로 에러로 처리하지 않는 게 좋습니다. 또한 `navigator.share()`는 버튼 클릭 같은 사용자 제스처 안에서 호출해야 동작하며, HTTPS 환경에서만 사용할 수 있습니다.
