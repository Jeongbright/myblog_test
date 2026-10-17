## URLSearchParams로 쿼리 스트링 쉽게 다루기

문자열을 직접 잘라서 쿼리 파라미터를 읽고 쓰다 보면 인코딩이나 `&` 구분자 처리에서 실수하기 쉽습니다. 브라우저 내장 `URLSearchParams`를 쓰면 파싱과 인코딩을 직접 신경 쓰지 않고 쿼리 스트링을 다룰 수 있습니다.

```js
const params = new URLSearchParams(location.search);
params.get('page');        // "2"
params.set('sort', 'asc');
params.append('tag', 'js');
params.delete('page');

history.replaceState(null, '', `?${params.toString()}`);
```

`URL` 객체와 함께 쓰면 더 편합니다.

```js
const url = new URL(location.href);
url.searchParams.set('q', '검색어 with space');
url.toString(); // 공백과 한글이 자동으로 인코딩됨
```

`for...of`로 순회하거나, 같은 키가 여러 번 쓰였을 때는 `getAll()`로 값 전체를 배열로 받을 수 있습니다. fetch 요청의 쿼리 문자열을 만들 때나, 필터·정렬 상태를 주소창에 저장해 새로고침 후에도 유지하는 UI를 만들 때 바로 활용하기 좋습니다.
