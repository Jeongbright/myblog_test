화면에 보이지도 않는 이미지를 페이지 로드 시점에 전부 내려받으면 초기 로딩 속도가 느려집니다. 이런 이미지는 사용자가 스크롤해서 실제로 보게 될 때 불러오는 것이 좋은데, 이를 지연 로딩(lazy loading)이라고 합니다.

## 네이티브 속성으로 간단히 적용하기

대부분의 경우 브라우저 내장 속성만으로 충분합니다. 별도의 JS 없이 `img` 태그에 속성 하나만 추가하면 됩니다.

```html
<img src="photo.jpg" loading="lazy" alt="설명" />
```

뷰포트 근처에 들어오기 전까지 브라우저가 알아서 다운로드를 미뤄주기 때문에, 목록형 페이지나 긴 콘텐츠에서 특히 효과적입니다.

## 더 세밀한 제어가 필요할 때: IntersectionObserver

로딩 시점에 애니메이션을 추가하거나, `img` 이외의 요소(배경 이미지, 커스텀 컴포넌트)에 지연 로딩을 적용하려면 `IntersectionObserver`를 직접 씁니다.

```js
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      el.src = el.dataset.src;
      obs.unobserve(el);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach((img) => {
  observer.observe(img);
});
```

## 정리

일반 이미지는 `loading="lazy"`만으로 충분한 경우가 많고, 커스텀 동작이 필요할 때만 `IntersectionObserver`로 넘어가면 됩니다. 두 방식을 상황에 맞게 섞어 쓰면 불필요한 복잡도 없이 로딩 성능을 개선할 수 있습니다.
