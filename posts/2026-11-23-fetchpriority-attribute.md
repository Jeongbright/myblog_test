## fetchpriority 속성으로 핵심 리소스 우선순위 직접 지정하기

브라우저는 태그 종류와 문서 내 위치를 보고 리소스 로딩 우선순위를 추측하지만, 실제로 LCP(Largest Contentful Paint)를 좌우하는 이미지가 낮은 우선순위로 분류되는 경우가 있습니다. `fetchpriority` 속성을 쓰면 이 판단을 직접 보정할 수 있습니다.

```html
<img src="hero.jpg" fetchpriority="high" alt="메인 배너">
<link rel="preload" href="font.woff2" as="font" fetchpriority="high" crossorigin>
<img src="below-fold.jpg" loading="lazy" fetchpriority="low">
```

값은 `high`, `low`, 기본값인 `auto` 세 가지이며, `loading="lazy"`와 함께 써도 충돌하지 않습니다. 다만 모든 리소스에 `high`를 남발하면 진짜 중요한 리소스와 대역폭을 두고 경쟁하게 되므로, 페이지당 LCP 후보 하나 정도로 제한해서 쓰는 것이 효과적입니다. 자바스크립트에서는 `fetch(url, { priority: "high" })`처럼 Fetch API 옵션으로 동일한 우선순위를 지정할 수 있습니다.
