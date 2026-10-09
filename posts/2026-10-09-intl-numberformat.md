## 숫자 포맷팅, 라이브러리 없이 끝내기

가격이나 통계를 보여줄 때 `1234567` 같은 숫자를 그대로 찍으면 가독성이 떨어집니다. 보통 `toLocaleString()`이나 직접 정규식으로 천 단위 콤마를 넣곤 하는데, 브라우저 내장 `Intl.NumberFormat`을 쓰면 통화, 퍼센트, 단위 축약까지 한 번에 처리할 수 있습니다.

```js
const price = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
}).format(1234567);
// "₩1,234,567"

const percent = new Intl.NumberFormat('ko-KR', {
  style: 'percent',
  maximumFractionDigits: 1,
}).format(0.1234);
// "12.3%"

const compact = new Intl.NumberFormat('ko-KR', {
  notation: 'compact',
}).format(15000000);
// "1500만"
```

`Intl.NumberFormat` 인스턴스는 생성 비용이 있으므로, 같은 포맷을 반복해서 쓸 때는 매번 `new`로 만들지 말고 컴포넌트 바깥이나 모듈 스코프에 한 번만 생성해두고 재사용하는 게 좋습니다. 리스트를 렌더링하며 숫자마다 새 인스턴스를 만드는 건 불필요한 오버헤드입니다.

날짜는 `Intl.DateTimeFormat`, 복수형 처리는 `Intl.PluralRules`로 비슷하게 해결할 수 있으니, 숫자·날짜·단위 포맷팅이 필요하면 외부 라이브러리를 추가하기 전에 `Intl` 네임스페이스부터 확인해보세요.
