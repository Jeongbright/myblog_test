JSON.parse(JSON.stringify(obj)) 같은 편법 없이, 브라우저에 내장된 `structuredClone()` 함수로 객체를 깊은 복사할 수 있습니다. 중첩된 객체와 배열은 물론 Date, Map, Set, RegExp 같은 타입도 원본과 독립적인 복사본으로 만들어줍니다.

## 기본 사용법

```js
const original = {
  name: '글',
  tags: ['js', 'web'],
  createdAt: new Date(),
  meta: new Map([['views', 10]]),
};

const copy = structuredClone(original);

copy.tags.push('clone');
console.log(original.tags); // ['js', 'web'] — 원본은 그대로
```

`JSON.stringify` 방식과 달리 Date는 문자열로 바뀌지 않고 Date 인스턴스 그대로 유지되며, Map과 Set도 손실 없이 복제됩니다.

## 복제할 수 없는 값들

함수와 DOM 노드, 클래스 인스턴스의 메서드·프로토타입 체인은 `structuredClone`이 지원하지 않습니다. 이런 값이 포함된 객체를 복제하려 하면 `DataCloneError` 예외가 발생합니다.

```js
try {
  structuredClone({ onClick: () => {} });
} catch (e) {
  console.error(e.name); // 'DataCloneError'
}
```

폼 상태나 API 응답처럼 순수 데이터로만 이루어진 객체를 복제할 때 사용하고, 함수나 DOM 참조가 섞인 객체에는 적합하지 않습니다.
