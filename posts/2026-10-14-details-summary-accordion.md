## details/summary로 아코디언 UI 만들기

아코디언 UI를 만들 때 클릭 이벤트로 높이를 토글하는 JS 코드를 직접 짜는 대신, 네이티브 `<details>`/`<summary>` 엘리먼트를 쓰면 접근성과 키보드 동작을 거의 공짜로 얻을 수 있습니다. `<summary>`를 클릭하거나 포커스된 상태에서 엔터를 누르면 자동으로 펼쳐지고 닫히며, 별도 설정 없이도 펼침 상태가 스크린 리더에 전달됩니다.

```html
<details>
  <summary>배송은 얼마나 걸리나요?</summary>
  <p>영업일 기준 2~3일 소요됩니다.</p>
</details>
```

여러 개의 아코디언 중 하나만 열리게 하고 싶다면, 같은 `name` 속성 값을 지정하면 됩니다. 최신 브라우저에서는 이 속성만으로 라디오 버튼처럼 하나가 열릴 때 나머지가 자동으로 닫힙니다.

```html
<details name="faq">
  <summary>질문 1</summary>
  <p>답변 1</p>
</details>
<details name="faq">
  <summary>질문 2</summary>
  <p>답변 2</p>
</details>
```

화살표 아이콘은 `summary::marker` 선택자로 모양과 색을 바꿀 수 있고, 기본 마커가 싫다면 `summary { list-style: none; }`로 지운 뒤 원하는 아이콘을 직접 넣으면 됩니다. 다만 구형 브라우저에서는 `name` 속성 지원 여부가 다를 수 있으니, 주요 타깃 브라우저에서 동작을 꼭 확인하고 사용하세요.
