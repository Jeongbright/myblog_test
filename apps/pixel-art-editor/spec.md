# 픽셀 아트 에디터 — 구현 스펙 (Build 단계 지침)

## 0. 개요 및 핵심 설계 결정

- 16x16 격자에 클릭/드래그/터치로 색을 칠하는 픽셀 아트 도구. 완성 후 PNG로 저장.
- **렌더링 방식: `<canvas>` 단일 요소로 표시와 데이터 소스를 겸한다.** (DOM 16x16 격자 방식은 채택하지 않음)
  - 이유: 16x16 `<div>` 격자와 별도의 canvas 데이터를 이중 관리하면 동기화 버그 위험이 있음. 처음부터 canvas 하나로 그리기·표시·저장을 모두 처리하면 데이터 소스가 하나로 단순해지고 버그가 적다.
  - 내부 상태는 순수 JS 배열(`state.pixels`, 16x16)로 관리하고, canvas는 이 배열을 매번 다시 그리는 "뷰"로만 취급한다(즉시 모드 렌더링, 단방향 데이터 흐름).
- **드래그로 연속 칠하기: 지원한다.** 마우스 down 상태에서 이동, 터치 이동 모두 포함. Pointer Events API(`pointerdown`/`pointermove`/`pointerup`/`pointercancel`) 하나로 마우스/터치/펜을 통합 처리한다(마우스와 터치를 따로 구현하지 않아 코드가 단순해지고 버그가 적음).
- **색상 팔레트: 미리 정의된 24색 스와치 + `<input type="color">` 커스텀 색상 모두 지원.**
- **지우개: 셀 값을 `null`(투명)로 되돌리는 별도 도구.** 투명 셀은 편집 중 체크보드 패턴으로 표시하고, PNG로 저장 시 실제 알파 0(완전 투명)으로 저장한다.
- **PNG 저장: 16x16 원본이 아니라 16배 확대한 256x256으로 저장한다.**
  - 이유: 16x16 그대로 저장하면 이미지 뷰어/공유 시 너무 작고, 브라우저마다 기본 배율로 흐릿하게 보일 수 있음. 정수 배율(16배) 확대 후 `fillRect`로 사각형을 그리면 자동으로 계단 현상 없이 선명하게 픽셀아트 특유의 또렷한 사각 픽셀이 유지된다.
  - 저장용 캔버스는 화면 표시용 캔버스와 별개의 오프스크린 `<canvas>`를 그때그때 생성해서 사용(화면 표시 캔버스의 그리드 안내선이 저장 파일에 섞이지 않도록 분리).
- **실행취소(undo): 이번 범위에 포함하지 않는다.** (추후 원한다면 `history` 배열에 `pixels` 배열의 스냅샷을 push하는 단순 스택 방식으로 추가 가능하다고 주석으로만 남겨둘 것. 이번 Build 범위에서는 구현하지 않음.)

## 1. 파일 구조

```
apps/pixel-art-editor/
├── index.html   — 마크업 (캔버스, 팔레트, 도구 버튼, 안내 텍스트)
├── style.css    — 전체 스타일 (독립적, 블로그 CSS에 의존하지 않음)
└── script.js    — 상태 관리 + 렌더링 + 입력 처리 (프레임워크 없이 순수 JS)
```

- 외부 라이브러리/CDN 사용하지 않음 (PNG 저장은 Canvas API만으로 충분).
- `index.html`은 `style.css`, `script.js`만 로드. 블로그의 `css/style.css`, `js/*.js`는 참조하지 않음(완전 독립, iframe 임베드 가능하게).
- 다크/라이트는 `prefers-color-scheme` 미디어쿼리로만 대응 (2048과 동일한 원칙 — 블로그의 테마 토글/로컬스토리지 로직은 가져오지 않음).

## 2. index.html DOM 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>픽셀 아트 에디터</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="pixel-editor">
    <header class="editor-header">
      <h1 class="editor-title">픽셀 아트 에디터</h1>
      <p class="editor-hint">칸을 클릭하거나 드래그해서 색을 칠하세요. 16 × 16 캔버스.</p>
    </header>

    <main class="editor-main">
      <div class="canvas-wrap">
        <canvas id="pixel-canvas" class="pixel-canvas" width="512" height="512"></canvas>
      </div>

      <div class="editor-controls">
        <section class="tool-group" aria-label="도구">
          <button id="tool-brush" class="tool-btn active" data-tool="brush" type="button">브러시</button>
          <button id="tool-eraser" class="tool-btn" data-tool="eraser" type="button">지우개</button>
        </section>

        <section class="palette-group" aria-label="색상 팔레트">
          <div class="palette-swatches" id="palette-swatches">
            <!-- script.js가 PALETTE 배열을 기반으로 .swatch 버튼 24개를 생성 -->
          </div>
          <label class="custom-color-label">
            커스텀 색상
            <input type="color" id="custom-color" value="#000000" />
          </label>
        </section>

        <section class="action-group" aria-label="동작">
          <button id="clear-btn" class="btn-secondary" type="button">전체 지우기</button>
          <button id="save-btn" class="btn-primary" type="button">PNG로 저장</button>
        </section>
      </div>
    </main>

    <footer class="editor-footer">
      <a href="../../index.html">← 블로그로 돌아가기</a>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>
```

- `#pixel-canvas`의 `width`/`height` 속성(512x512)은 초기값이며, `script.js`의 `resizeCanvas()`가 실제 표시 크기와 `devicePixelRatio`에 맞춰 다시 계산해 덮어쓴다(§5 참고). 마크업의 512는 JS 비활성 환경에서의 폴백일 뿐.
- `palette-swatches`는 정적 마크업 없이 JS가 `PALETTE` 배열을 순회하며 버튼을 생성한다(색상 목록을 배열 하나로 관리 → 나중에 팔레트 변경이 쉬움).
- 도구 버튼(`.tool-btn`)과 스와치 버튼(`.swatch`) 모두 `active` 클래스로 현재 선택 상태를 표시.

## 3. 상태(state) 구조 (script.js)

```js
const GRID_SIZE = 16;
const EXPORT_SCALE = 16; // 16x16 -> 256x256 PNG로 저장
const CHECKER_LIGHT = "#e8e8e8";
const CHECKER_DARK = "#c8c8c8";

const PALETTE = [
  "#000000", "#ffffff", "#7a7a7a", "#c3c3c3",
  "#7c1f1f", "#e5342a", "#f0803c", "#f7d51d",
  "#8fce46", "#1e9e4a", "#1c8a7a", "#2fb6c4",
  "#1c6fd6", "#1a3fa0", "#6a3fc4", "#b13fc4",
  "#e05a9e", "#f4a6c9", "#8a5a2c", "#c98a4b",
  "#f2c9a0", "#556080", "#2e3440", "#dfe4ea"
]; // 정확히 24개 hex 문자열

let state = {
  pixels: new Array(GRID_SIZE * GRID_SIZE).fill(null), // index = row * GRID_SIZE + col, 값: "#rrggbb" 또는 null(투명)
  currentColor: "#000000",
  tool: "brush",        // "brush" | "eraser"
  isPointerDown: false,
  lastPaintedIndex: -1,  // 같은 드래그 동작 중 중복 페인트/렌더 방지용
  cellSize: 0            // resizeCanvas()가 채움: 캔버스 내부 픽셀 기준 1칸 크기
};
```

- `pixels` 배열의 인덱스는 `row * GRID_SIZE + col`로 계산(2차원 배열 대신 1차원 사용 — 순회/초기화가 단순함).
- `PALETTE`는 정확히 24개 hex 문자열이어야 한다 (무채색 4단계 + 유채색 18개 + 여유 톤 2개 구성 예시).

## 4. 핵심 함수 목록과 동작

### 초기화
- `initEditor()`: `state.pixels`를 전부 `null`로 리셋, 팔레트 스와치 DOM 생성(`buildPalette()`), 이벤트 리스너 등록, `resizeCanvas()` 호출(내부에서 `render()`까지 수행).
- `buildPalette()`: `PALETTE` 배열을 순회하며 `#palette-swatches`에 `<button class="swatch" style="background:{hex}">` 24개 생성, 각 버튼에 `data-color` 속성과 클릭 핸들러(`selectColor(hex)`) 부여. 첫 번째 스와치(검정)에 `active` 클래스 부여해 초기 선택 표시.

### 캔버스 크기 계산
- `resizeCanvas()`:
  - CSS로 계산된 `canvas-wrap`의 표시 크기(정사각형, 예: `min(90vw, 480px)`)를 `getBoundingClientRect()`로 읽는다.
  - `devicePixelRatio`를 반영해 `canvas.width = canvas.height = displaySize * devicePixelRatio` (내부 해상도), CSS에서는 `canvas.style.width/height = displaySize + "px"`로 고정(레티나 대응, 흐릿함 방지).
  - `state.cellSize = canvas.width / GRID_SIZE` 갱신.
  - `render()` 호출.
  - `window.addEventListener("resize", resizeCanvas)` (디바운스 없이 단순 호출로 충분 — 격자 수가 작아 비용 낮음).

### 좌표 변환
- `getCellFromEvent(e)`:
  - `canvas.getBoundingClientRect()`로 캔버스의 화면상 위치/크기를 구함.
  - `e.clientX/clientY`(Pointer Event는 마우스/터치 공통으로 이 속성 제공)에서 캔버스 좌상단을 뺀 뒤, 캔버스의 "CSS 표시 크기" 대비 비율로 `col = floor((clientX - rect.left) / rect.width * GRID_SIZE)`, `row`도 동일하게 계산.
  - `row`/`col`이 `0 ~ GRID_SIZE-1` 범위를 벗어나면 `null` 반환(캔버스 경계 밖 드래그 시 안전 처리).

### 페인팅
- `paintCell(row, col)`:
  - 범위 벗어나면 무시.
  - `index = row * GRID_SIZE + col`.
  - `tool === "eraser"`이면 `state.pixels[index] = null`, 아니면 `state.pixels[index] = state.currentColor`.
  - `index === state.lastPaintedIndex`이면 다시 그리지 않고 반환(같은 칸 위에서 pointermove가 여러 번 발생하는 것 방지).
  - `state.lastPaintedIndex = index`.
  - `render()` 호출 (16x16=256칸 수준에서는 전체 재렌더도 성능 문제 없으므로 구현 단순성을 위해 부분 렌더가 아닌 `render()` 전체 재호출 방식을 채택한다).

### 입력 처리 (Pointer Events)
- `canvas.addEventListener("pointerdown", handlePointerDown)`
  - `handlePointerDown(e)`: `e.preventDefault()`, `canvas.setPointerCapture(e.pointerId)`(포인터가 캔버스 밖으로 나가도 move/up 이벤트를 계속 받기 위함), `state.isPointerDown = true`, `state.lastPaintedIndex = -1`, `const cell = getCellFromEvent(e)`, `cell`이 유효하면 `paintCell(cell.row, cell.col)`.
- `canvas.addEventListener("pointermove", handlePointerMove)`
  - `handlePointerMove(e)`: `if (!state.isPointerDown) return;` `const cell = getCellFromEvent(e); if (cell) paintCell(cell.row, cell.col);`
- `canvas.addEventListener("pointerup", handlePointerUp)` / `pointercancel` 동일 핸들러 연결
  - `handlePointerUp()`: `state.isPointerDown = false; state.lastPaintedIndex = -1;`
- CSS에서 `#pixel-canvas { touch-action: none; }` 필수 지정 — 캔버스 위에서 손가락으로 드래그할 때 페이지 스크롤/줌 대신 그리기 동작만 일어나게 함(캔버스 바깥에서는 평소처럼 스크롤 가능해야 하므로 `touch-action: none`은 캔버스 요소에만 적용, `body` 전체에는 적용하지 않음).

### 색상/도구 선택
- `selectColor(hex)`: `state.currentColor = hex`, `state.tool = "brush"`, 팔레트 스와치들의 `active` 클래스 갱신(클릭된 것만 부여), `#tool-brush`에 `active` 클래스 부여하고 `#tool-eraser`에서 제거.
- 커스텀 컬러 `input[type=color]`의 `input` 이벤트(드래그 중에도 실시간 반영되도록 `change`가 아닌 `input` 이벤트 사용) → `selectColor(e.target.value)`. 이 경우 팔레트 스와치 중 어떤 것도 `active`로 표시하지 않아도 됨.
- `#tool-brush` 클릭 → `state.tool = "brush"`, 버튼 active 토글.
- `#tool-eraser` 클릭 → `state.tool = "eraser"`, 버튼 active 토글(이 상태에서도 팔레트 스와치의 active 표시는 유지하되, 실제 칠하는 동작은 지우개로 동작).

### 전체 지우기
- `#clear-btn` 클릭 → `clearAll()`: `state.pixels.fill(null)`, `render()`. 되돌릴 수 없는 작업이지만 간단한 도구 특성상 확인창 없이 즉시 실행한다.

### 렌더링
- `render()`:
  - `ctx.clearRect(0, 0, canvas.width, canvas.height)`.
  - 16x16 전체 순회하며 각 셀에 대해:
    - 값이 `null`이면 체크보드 패턴 한 칸 그리기: `(row+col) % 2 === 0 ? CHECKER_LIGHT : CHECKER_DARK`로 `fillRect`.
    - 값이 색상 문자열이면 그 색으로 `fillRect`.
  - 그 위에 옅은 그리드 안내선(예: `rgba(0,0,0,0.08)`, 1px)을 16x16 격자로 그려서 칸 구분을 시각적으로 보조(단, 이 안내선은 **편집용 캔버스에만** 그리고, PNG 저장용 오프스크린 캔버스에는 그리지 않는다).
  - 셀 하나 크기: `state.cellSize`(=`canvas.width / GRID_SIZE`)를 사용해 `fillRect(col * cellSize, row * cellSize, cellSize, cellSize)`.

### PNG 저장
- `#save-btn` 클릭 → `exportPNG()`:
  1. `const exportCanvas = document.createElement("canvas")`, `exportCanvas.width = exportCanvas.height = GRID_SIZE * EXPORT_SCALE` (16 * 16 = 256).
  2. `const exportCtx = exportCanvas.getContext("2d")`.
  3. 16x16 순회: 값이 `null`이면 아무것도 그리지 않음(오프스크린 캔버스는 기본적으로 완전 투명이므로 skip) → 저장 결과에서 진짜 알파 0 투명으로 남음. 값이 색상이면 `exportCtx.fillStyle = color; exportCtx.fillRect(col * EXPORT_SCALE, row * EXPORT_SCALE, EXPORT_SCALE, EXPORT_SCALE)`.
  4. 그리드 안내선은 그리지 않는다(저장 결과는 순수 픽셀 색상만).
  5. `const dataUrl = exportCanvas.toDataURL("image/png")`.
  6. 동적으로 `<a>` 생성: `a.href = dataUrl; a.download = "pixel-art.png"; document.body.appendChild(a); a.click(); a.remove();`

## 5. UI/디자인 방향

- **레이아웃**: `.pixel-editor` 최대 너비 640px, 중앙 정렬(`margin: 0 auto`), 좌우 패딩 1rem. 데스크톱에서는 캔버스(좌)와 컨트롤 패널(우)을 `.editor-main { display: flex; gap: 1.5rem; }`로 나란히 배치, 768px 이하에서는 `flex-direction: column`으로 세로 배치(캔버스가 위, 컨트롤이 아래).
- **캔버스 크기**: `.canvas-wrap`은 정사각형 유지(`aspect-ratio: 1 / 1`), `width: min(90vw, 480px)`. `#pixel-canvas`는 `width: 100%; height: 100%; display: block;`로 wrap을 꽉 채움. `image-rendering: pixelated;` 지정 권장(직접 `fillRect`로 그려 이미 선명하지만 브라우저 확대/축소 시 안전).
- **색상 팔레트**: `.palette-swatches`는 `display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.4rem;` (24색 → 6열 x 4행). 각 스와치는 정사각형 버튼(`aspect-ratio: 1/1`, `border-radius: 4px`), 선택된 스와치는 `outline: 2px solid` 강조 + 살짝 확대(`transform: scale(1.1)`).
- **도구/동작 버튼**: 브러시/지우개 버튼은 토글 형태(`.active` 클래스로 배경색 강조), "전체 지우기"는 중립색 버튼(`.btn-secondary`), "PNG로 저장"은 강조색 버튼(`.btn-primary`)으로 시각적 우선순위 부여.
- **색상 톤**: 블로그 톤과 크게 어긋나지 않는 중립 배경(연한 회색/화이트, 다크모드에서는 짙은 회색)을 사용하되, 팔레트 스와치 자체의 색은 원색 그대로 유지(도구 특성상 선명한 색상 구분이 더 중요).
- **다크 모드**: `@media (prefers-color-scheme: dark)`에서 `.pixel-editor` 배경, 텍스트, 버튼 배경만 어둡게 조정. 캔버스 내부의 체크보드 패턴 색은 다크모드에서도 고정(투명 표시 기준을 일관되게 유지).
- **폰트**: 2048과 동일하게 시스템 폰트 스택(`-apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", Roboto, ...`) 재사용.
- **반응형/모바일**: 캔버스는 `touch-action: none`으로 드래그 시 스크롤 방지. 컨트롤 패널의 버튼들은 터치하기 충분한 크기(최소 `44px` 높이) 확보. 640px 이하에서는 팔레트 그리드 열 수를 6 → 5 또는 4로 줄여도 됨(스와치 크기 확보).

## 6. 이벤트 흐름 요약

1. 페이지 로드 → `DOMContentLoaded` → `initEditor()` → `buildPalette()` → `resizeCanvas()`(내부에서 `render()`) → 초기 화면(전체 투명 체크보드) 표시.
2. 사용자가 팔레트 스와치 또는 커스텀 컬러 선택 → `selectColor(hex)` → `state.currentColor` 갱신, UI 강조만 갱신(캔버스 재렌더 불필요).
3. 사용자가 도구 버튼(브러시/지우개) 클릭 → `state.tool` 갱신, UI 강조 갱신.
4. 사용자가 캔버스에서 `pointerdown` → `handlePointerDown` → 좌표 계산 → `paintCell` → `render()`.
5. `pointerdown` 상태 유지 중 `pointermove` → 매 이동마다 좌표 재계산 → 이전과 다른 셀이면 `paintCell` → `render()` (드래그로 연속 칠하기).
6. `pointerup`/`pointercancel` → 페인팅 종료 플래그 해제.
7. "전체 지우기" 클릭 → `clearAll()` → `state.pixels` 전부 `null` → `render()`.
8. "PNG로 저장" 클릭 → `exportPNG()` → 오프스크린 256x256 캔버스에 순수 픽셀만 그림 → `toDataURL` → 임시 `<a download>` 클릭으로 다운로드 트리거(화면의 편집 캔버스는 변경되지 않음).
9. `window.resize` 이벤트 → `resizeCanvas()` → 캔버스 내부 해상도/셀 크기 재계산 → `render()`.

## 7. 향후 Review 단계에서 확인할 포인트 (참고용, Build 단계 범위 아님)

- 모바일 실기기(iOS Safari, Android Chrome)에서 `pointerdown`/`pointermove`가 정상 동작하는지, 드래그 중 페이지 스크롤이 발생하지 않는지(`touch-action: none` 적용 확인).
- 캔버스 리사이즈(창 크기 변경, 모바일 회전) 시 좌표 계산이 어긋나지 않는지 (`getCellFromEvent`가 `rect.width`/`rect.height` 기준으로 정확히 매핑되는지).
- 레티나(고DPI) 디스플레이에서 선이 흐릿하지 않은지(`devicePixelRatio` 반영 확인).
- PNG 저장 결과가 실제로 256x256이고, 투명 칠했던 칸이 알파 0으로 저장되는지(이미지 뷰어에서 확인).
- 빠른 드래그 시(`pointermove` 이벤트가 듬성듬성 발생) 칸이 건너뛰어져 빈 틈이 생기는 문제 여부 — 필요하면 이전 칠한 좌표와 현재 좌표 사이를 보간(직선 보간)해 채우는 개선을 제안할 수 있음(이번 Build 범위는 아님, Review에서 이슈로만 기록).
- 팔레트 24색 hex 값이 서로 시각적으로 충분히 구분되는지, 커스텀 컬러 선택 후 지우개로 전환했다가 다시 브러시로 돌아왔을 때 마지막 선택 색이 유지되는지.
