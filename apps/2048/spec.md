# 2048 게임 — 구현 스펙 (Build 단계 지침)

## 1. 파일 구조

```
apps/2048/
├── index.html   — 마크업 (게임 보드, 스코어보드, 오버레이, 안내 텍스트)
├── style.css    — 전체 스타일 (독립적, 블로그 CSS에 의존하지 않음)
└── script.js    — 게임 로직 + 렌더링 + 입력 처리 (프레임워크 없이 순수 JS)
```

- 외부 라이브러리/CDN 사용하지 않음 (필요 없음).
- `index.html`은 `style.css`, `script.js`만 로드. 블로그의 `css/style.css`, `js/*.js`는 참조하지 않음(완전 독립).
- 다크/라이트는 `prefers-color-scheme` 미디어쿼리로만 대응(블로그의 토글 버튼/로컬스토리지 테마 로직은 가져오지 않음 — 이 앱은 blog에 iframe으로 임베드될 수 있으므로 시스템 설정을 그대로 따르는 것이 안전).

## 2. index.html DOM 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>2048</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="game-2048">
    <header class="game-header">
      <h1 class="game-title">2048</h1>
      <div class="score-panel">
        <div class="score-box">
          <span class="score-label">SCORE</span>
          <span class="score-value" id="score">0</span>
        </div>
        <div class="score-box">
          <span class="score-label">BEST</span>
          <span class="score-value" id="best-score">0</span>
        </div>
      </div>
    </header>

    <div class="game-toolbar">
      <p class="game-hint">방향키 또는 스와이프로 타일을 이동하세요. 같은 숫자가 만나면 합쳐집니다.</p>
      <button id="new-game-btn" class="btn-new-game">새 게임</button>
    </div>

    <div class="board-wrap">
      <div class="grid-background" id="grid-background"></div>
      <!-- grid-background: 16개 .grid-cell 배경 칸 (정적 마크업) -->
      <div class="tile-container" id="tile-container"></div>
      <!-- tile-container: script.js가 .tile 요소들을 절대 위치로 렌더링 -->

      <div class="overlay" id="overlay" hidden>
        <p class="overlay-message" id="overlay-message"></p>
        <div class="overlay-actions" id="overlay-actions"></div>
      </div>
    </div>

    <footer class="game-footer">
      <a href="../../index.html">← 블로그로 돌아가기</a>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>
```

- `grid-background`: 4x4 = 16개의 `.grid-cell` div (빈 칸 배경, 고정). 정적 마크업으로 작성(더 단순).
- `tile-container`: 실제 숫자 타일(`.tile`)이 들어가는 레이어. `position: relative`인 `board-wrap` 안에서 `.tile`은 `position: absolute`로 배치.
- `overlay`: 승리/게임오버 시 표시. 평소에는 `hidden` 속성으로 숨김.

## 3. 상태(state) 구조 (script.js)

```js
const GRID_SIZE = 4;
const WIN_VALUE = 2048;
const STORAGE_BEST_KEY = "game2048BestScore";

let state = {
  grid: [],         // GRID_SIZE x GRID_SIZE, 각 셀은 null 또는 tile 객체
  tiles: [],         // 현재 살아있는 tile 객체 배열 (렌더링용, id로 추적)
  score: 0,
  best: 0,
  isWon: false,       // 2048 타일에 처음 도달했는지
  isOver: false,      // 더 이상 이동 불가
  keepPlaying: false,  // 승리 후에도 계속하기를 선택했는지
  isBusy: false,       // 애니메이션 진행 중 입력 잠금 플래그
  nextTileId: 1
};

// tile 객체: { id, value, row, col, isNew, isMerged, mergedFrom: [id, id] | null }
```

- `grid[row][col]`은 해당 위치의 tile 객체(또는 null)를 담음. `tiles` 배열은 렌더링 시 DOM 재사용(같은 id → 같은 DOM 요소 재활용, CSS transition으로 슬라이딩 애니메이션) 목적.
- `state.best`는 `localStorage.getItem(STORAGE_BEST_KEY)`로 초기화, 매 이동 후 `score > best`이면 갱신 후 저장.

## 4. 핵심 함수 목록과 동작

### 초기화
- `initGame()`: `state` 리셋(`score=0`, `isWon=false`, `isOver=false`, `keepPlaying=false`, grid 전부 null), `addRandomTile()` 2회 호출, `render()`, 오버레이 숨김.
- `loadBestScore()` / `saveBestScore()`: localStorage 입출력, try/catch로 감싸 프라이빗 모드 대응(블로그 `theme.js` 패턴과 동일하게).

### 타일 생성
- `getEmptyCells()`: grid를 순회해 `{row, col}` 빈 칸 목록 반환.
- `addRandomTile()`: 빈 칸 중 랜덤 위치 선택 → 값은 90% 확률 2, 10% 확률 4 → 새 tile 객체 생성(`isNew: true`) → grid와 `state.tiles`에 추가.

### 이동/병합 로직
- `move(direction)`: `"up" | "down" | "left" | "right"` 중 하나를 받아 처리하는 진입점.
  1. 현재 grid를 방향에 맞춰 논리적 "왼쪽 정렬" 형태로 변환(회전/반전) — up/down/right는 실제로 `slideAndMergeLeft`를 재사용하기 위해 그리드를 회전한 뒤 처리하고 다시 역회전.
  2. 각 행(row)에 대해 `slideAndMergeLeft(rowTilesArray)` 실행:
     - null 제거 → 압축된 tile 배열.
     - 왼쪽부터 순회하며 인접한 두 tile의 값이 같고 아직 이번 이동에서 병합된 적 없으면 병합: 새 값 = 2배, `score += 새 값`, 병합 결과는 살아남는 tile의 id를 유지하고 나머지는 "제거 대상"으로 표시 후 `mergedFrom`에 기록. 병합 플래그로 3연쇄 병합 방지(`[2,2,2,2]` → `[4,4]`가 되어야지 `[8,0]`이 되면 안 됨).
     - 압축 후 오른쪽을 0(null)으로 패딩.
  3. 모든 행 처리 후 역회전하여 원래 좌표계로 복원, 각 tile의 `row`/`col` 갱신.
  4. 변경 여부(`moved`) 판정: 병합 이전/이후 grid가 다르면 `true`.
  5. `moved === true`이면: `addRandomTile()`, `updateScore()`, `checkWin()`, `checkGameOver()`, `render()`. `moved === false`면 아무 것도 하지 않음(입력 무시).
- `rotateGridClockwise(grid)` / 보조 회전·반전 헬퍼: up/down/left/right 4방향을 하나의 `slideAndMergeLeft` 구현으로 처리하기 위한 유틸.

### 승리/게임오버 판정
- `checkWin(grid)`: 아직 `state.isWon===false`이고 grid 안에 `WIN_VALUE`(2048) 이상 타일이 있으면 `state.isWon = true`, `showOverlay("win")` 호출(단 `state.keepPlaying===true`면 오버레이 다시 띄우지 않음).
- `checkGameOver(grid)`: 빈 칸이 없고, 모든 셀에 대해 오른쪽/아래쪽 인접 셀과 값이 같은 경우가 하나도 없으면 `state.isOver = true`, `showOverlay("gameover")`.

### 렌더링
- `render()`:
  - 스코어 텍스트(`#score`, `#best-score`) 갱신.
  - `tile-container` 내부를 `state.tiles` 배열 기준으로 갱신: 기존 DOM에 해당 id의 `.tile`이 있으면 `style.transform`(또는 `left`/`top`)만 갱신(CSS transition으로 슬라이드 애니메이션), 없으면 새로 생성(`isNew`면 pop-in 애니메이션용 클래스 부여), 이번 턴에 제거된(병합되어 사라진) tile의 DOM은 애니메이션 종료 후 제거.
  - 타일 위치는 퍼센트 기반으로 계산: `left = col * (100 / GRID_SIZE)%`, `top = row * (100 / GRID_SIZE)%`, 크기도 `%` 단위 → 반응형 대응.
  - 값에 따라 `.tile` 클래스에 `tile-2`, `tile-4`, ... `tile-2048`, `tile-super`(4096 이상) 부여해 CSS에서 색상 매핑.

### 오버레이
- `showOverlay(type)`: `type`이 `"win"`이면 메시지 "You Win!" + 버튼["계속하기", "새 게임"], `"gameover"`이면 "Game Over" + 최종 점수 표시 + 버튼["다시 시도"]. `overlay` `hidden` 속성 제거.
- `hideOverlay()`: `hidden` 속성 다시 추가.
- "계속하기" 클릭 → `state.keepPlaying = true`, `hideOverlay()`.
- "새 게임"/"다시 시도" 클릭 → `initGame()`.

### 입력 처리
- 키보드: `document.addEventListener("keydown", handleKeydown)`.
  - `handleKeydown(e)`: `state.isBusy || state.isOver`면 무시(승리 후 `keepPlaying`이면 계속 입력 허용). 화살표 키 매핑(`ArrowUp/Down/Left/Right`, 추가로 `w/a/s/d` 지원 고려) → `e.preventDefault()`(페이지 스크롤 방지) → `move(direction)` 호출.
- 터치(모바일 스와이프): `board-wrap`에 `touchstart`/`touchend`(또는 `touchmove` + `touchend`) 리스너.
  - `handleTouchStart(e)`: 시작 좌표(`clientX`, `clientY`) 저장.
  - `handleTouchEnd(e)`: 종료 좌표와의 차이(`dx`, `dy`) 계산 → 최소 스와이프 임계값(예: 20px) 미만이면 무시 → `abs(dx) > abs(dy)`면 좌우, 아니면 상하로 판정 → 부호에 따라 방향 결정 → `move(direction)`.
  - `board-wrap`에서 `touchmove`는 `{ passive: false }`로 등록 후 `e.preventDefault()`하여 스와이프 중 페이지 스크롤/바운스 방지(게임 영역 내부에서만 적용, 페이지 전체에는 적용하지 않음).
- 새 게임 버튼(`#new-game-btn`): 클릭 시 `initGame()`.

## 5. UI/디자인 방향

- **레이아웃**: `.game-2048` 최대 너비 500px, 중앙 정렬(`margin: 0 auto`), 좌우 패딩 1rem. 보드는 정사각형 유지(`aspect-ratio: 1 / 1`), 화면이 좁으면 `width: min(92vw, 500px)`로 축소.
- **타일 색상**: 고전 2048 팔레트를 그대로 사용(친숙함/가독성 확보) — 보드 배경 `#bbada0` 계열, 빈 칸 `rgba(238,228,218,0.35)`, 값별 타일 색: 2=`#eee4da`, 4=`#ede0c8`, 8=`#f2b179`, 16=`#f59563`, 32=`#f67c5f`, 64=`#f65e3b`, 128=`#edcf72`, 256=`#edcc61`, 512=`#edc850`, 1024=`#edc53f`, 2048=`#edc22e`(약간의 box-shadow 강조), 4096 이상=`#3c3a32`(흰 텍스트). 텍스트 색은 8 미만 진한 갈색(`#776e65`), 8 이상 흰색.
- **다크 모드**: `@media (prefers-color-scheme: dark)`에서 body 배경과 `.game-2048` 외부 배경만 어둡게(`#1c1d22` 등) 조정하고, 보드/타일 팔레트는 거의 그대로 유지(2048 고유의 색이 정체성이므로 과도하게 바꾸지 않음). 스코어박스, 버튼, 힌트 텍스트 색상만 다크 배경에 어울리게 조정.
- **폰트**: 블로그와 통일감을 위해 시스템 폰트 스택 재사용(`-apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", Roboto, ...`). 숫자는 `font-weight: 700`, 타일 값 자릿수에 따라 `font-size`를 줄이는 처리(예: 4자리 이상이면 폰트 크기 축소 클래스 `.tile-long`).
- **반응형**: 배경 그리드는 `grid-template-columns: repeat(4, 1fr)` + `gap` 활용, 타일 레이어는 퍼센트 기반 absolute 포지셔닝이라 뷰포트 변화에 자동 대응. 640px 이하에서 타이틀/스코어박스 폰트 축소, 패딩 축소.
- **버튼**: "새 게임" 버튼은 보드 위 툴바에 상시 노출. 오버레이 내부 버튼("계속하기", "다시 시도")은 스코어박스와 통일된 accent 색상 사용.

## 6. 이벤트 흐름 요약

1. 페이지 로드 → `DOMContentLoaded` → `loadBestScore()` → `initGame()` → `render()`.
2. 사용자 입력(키보드/스와이프) → `move(direction)` → grid 갱신 → (변경 있으면) 랜덤 타일 추가 → 점수/최고점수 갱신 → 승리/게임오버 검사 → `render()` → 필요 시 오버레이 표시.
3. 오버레이 버튼 클릭 → `initGame()` 또는 `keepPlaying=true` 처리 후 `hideOverlay()`.
4. "새 게임" 버튼 클릭 → 언제든 `initGame()` 호출 가능(진행 중에도).

## 7. 향후 Review 단계에서 확인할 포인트 (참고용, Build 단계 범위 아님)
- 3연쇄 병합 버그(`[2,2,2,2]`, `[4,4,4,4]` 등 엣지 케이스) 검증.
- 스와이프 임계값이 실제 모바일 기기에서 오작동(의도치 않은 이동) 없는지.
- localStorage 미지원 환경(프라이빗 브라우징)에서 에러 없이 동작하는지.
- 키보드 포커스가 오버레이 버튼에 있을 때 화살표 키 입력이 버튼 포커스 이동과 충돌하지 않는지.
