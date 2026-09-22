(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 상수 & 상태
  // ---------------------------------------------------------------------

  const GRID_SIZE = 4;
  const WIN_VALUE = 2048;
  const STORAGE_BEST_KEY = "game2048BestScore";
  const SWIPE_THRESHOLD = 20; // px

  let state = {
    grid: [], // GRID_SIZE x GRID_SIZE, 각 셀은 null 또는 tile 객체
    tiles: [], // 현재 살아있는 tile 객체 배열
    score: 0,
    best: 0,
    isWon: false,
    isOver: false,
    keepPlaying: false,
    isBusy: false,
    nextTileId: 1,
  };

  // tile 객체: { id, value, row, col, isNew, isMerged, mergedFrom: [id, id] | null }

  // ---------------------------------------------------------------------
  // DOM 참조
  // ---------------------------------------------------------------------

  const scoreEl = document.getElementById("score");
  const bestScoreEl = document.getElementById("best-score");
  const tileContainer = document.getElementById("tile-container");
  const boardWrap = document.querySelector(".board-wrap");
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlay-message");
  const overlayActions = document.getElementById("overlay-actions");
  const newGameBtn = document.getElementById("new-game-btn");

  // ---------------------------------------------------------------------
  // localStorage
  // ---------------------------------------------------------------------

  function loadBestScore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_BEST_KEY);
      const parsed = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    } catch (err) {
      return 0;
    }
  }

  function saveBestScore(value) {
    try {
      window.localStorage.setItem(STORAGE_BEST_KEY, String(value));
    } catch (err) {
      // 프라이빗 모드 등 localStorage 사용 불가 환경 — 무시
    }
  }

  // ---------------------------------------------------------------------
  // 그리드/타일 유틸
  // ---------------------------------------------------------------------

  function createEmptyGrid() {
    const grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      grid.push(new Array(GRID_SIZE).fill(null));
    }
    return grid;
  }

  function getEmptyCells() {
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (state.grid[r][c] === null) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }

  function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length === 0) return null;

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const tile = {
      id: state.nextTileId++,
      value: value,
      row: row,
      col: col,
      isNew: true,
      isMerged: false,
      mergedFrom: null,
    };
    state.grid[row][col] = tile;
    state.tiles.push(tile);
    return tile;
  }

  // 이동 방향에 따라 한 "줄"(행 또는 열)을 이동 목적지 쪽부터 순서대로 뽑아온다.
  function getLine(direction, index) {
    const line = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      if (direction === "left") line.push(state.grid[index][i]);
      else if (direction === "right") line.push(state.grid[index][GRID_SIZE - 1 - i]);
      else if (direction === "up") line.push(state.grid[i][index]);
      else if (direction === "down") line.push(state.grid[GRID_SIZE - 1 - i][index]);
    }
    return line;
  }

  // slideAndMergeLeft 처리 결과(line)를 다시 grid 좌표계로 되돌려 쓰고, tile.row/col을 갱신한다.
  function setLine(direction, index, line) {
    for (let i = 0; i < GRID_SIZE; i++) {
      let row, col;
      if (direction === "left") {
        row = index;
        col = i;
      } else if (direction === "right") {
        row = index;
        col = GRID_SIZE - 1 - i;
      } else if (direction === "up") {
        row = i;
        col = index;
      } else if (direction === "down") {
        row = GRID_SIZE - 1 - i;
        col = index;
      }

      const tile = line[i];
      state.grid[row][col] = tile;
      if (tile) {
        tile.row = row;
        tile.col = col;
      }
    }
  }

  // 압축된(빈칸 제거) tile 배열 하나를 왼쪽으로 밀착시키고 병합한다.
  // 3연쇄 병합 방지: 한 번 병합에 참여한 tile은 같은 이동에서 다시 병합되지 않는다.
  function slideAndMergeLeft(line) {
    const compacted = line.filter((t) => t !== null);
    const result = [];
    let scoreGained = 0;

    let i = 0;
    while (i < compacted.length) {
      const current = compacted[i];
      const next = compacted[i + 1];

      if (next && next.value === current.value) {
        const mergedValue = current.value * 2;
        const survivor = {
          id: current.id,
          value: mergedValue,
          row: current.row,
          col: current.col,
          isNew: false,
          isMerged: true,
          mergedFrom: [current.id, next.id],
        };
        result.push(survivor);
        scoreGained += mergedValue;
        i += 2;
      } else {
        result.push({
          id: current.id,
          value: current.value,
          row: current.row,
          col: current.col,
          isNew: false,
          isMerged: false,
          mergedFrom: null,
        });
        i += 1;
      }
    }

    while (result.length < GRID_SIZE) result.push(null);
    return { line: result, scoreGained: scoreGained };
  }

  function snapshotIds() {
    return state.grid.map((row) => row.map((cell) => (cell ? cell.id : null)));
  }

  function idsEqual(a, b) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  // ---------------------------------------------------------------------
  // 이동 진입점
  // ---------------------------------------------------------------------

  function move(direction) {
    if (state.isBusy) return;
    if (state.isOver) return;
    if (state.isWon && !state.keepPlaying) return;

    const beforeIds = snapshotIds();
    let scoreGained = 0;

    for (let index = 0; index < GRID_SIZE; index++) {
      const line = getLine(direction, index);
      const { line: newLine, scoreGained: gained } = slideAndMergeLeft(line);
      setLine(direction, index, newLine);
      scoreGained += gained;
    }

    const afterIds = snapshotIds();
    const moved = !idsEqual(beforeIds, afterIds);

    if (!moved) {
      return;
    }

    // 살아있는 tile 목록 재구성 (병합되어 사라진 tile 제거)
    const aliveTiles = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (state.grid[r][c]) aliveTiles.push(state.grid[r][c]);
      }
    }
    state.tiles = aliveTiles;

    state.score += scoreGained;
    updateScore();

    addRandomTile();
    checkWin();
    checkGameOver();

    // 슬라이드/병합 애니메이션이 끝날 때까지 입력을 잠근다.
    state.isBusy = true;
    render();
    window.setTimeout(() => {
      state.isBusy = false;
    }, 120);
  }

  function updateScore() {
    if (state.score > state.best) {
      state.best = state.score;
      saveBestScore(state.best);
    }
  }

  // ---------------------------------------------------------------------
  // 승리 / 게임오버 판정
  // ---------------------------------------------------------------------

  function checkWin() {
    if (state.isWon) return;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = state.grid[r][c];
        if (cell && cell.value >= WIN_VALUE) {
          state.isWon = true;
          if (!state.keepPlaying) {
            showOverlay("win");
          }
          return;
        }
      }
    }
  }

  function checkGameOver() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) return;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const value = state.grid[r][c].value;
        const rightNeighbor = c < GRID_SIZE - 1 ? state.grid[r][c + 1] : null;
        const downNeighbor = r < GRID_SIZE - 1 ? state.grid[r + 1][c] : null;
        if (rightNeighbor && rightNeighbor.value === value) return;
        if (downNeighbor && downNeighbor.value === value) return;
      }
    }

    state.isOver = true;
    showOverlay("gameover");
  }

  // ---------------------------------------------------------------------
  // 렌더링
  // ---------------------------------------------------------------------

  function valueClass(value) {
    if (value > 2048) return "tile-super";
    return "tile-" + value;
  }

  function sizeClass(value) {
    const digits = String(value).length;
    if (digits >= 5) return "tile-longer";
    if (digits >= 4) return "tile-long";
    return "";
  }

  function positionTile(el, tile) {
    el.style.left = (tile.col * (100 / GRID_SIZE)) + "%";
    el.style.top = (tile.row * (100 / GRID_SIZE)) + "%";
  }

  function render() {
    scoreEl.textContent = String(state.score);
    bestScoreEl.textContent = String(state.best);

    const currentIds = new Set(state.tiles.map((t) => t.id));

    // 이번 이동에서 병합되어 사라지는 tile → 살아남은 tile 위치로 매핑
    const survivorForRemoved = {};
    state.tiles.forEach((tile) => {
      if (tile.mergedFrom) {
        tile.mergedFrom.forEach((removedId) => {
          if (removedId !== tile.id) {
            survivorForRemoved[removedId] = tile;
          }
        });
      }
    });

    // 더 이상 존재하지 않는 DOM 타일 처리 (병합되어 사라진 타일)
    Array.from(tileContainer.children).forEach((el) => {
      const id = Number(el.dataset.id);
      if (currentIds.has(id)) return;

      const survivor = survivorForRemoved[id];
      if (survivor) {
        positionTile(el, survivor);
      }
      window.setTimeout(() => {
        if (el.parentNode === tileContainer) {
          tileContainer.removeChild(el);
        }
      }, 120);
    });

    // 살아있는 tile들 렌더링
    state.tiles.forEach((tile) => {
      let el = tileContainer.querySelector('.tile[data-id="' + tile.id + '"]');

      if (!el) {
        el = document.createElement("div");
        el.className = "tile";
        el.dataset.id = String(tile.id);
        tileContainer.appendChild(el);
        positionTile(el, tile);
      }

      el.className = "tile " + valueClass(tile.value);
      const sc = sizeClass(tile.value);
      if (sc) el.classList.add(sc);
      el.textContent = String(tile.value);

      positionTile(el, tile);

      if (tile.isNew) {
        // 강제 리플로우 후 클래스 부여 → pop-in 애니메이션 재생
        void el.offsetWidth;
        el.classList.add("tile-new");
      } else if (tile.isMerged) {
        void el.offsetWidth;
        el.classList.add("tile-merged");
      }

      tile.isNew = false;
      tile.isMerged = false;
    });
  }

  // ---------------------------------------------------------------------
  // 오버레이
  // ---------------------------------------------------------------------

  function clearOverlayActions() {
    overlayActions.innerHTML = "";
  }

  function createOverlayButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function showOverlay(type) {
    clearOverlayActions();

    if (type === "win") {
      overlayMessage.textContent = "You Win!";
      overlayActions.appendChild(
        createOverlayButton("계속하기", () => {
          state.keepPlaying = true;
          hideOverlay();
        })
      );
      overlayActions.appendChild(createOverlayButton("새 게임", initGame));
    } else if (type === "gameover") {
      overlayMessage.textContent = "Game Over — 최종 점수 " + state.score;
      overlayActions.appendChild(createOverlayButton("다시 시도", initGame));
    }

    overlay.hidden = false;
  }

  function hideOverlay() {
    overlay.hidden = true;
  }

  // ---------------------------------------------------------------------
  // 초기화
  // ---------------------------------------------------------------------

  function initGame() {
    state.grid = createEmptyGrid();
    state.tiles = [];
    state.score = 0;
    state.isWon = false;
    state.isOver = false;
    state.keepPlaying = false;
    state.isBusy = false;

    tileContainer.innerHTML = "";
    hideOverlay();

    addRandomTile();
    addRandomTile();

    updateScore();
    render();
  }

  // ---------------------------------------------------------------------
  // 입력 처리 — 키보드
  // ---------------------------------------------------------------------

  const KEY_DIRECTIONS = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right",
  };

  function handleKeydown(e) {
    const direction = KEY_DIRECTIONS[e.key];
    if (!direction) return;

    if (state.isBusy) return;
    if (state.isOver) return;
    if (state.isWon && !state.keepPlaying) return;

    e.preventDefault();
    move(direction);
  }

  // ---------------------------------------------------------------------
  // 입력 처리 — 터치 스와이프
  // ---------------------------------------------------------------------

  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchActive = true;
  }

  function handleTouchMove(e) {
    if (!touchActive) return;
    e.preventDefault();
  }

  function handleTouchEnd(e) {
    if (!touchActive) return;
    touchActive = false;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    let direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? "right" : "left";
    } else {
      direction = dy > 0 ? "down" : "up";
    }

    if (state.isBusy) return;
    if (state.isOver) return;
    if (state.isWon && !state.keepPlaying) return;

    move(direction);
  }

  // ---------------------------------------------------------------------
  // 이벤트 바인딩 & 시작
  // ---------------------------------------------------------------------

  document.addEventListener("keydown", handleKeydown);
  newGameBtn.addEventListener("click", initGame);

  boardWrap.addEventListener("touchstart", handleTouchStart, { passive: true });
  boardWrap.addEventListener("touchmove", handleTouchMove, { passive: false });
  boardWrap.addEventListener("touchend", handleTouchEnd, { passive: true });

  function start() {
    state.best = loadBestScore();
    initGame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    // script.js가 body 하단에서 동기 로드되는 시점에는 대개 DOMContentLoaded가
    // 아직 발생 전이지만, 혹시 이미 지나간 경우(readyState !== "loading")를 대비.
    start();
  }
})();
