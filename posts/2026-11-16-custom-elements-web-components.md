## 커스텀 엘리먼트(Custom Elements)로 프레임워크 없이 재사용 컴포넌트 만들기

리액트나 뷰 없이도 `HTMLElement`를 상속받아 재사용 가능한 컴포넌트를 만들 수 있습니다. `customElements.define()`으로 등록하면 HTML에서 커스텀 태그처럼 바로 쓸 수 있고, `connectedCallback`과 `attributeChangedCallback`만으로 상태 변화에 반응하는 작은 컴포넌트를 구현할 수 있습니다.

```js
class LikeButton extends HTMLElement {
  static observedAttributes = ['count'];

  connectedCallback() {
    this.addEventListener('click', () => {
      const count = Number(this.getAttribute('count') || 0);
      this.setAttribute('count', count + 1);
    });
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const count = this.getAttribute('count') || 0;
    this.textContent = `❤️ ${count}`;
  }
}

customElements.define('like-button', LikeButton);
```

```html
<like-button count="0"></like-button>
```

`observedAttributes`에 등록된 속성만 `attributeChangedCallback`을 발생시키므로, 감시할 속성을 좁혀두면 불필요한 리렌더를 줄일 수 있습니다. `connectedCallback`은 엘리먼트가 실제로 DOM에 삽입될 때 호출되므로 이벤트 리스너 등록이나 초기 렌더링을 여기서 처리하면 됩니다. 스타일을 캡슐화하고 싶다면 `this.attachShadow({ mode: 'open' })`으로 Shadow DOM을 붙여 전역 CSS의 영향을 피할 수 있습니다.
