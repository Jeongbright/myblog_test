## Intl.RelativeTimeFormat으로 "3시간 전" 같은 상대 시간 표시하기

댓글이나 알림 목록에서 "3시간 전", "2일 후"처럼 상대적인 시간을 보여줄 때, 날짜 차이를 직접 계산해서 문자열을 조립하는 대신 브라우저 내장 `Intl.RelativeTimeFormat`을 쓰면 로케일에 맞는 표현을 라이브러리 없이 얻을 수 있습니다.

```js
const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });

rtf.format(-3, 'hour');  // "3시간 전"
rtf.format(2, 'day');    // "모레"
rtf.format(-1, 'day');   // "어제"
```

두 번째 인자(단위)에는 `second`, `minute`, `hour`, `day`, `week`, `month`, `year`를 쓸 수 있고, 음수는 과거, 양수는 미래를 뜻합니다. `numeric: 'auto'` 옵션을 주면 `-1 day`처럼 숫자로 표현하는 대신 "어제", "오늘" 같은 자연스러운 표현을 우선 사용하고, 해당 표현이 없을 때만 숫자로 나타냅니다. `numeric: 'always'`로 설정하면 "1일 전"처럼 항상 숫자를 포함합니다.

실제로는 두 날짜의 차이를 계산해 적절한 단위를 골라주는 헬퍼가 필요합니다.

```js
function timeAgo(date) {
  const diffSec = (date.getTime() - Date.now()) / 1000;
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diffSec) >= secs) {
      return rtf.format(Math.round(diffSec / secs), unit);
    }
  }
  return rtf.format(Math.round(diffSec), 'second');
}
```

`new Intl.RelativeTimeFormat()` 인스턴스는 생성 비용이 있으므로 목록을 렌더링할 때마다 새로 만들지 말고 한 번 만들어 재사용하세요. 로케일 문자열(`'ko'`, `'en'` 등)만 바꾸면 번역 작업 없이 다국어 지원도 됩니다.
