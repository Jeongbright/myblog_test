## HTML &lt;template&gt; 엘리먼트로 반복 UI 안전하게 렌더링하기

리스트 아이템을 여러 개 그릴 때 흔히 문자열을 이어붙여 `innerHTML`에 넣는 방법을 씁니다. 하지만 이 방식은 사용자 입력이 섞이면 XSS 위험이 생기고, 매번 HTML을 파싱해야 해서 느립니다. `<template>` 엘리먼트는 내용을 파싱만 해두고 렌더링하지 않는 "틀"이라서, `content.cloneNode(true)`로 복제해 안전하고 빠르게 재사용할 수 있습니다.

```html
<template id="card-template">
  <li class="card">
    <h3 class="card-title"></h3>
    <p class="card-desc"></p>
  </li>
</template>

<ul id="list"></ul>
```

```js
const template = document.getElementById('card-template');
const list = document.getElementById('list');

function renderCard(item) {
  const node = template.content.cloneNode(true);
  node.querySelector('.card-title').textContent = item.title;
  node.querySelector('.card-desc').textContent = item.desc;
  return node;
}

const fragment = document.createDocumentFragment();
items.forEach((item) => fragment.appendChild(renderCard(item)));
list.appendChild(fragment);
```

`textContent`로 값을 채우기 때문에 사용자 입력이 그대로 들어가도 태그로 해석되지 않아 안전하고, `DocumentFragment`에 모아서 한 번에 `appendChild`하면 리플로우도 한 번만 발생합니다. `<template>` 안의 스크립트와 이미지는 로드되지 않고 복제 시점에만 활성화되므로, 미리 숨겨둔 마크업을 그대로 뒀다가 꺼내 쓰는 용도로도 유용합니다.
