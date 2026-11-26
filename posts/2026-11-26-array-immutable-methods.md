## toSorted·toReversed·with()로 원본 배열 건드리지 않고 다루기

React나 Vue처럼 불변성(immutability)에 의존하는 상태 관리에서는 `sort()`, `reverse()`, `splice()`가 원본 배열을 그 자리에서 변경해버리는 게 항상 골칫거리였습니다. 그래서 상태를 바꿀 때마다 `[...arr].sort()`처럼 스프레드로 복사본을 만든 뒤 변경 메서드를 쓰는 패턴이 관용구처럼 쓰였죠. ES2023부터는 이 복사+변경 과정을 메서드 하나로 끝내는 불변 버전이 표준에 들어왔습니다.

```js
const nums = [3, 1, 2];

const sorted = nums.toSorted();      // [1, 2, 3]
const reversed = nums.toReversed();  // [2, 1, 3]
const updated = nums.with(0, 99);    // [99, 1, 2]

console.log(nums); // [3, 1, 2] - 원본은 그대로
```

`toSorted()`, `toReversed()`, `toSpliced()`, `with(index, value)`는 원본 배열을 변경하지 않고 수정된 새 배열을 반환합니다. React 상태 업데이트 함수 안에서 `setItems(items.toSorted(...))`처럼 바로 쓰면 스프레드 복사 코드를 줄일 수 있어 편리합니다. 다만 2026년 기준으로도 Chrome 110, Firefox 115, Safari 16 이상에서만 지원되므로, 구형 브라우저까지 지원해야 한다면 폴리필을 쓰거나 기존 스프레드 패턴을 유지하는 게 안전합니다.
