// 픽셀 아트 에디터 — 상태 관리 + 렌더링 + 입력 처리 (순수 JS, 외부 라이브러리 없음)

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
  lastPaintedIndex: -1, // 같은 드래그 동작 중 중복 페인트/렌더 방지용
  cellSize: 0           // resizeCanvas()가 채움: 캔버스 내부 픽셀 기준 1칸 크기
};

// 실행취소(undo)는 이번 Build 범위에 포함하지 않는다.
// 추후 필요하면 state.history 배열에 pixels 배열의 스냅샷을 push하는
// 단순 스택 방식으로 추가할 수 있다 (이번 범위에서는 구현하지 않음).

let canvas;
let ctx;

function initEditor() {
  canvas = document.getElementById("pixel-canvas");
  ctx = canvas.getContext("2d");

  state.pixels.fill(null);

  buildPalette();
  attachEventListeners();
  resizeCanvas(); // 내부에서 render()까지 수행
}

function buildPalette() {
  const container = document.getElementById("palette-swatches");
  container.innerHTML = "";

  PALETTE.forEach((hex, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch";
    if (i === 0) btn.classList.add("active");
    btn.style.background = hex;
    btn.dataset.color = hex;
    btn.setAttribute("aria-label", hex);
    btn.addEventListener("click", () => selectColor(hex));
    container.appendChild(btn);
  });
}

function attachEventListeners() {
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  document.getElementById("tool-brush").addEventListener("click", () => selectTool("brush"));
  document.getElementById("tool-eraser").addEventListener("click", () => selectTool("eraser"));

  document.getElementById("clear-btn").addEventListener("click", clearAll);
  document.getElementById("save-btn").addEventListener("click", exportPNG);

  document.getElementById("custom-color").addEventListener("input", (e) => {
    selectColor(e.target.value, { fromCustom: true });
  });

  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const displaySize = rect.width; // canvas-wrap은 정사각형이므로 width == height
  const dpr = window.devicePixelRatio || 1;

  const pixelSize = Math.round(displaySize * dpr);
  canvas.width = pixelSize;
  canvas.height = pixelSize;
  canvas.style.width = displaySize + "px";
  canvas.style.height = displaySize + "px";

  state.cellSize = canvas.width / GRID_SIZE;

  render();
}

function getCellFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor((x / rect.width) * GRID_SIZE);
  const row = Math.floor((y / rect.height) * GRID_SIZE);

  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return null;
  }

  return { row, col };
}

function paintCell(row, col) {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;

  const index = row * GRID_SIZE + col;

  if (index === state.lastPaintedIndex) return;

  if (state.tool === "eraser") {
    state.pixels[index] = null;
  } else {
    state.pixels[index] = state.currentColor;
  }

  state.lastPaintedIndex = index;
  render();
}

function handlePointerDown(e) {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  state.isPointerDown = true;
  state.lastPaintedIndex = -1;
  const cell = getCellFromEvent(e);
  if (cell) paintCell(cell.row, cell.col);
}

function handlePointerMove(e) {
  if (!state.isPointerDown) return;
  const cell = getCellFromEvent(e);
  if (cell) paintCell(cell.row, cell.col);
}

function handlePointerUp() {
  state.isPointerDown = false;
  state.lastPaintedIndex = -1;
}

function selectColor(hex, options) {
  const fromCustom = options && options.fromCustom;

  state.currentColor = hex;
  state.tool = "brush";

  const swatches = document.querySelectorAll(".swatch");
  swatches.forEach((sw) => {
    if (!fromCustom && sw.dataset.color === hex) {
      sw.classList.add("active");
    } else {
      sw.classList.remove("active");
    }
  });

  document.getElementById("tool-brush").classList.add("active");
  document.getElementById("tool-eraser").classList.remove("active");
}

function selectTool(tool) {
  state.tool = tool;

  const brushBtn = document.getElementById("tool-brush");
  const eraserBtn = document.getElementById("tool-eraser");

  if (tool === "brush") {
    brushBtn.classList.add("active");
    eraserBtn.classList.remove("active");
  } else {
    eraserBtn.classList.add("active");
    brushBtn.classList.remove("active");
  }
}

function clearAll() {
  state.pixels.fill(null);
  render();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cellSize = state.cellSize;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const index = row * GRID_SIZE + col;
      const value = state.pixels[index];

      if (value === null) {
        ctx.fillStyle = (row + col) % 2 === 0 ? CHECKER_LIGHT : CHECKER_DARK;
      } else {
        ctx.fillStyle = value;
      }

      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }

  // 옅은 그리드 안내선 (편집용 캔버스에만; 저장용 오프스크린 캔버스에는 그리지 않음)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = Math.round(i * cellSize) + 0.5;

    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function exportPNG() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = GRID_SIZE * EXPORT_SCALE;
  exportCanvas.height = GRID_SIZE * EXPORT_SCALE;
  const exportCtx = exportCanvas.getContext("2d");

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = state.pixels[row * GRID_SIZE + col];
      if (value === null) continue; // 투명 유지 (오프스크린 캔버스는 기본 알파 0)
      exportCtx.fillStyle = value;
      exportCtx.fillRect(col * EXPORT_SCALE, row * EXPORT_SCALE, EXPORT_SCALE, EXPORT_SCALE);
    }
  }

  const dataUrl = exportCanvas.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "pixel-art.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

document.addEventListener("DOMContentLoaded", initEditor);
