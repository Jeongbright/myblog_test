## FormData로 폼 입력값 한 번에 모아서 전송하기

회원가입 폼처럼 입력 필드가 여러 개면 `document.getElementById`로 하나씩 값을 꺼내 객체를 만드는 코드가 금방 길어집니다. `FormData`를 쓰면 `<form>` 엘리먼트 하나만 넘겨서 모든 입력값을 한 번에 모을 수 있고, `<input type="file">`의 파일도 그대로 포함됩니다.

```js
const form = document.querySelector("#signup-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  // formData.get("email") 처럼 개별 값도 꺼낼 수 있습니다.

  const response = await fetch("/api/signup", {
    method: "POST",
    body: formData, // Content-Type은 fetch가 자동으로 설정합니다.
  });

  if (!response.ok) {
    console.error("가입 실패:", response.status);
  }
});
```

`body`에 객체를 직접 넣으면 JSON으로 보내기 위해 `JSON.stringify`와 `Content-Type: application/json` 헤더를 손수 지정해야 하지만, `FormData`는 `multipart/form-data` 형식의 경계값(boundary)까지 fetch가 알아서 채워주므로 신경 쓸 필요가 없습니다. 같은 `name`을 가진 체크박스가 여러 개면 `formData.getAll("hobby")`로 배열처럼 전체 값을 받을 수 있다는 점도 기억해두면 유용합니다.
