// 深海探検 - SVGスプライト版

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const minimap = document.getElementById('minimap');
const minimapCtx = minimap.getContext('2d');

// 探索済みマス
const explored = new Set();

const depthEl = document.getElementById('depth');
const depthFill = document.getElementById('depthFill');
const timeEl = document.getElementById('time');
const yearEl = document.getElementById('year');
const remainingEl = document.getElementById('remaining');
const dateDisplay = document.getElementById('dateDisplay');
const coordsEl = document.getElementById('coords');
const discoveredEl = document.getElementById('discovered');

// マップサイズ
const MAP_W = 128;
const MAP_H = 128;
const SPRITE_SIZE = 16;  // 元のスプライトサイズ
const TILE_SIZE = 32;    // 描画サイズ（2倍）

// 画面に表示するタイル数
const VIEW_W = 20;
const VIEW_H = 15;

// Canvas サイズ
canvas.width = VIEW_W * TILE_SIZE;
canvas.height = VIEW_H * TILE_SIZE;

// タイルタイプ
const TILE = {
  EMPTY: 0,
  TIME_FRAGMENT: 1,
  TIME_DISCOVERED: 2,
  RUIN: 3,
  VENT: 4,
  CREATURE: 5,
  ABYSS: 6,
  STRUCTURE: 7,
  WALL: 8,
  OBSERVER: 9,
  GHOST: 10,
  TIME_FORGOTTEN: 11
};

// SVGスプライト定義
const SPRITE_SVGS = {
  [TILE.EMPTY]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" fill="#030810"/>
      <circle cx="8" cy="8" r="0.5" fill="#0a1520" opacity="0.5"/>
    </svg>
  `,
  [TILE.TIME_FRAGMENT]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <linearGradient id="tfg" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#ff88ff"/>
          <stop offset="100%" stop-color="#aa0066"/>
        </linearGradient>
        <filter id="tglow">
          <feGaussianBlur stdDeviation="1" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- 十字架 -->
      <rect x="6" y="2" width="4" height="12" fill="url(#tfg)" filter="url(#tglow)"/>
      <rect x="3" y="5" width="10" height="3" fill="url(#tfg)" filter="url(#tglow)"/>
      <!-- ハイライト -->
      <rect x="7" y="3" width="2" height="10" fill="#ffaaff" opacity="0.5"/>
      <rect x="4" y="6" width="8" height="1" fill="#ffaaff" opacity="0.5"/>
    </svg>
  `,
  [TILE.TIME_DISCOVERED]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <linearGradient id="tdg" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#88ffff"/>
          <stop offset="100%" stop-color="#004466"/>
        </linearGradient>
        <filter id="dglow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- 発見済み十字架 -->
      <rect x="6" y="2" width="4" height="12" fill="none" stroke="url(#tdg)" stroke-width="1" filter="url(#dglow)"/>
      <rect x="3" y="5" width="10" height="3" fill="none" stroke="url(#tdg)" stroke-width="1" filter="url(#dglow)"/>
      <!-- 中心の光 -->
      <circle cx="8" cy="7" r="2" fill="#00ffff" opacity="0.4"/>
    </svg>
  `,
  [TILE.RUIN]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5a4a3a"/>
          <stop offset="100%" stop-color="#3a2a1a"/>
        </linearGradient>
      </defs>
      <rect x="2" y="8" width="3" height="7" fill="url(#rg)"/>
      <rect x="6" y="5" width="4" height="10" fill="url(#rg)"/>
      <rect x="11" y="10" width="3" height="5" fill="url(#rg)"/>
      <rect x="5" y="3" width="6" height="2" fill="#4a3a2a"/>
      <circle cx="8" cy="9" r="1" fill="#2a1a0a"/>
    </svg>
  `,
  [TILE.VENT]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <radialGradient id="vg" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stop-color="#ff6600"/>
          <stop offset="50%" stop-color="#aa3300"/>
          <stop offset="100%" stop-color="#441100"/>
        </radialGradient>
        <filter id="vglow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="8" cy="13" rx="6" ry="3" fill="#2a1a0a"/>
      <ellipse cx="8" cy="12" rx="4" ry="2" fill="url(#vg)" filter="url(#vglow)"/>
      <path d="M6,10 Q5,6 7,3 Q8,5 8,8" fill="none" stroke="#ff8844" stroke-width="1" opacity="0.7"/>
      <path d="M10,10 Q11,5 9,2 Q8,4 9,9" fill="none" stroke="#ffaa66" stroke-width="1" opacity="0.6"/>
      <circle cx="7" cy="5" r="1" fill="#ffcc88" opacity="0.5"/>
    </svg>
  `,
  [TILE.CREATURE]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00ffaa"/>
          <stop offset="100%" stop-color="#006644"/>
        </radialGradient>
        <filter id="cglow">
          <feGaussianBlur stdDeviation="0.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="8" cy="9" rx="5" ry="4" fill="url(#cg)" filter="url(#cglow)"/>
      <circle cx="5" cy="8" r="1.5" fill="#001a11"/>
      <circle cx="5" cy="8" r="0.8" fill="#00ffaa"/>
      <circle cx="11" cy="8" r="1.5" fill="#001a11"/>
      <circle cx="11" cy="8" r="0.8" fill="#00ffaa"/>
      <path d="M1,7 Q3,9 4,7" fill="none" stroke="#00aa66" stroke-width="1"/>
      <path d="M12,7 Q13,9 15,7" fill="none" stroke="#00aa66" stroke-width="1"/>
      <ellipse cx="8" cy="12" rx="2" ry="1" fill="#004422"/>
    </svg>
  `,
  [TILE.ABYSS]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <radialGradient id="ag" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000"/>
          <stop offset="70%" stop-color="#000000"/>
          <stop offset="100%" stop-color="#0a0515"/>
        </radialGradient>
      </defs>
      <circle cx="8" cy="8" r="7" fill="url(#ag)"/>
      <circle cx="8" cy="8" r="5" fill="#000000"/>
      <ellipse cx="8" cy="8" rx="7" ry="3" fill="none" stroke="#1a0a2a" stroke-width="0.5" opacity="0.5"/>
    </svg>
  `,
  [TILE.STRUCTURE]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0088aa"/>
          <stop offset="100%" stop-color="#004466"/>
        </linearGradient>
        <filter id="sglow">
          <feGaussianBlur stdDeviation="0.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polygon points="8,1 14,6 14,14 2,14 2,6" fill="url(#sg)" filter="url(#sglow)"/>
      <rect x="6" y="9" width="4" height="5" fill="#001a22"/>
      <circle cx="8" cy="5" r="1.5" fill="#00ffff" opacity="0.6"/>
      <line x1="2" y1="6" x2="8" y2="1" stroke="#00aacc" stroke-width="0.5"/>
      <line x1="14" y1="6" x2="8" y2="1" stroke="#00aacc" stroke-width="0.5"/>
    </svg>
  `,
  [TILE.WALL]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a3a4a"/>
          <stop offset="50%" stop-color="#1a2a3a"/>
          <stop offset="100%" stop-color="#0a1a2a"/>
        </linearGradient>
      </defs>
      <rect width="16" height="16" fill="url(#wg)"/>
      <rect x="1" y="1" width="6" height="6" fill="#1a2a3a" stroke="#0a1520" stroke-width="0.5"/>
      <rect x="8" y="1" width="7" height="6" fill="#2a3a4a" stroke="#0a1520" stroke-width="0.5"/>
      <rect x="1" y="8" width="7" height="7" fill="#2a3a4a" stroke="#0a1520" stroke-width="0.5"/>
      <rect x="9" y="8" width="6" height="7" fill="#1a2a3a" stroke="#0a1520" stroke-width="0.5"/>
    </svg>
  `,
  [TILE.OBSERVER]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <radialGradient id="og" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#ffff00"/>
          <stop offset="100%" stop-color="#aa6600"/>
        </radialGradient>
        <radialGradient id="obg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1a0a2a"/>
          <stop offset="100%" stop-color="#000000"/>
        </radialGradient>
        <filter id="oglow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- 闇の中の目 -->
      <ellipse cx="8" cy="8" rx="7" ry="5" fill="url(#obg)"/>
      <ellipse cx="8" cy="8" rx="5" ry="3.5" fill="#111" stroke="#332200" stroke-width="0.5"/>
      <!-- 瞳孔 -->
      <ellipse cx="8" cy="8" rx="3" ry="2.5" fill="url(#og)" filter="url(#oglow)"/>
      <ellipse cx="8" cy="8" rx="1.5" ry="1.5" fill="#000"/>
      <!-- ハイライト -->
      <circle cx="6" cy="7" r="0.8" fill="#ffffff" opacity="0.9"/>
    </svg>
  `,
  [TILE.GHOST]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <radialGradient id="gg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#eeeeff"/>
          <stop offset="100%" stop-color="#aabbff"/>
        </radialGradient>
        <filter id="gglow">
          <feGaussianBlur stdDeviation="1" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- 体 -->
      <path d="M4,6 Q4,2 8,2 Q12,2 12,6 L12,12 Q11,11 10,12 Q9,13 8,12 Q7,11 6,12 Q5,13 4,12 Z" fill="url(#gg)" filter="url(#gglow)" opacity="0.85"/>
      <!-- 目 -->
      <ellipse cx="6" cy="6" rx="1.5" ry="2" fill="#222"/>
      <ellipse cx="10" cy="6" rx="1.5" ry="2" fill="#222"/>
      <!-- ほっぺ -->
      <circle cx="4" cy="8" r="1" fill="#ffaaaa" opacity="0.5"/>
      <circle cx="12" cy="8" r="1" fill="#ffaaaa" opacity="0.5"/>
      <!-- 口 -->
      <ellipse cx="8" cy="9" rx="1" ry="0.5" fill="#666"/>
    </svg>
  `,
  [TILE.TIME_FORGOTTEN]: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <linearGradient id="tforg" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#333333"/>
          <stop offset="100%" stop-color="#111111"/>
        </linearGradient>
      </defs>
      <!-- 忘却された十字架 -->
      <rect x="6" y="2" width="4" height="12" fill="url(#tforg)" opacity="0.4"/>
      <rect x="3" y="5" width="10" height="3" fill="url(#tforg)" opacity="0.4"/>
    </svg>
  `,
  player: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <radialGradient id="pg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#88ccff"/>
        </radialGradient>
        <filter id="pglow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="8" cy="8" rx="6" ry="4" fill="url(#pg)" filter="url(#pglow)"/>
      <ellipse cx="8" cy="8" rx="4" ry="2.5" fill="#aaddff"/>
      <circle cx="5" cy="7" r="1.5" fill="#003355"/>
      <circle cx="5" cy="7" r="0.8" fill="#00ffff"/>
      <polygon points="8,2 10,5 6,5" fill="#88ccff"/>
      <rect x="12" y="6" width="3" height="1" fill="#88ccff"/>
      <rect x="12" y="9" width="3" height="1" fill="#88ccff"/>
    </svg>
  `,
  rival: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <defs>
        <radialGradient id="rg2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffaaaa"/>
          <stop offset="100%" stop-color="#ff4444"/>
        </radialGradient>
        <filter id="rglow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="8" cy="8" rx="6" ry="4" fill="url(#rg2)" filter="url(#rglow)"/>
      <ellipse cx="8" cy="8" rx="4" ry="2.5" fill="#ffcccc"/>
      <circle cx="5" cy="7" r="1.5" fill="#550000"/>
      <circle cx="5" cy="7" r="0.8" fill="#ff0000"/>
      <polygon points="8,2 10,5 6,5" fill="#ff8888"/>
      <rect x="12" y="6" width="3" height="1" fill="#ff8888"/>
      <rect x="12" y="9" width="3" height="1" fill="#ff8888"/>
    </svg>
  `
};

// スプライト画像をロード
const sprites = {};
let spritesLoaded = 0;
const totalSprites = Object.keys(SPRITE_SVGS).length;

function loadSprites() {
  return new Promise((resolve) => {
    for (const [key, svg] of Object.entries(SPRITE_SVGS)) {
      const img = new Image();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        sprites[key] = img;
        spritesLoaded++;
        if (spritesLoaded === totalSprites) {
          resolve();
        }
      };
      img.src = url;
    }
  });
}

// マップデータ
const map = [];
const discovered = new Set();
const observerSpoken = new Set(); // 話しかけた観測者
const timeFragmentDays = {}; // 座標 -> 日付番号
const tombstonePopup = document.getElementById('tombstonePopup');
const epitaph = document.getElementById('epitaph');
const ghostContainer = document.getElementById('ghostContainer');

// 観測者のセリフ（7体分 - 曜日に対応）
const observerMessages = [
  { symbol: '☀', message: 'あなたは 時間を探しているのですか', sub: 'それとも 時間に探されているのですか' },
  { symbol: '☽', message: '過ぎた日は ここに沈む', sub: 'あなたも いずれ' },
  { symbol: '♂', message: '私は見ている', sub: 'あなたが忘れた日々を' },
  { symbol: '☿', message: '365の墓標', sub: 'そのすべてが あなたの一部' },
  { symbol: '♃', message: '時間は死なない', sub: '埋葬されるだけ' },
  { symbol: '♀', message: '今日もまた 一つ沈む', sub: '気づいていましたか' },
  { symbol: '♄', message: '最後の十字架を見つけた時', sub: 'あなたは何を思うのでしょう' }
];

// プレイヤー位置
let playerX = Math.floor(MAP_W / 2);
let playerY = Math.floor(MAP_H / 2);

// ライバル（忘却）の位置
let rivalX = Math.floor(MAP_W / 4);
let rivalY = Math.floor(MAP_H / 4);
const forgotten = new Set(); // 忘却された日付
const forgetPopup = document.getElementById('forgetPopup');

// 墓場の年（過去の年）
const now = new Date();
const year = 2025; // 過去の年
const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
const daysInYear = isLeap ? 366 : 365;
const dayOfYear = 365; // 1年分すべてが埋葬済み

// 初期値設定
yearEl.textContent = year;
depthEl.textContent = String(dayOfYear).padStart(3, '0');
depthFill.style.width = (dayOfYear / daysInYear * 100) + '%';
remainingEl.textContent = String(daysInYear - dayOfYear).padStart(3, '0');

// 墓場の日付（2024年の最終日）
dateDisplay.textContent = `${year}.12.31`;

// シード付き乱数
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 洞窟マップ生成（セルラーオートマトン法）
function generateMap() {
  // 初期化：ランダムに壁を配置（45%の確率で壁）
  for (let y = 0; y < MAP_H; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      if (x === 0 || x === MAP_W - 1 || y === 0 || y === MAP_H - 1) {
        map[y][x] = TILE.WALL;
      } else {
        map[y][x] = seededRandom(y * MAP_W + x) < 0.45 ? TILE.WALL : TILE.EMPTY;
      }
    }
  }

  // セルラーオートマトンで滑らかにする（5回繰り返し）
  for (let iter = 0; iter < 5; iter++) {
    const newMap = [];
    for (let y = 0; y < MAP_H; y++) {
      newMap[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        if (x === 0 || x === MAP_W - 1 || y === 0 || y === MAP_H - 1) {
          newMap[y][x] = TILE.WALL;
          continue;
        }

        // 周囲8マスの壁の数をカウント
        let walls = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (map[y + dy][x + dx] === TILE.WALL) walls++;
          }
        }

        // 壁が5個以上なら壁、そうでなければ空
        newMap[y][x] = walls >= 5 ? TILE.WALL : TILE.EMPTY;
      }
    }

    // マップを更新
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        map[y][x] = newMap[y][x];
      }
    }
  }

  // プレイヤーのスタート地点を確保（中央付近に空間を作る）
  const centerX = Math.floor(MAP_W / 2);
  const centerY = Math.floor(MAP_H / 2);
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x > 0 && x < MAP_W - 1 && y > 0 && y < MAP_H - 1) {
        map[y][x] = TILE.EMPTY;
      }
    }
  }

  // 通路を掘って連結性を確保（ドランカーウォーク）
  let wx = centerX;
  let wy = centerY;
  for (let i = 0; i < 800; i++) {
    const dir = Math.floor(seededRandom(i * 1337) * 4);
    if (dir === 0 && wy > 2) wy--;
    if (dir === 1 && wy < MAP_H - 3) wy++;
    if (dir === 2 && wx > 2) wx--;
    if (dir === 3 && wx < MAP_W - 3) wx++;

    map[wy][wx] = TILE.EMPTY;
    // 通路を少し太くする
    if (wx > 1) map[wy][wx - 1] = TILE.EMPTY;
    if (wx < MAP_W - 2) map[wy][wx + 1] = TILE.EMPTY;
  }

  // 深淵（移動をブロックするので先に配置）
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(seededRandom(i * 743 + 4000) * (MAP_W - 4)) + 2;
    const y = Math.floor(seededRandom(i * 857 + 4000) * (MAP_H - 4)) + 2;
    if (map[y][x] === TILE.EMPTY) {
      map[y][x] = TILE.ABYSS;
    }
  }

  // プレイヤー開始位置から到達可能なタイルを計算（フラッドフィル）
  const reachable = new Set();
  const queue = [[centerX, centerY]];
  reachable.add(`${centerX},${centerY}`);

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      const key = `${nx},${ny}`;
      if (nx > 0 && nx < MAP_W - 1 && ny > 0 && ny < MAP_H - 1 &&
          map[ny][nx] !== TILE.WALL && !reachable.has(key)) {
        reachable.add(key);
        queue.push([nx, ny]);
      }
    }
  }

  // 到達可能なEMPTYタイルのリストを作成
  const reachableEmpty = [];
  for (const key of reachable) {
    const [x, y] = key.split(',').map(Number);
    if (map[y][x] === TILE.EMPTY) {
      reachableEmpty.push({ x, y });
    }
  }

  // 時間の断片（墓標）を到達可能な場所にのみ配置
  let placed = 0;
  let attempt = 0;
  while (placed < daysInYear && attempt < 10000 && reachableEmpty.length > 0) {
    const idx = Math.floor(seededRandom(attempt * 137 + 5000) * reachableEmpty.length);
    const { x, y } = reachableEmpty[idx];
    if (map[y][x] === TILE.EMPTY) {
      map[y][x] = TILE.TIME_FRAGMENT;
      timeFragmentDays[`${x},${y}`] = placed + 1; // 1日目〜365日目
      placed++;
      reachableEmpty.splice(idx, 1);
    }
    attempt++;
  }

  // 遺跡
  for (let i = 0; i < 25; i++) {
    const x = Math.floor(seededRandom(i * 137 + 1000) * (MAP_W - 2)) + 1;
    const y = Math.floor(seededRandom(i * 251 + 1000) * (MAP_H - 2)) + 1;
    if (map[y][x] === TILE.EMPTY) {
      map[y][x] = TILE.RUIN;
    }
  }

  // 熱水噴出孔
  for (let i = 0; i < 15; i++) {
    const x = Math.floor(seededRandom(i * 317 + 2000) * (MAP_W - 2)) + 1;
    const y = Math.floor(seededRandom(i * 419 + 2000) * (MAP_H - 2)) + 1;
    if (map[y][x] === TILE.EMPTY) {
      map[y][x] = TILE.VENT;
    }
  }

  // 深海生物
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(seededRandom(i * 523 + 3000) * (MAP_W - 2)) + 1;
    const y = Math.floor(seededRandom(i * 631 + 3000) * (MAP_H - 2)) + 1;
    if (map[y][x] === TILE.EMPTY) {
      map[y][x] = TILE.CREATURE;
    }
  }

  // 構造物
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(seededRandom(i * 967 + 6000) * (MAP_W - 2)) + 1;
    const y = Math.floor(seededRandom(i * 1087 + 6000) * (MAP_H - 2)) + 1;
    if (map[y][x] === TILE.EMPTY) {
      map[y][x] = TILE.STRUCTURE;
    }
  }

  // 観測者（7体 - 曜日の数）
  for (let i = 0; i < 7; i++) {
    const x = Math.floor(seededRandom(i * 1111 + 7000) * (MAP_W - 4)) + 2;
    const y = Math.floor(seededRandom(i * 1313 + 7000) * (MAP_H - 4)) + 2;
    if (map[y][x] === TILE.EMPTY) {
      map[y][x] = TILE.OBSERVER;
    }
  }
}

generateMap();

// ライバルを空いている場所に配置
function placeRival() {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const x = Math.floor(seededRandom(attempt * 999 + 8000) * (MAP_W - 4)) + 2;
    const y = Math.floor(seededRandom(attempt * 888 + 8000) * (MAP_H - 4)) + 2;
    if (map[y][x] === TILE.EMPTY) {
      rivalX = x;
      rivalY = y;
      return;
    }
  }
}
placeRival();

// 視界計算（直線で壁にぶつかるまで）
function calculateLineOfSight(fromX, fromY) {
  const visible = new Set();
  visible.add(`${fromX},${fromY}`);

  // 8方向 + 直線4方向
  const directions = [];

  // 細かい角度で光線を飛ばす
  for (let angle = 0; angle < 360; angle += 2) {
    const rad = angle * Math.PI / 180;
    directions.push({ dx: Math.cos(rad), dy: Math.sin(rad) });
  }

  for (const dir of directions) {
    for (let dist = 1; dist < 30; dist++) {
      const x = Math.round(fromX + dir.dx * dist);
      const y = Math.round(fromY + dir.dy * dist);

      if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) break;
      if (map[y][x] === TILE.WALL) break;

      visible.add(`${x},${y}`);
    }
  }

  return visible;
}

// 描画
function draw() {
  // 背景
  ctx.fillStyle = '#000508';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ビューポートの開始位置
  const startX = Math.max(0, Math.min(MAP_W - VIEW_W, playerX - Math.floor(VIEW_W / 2)));
  const startY = Math.max(0, Math.min(MAP_H - VIEW_H, playerY - Math.floor(VIEW_H / 2)));

  // 視界を計算
  const playerVisible = calculateLineOfSight(playerX, playerY);
  const rivalVisible = calculateLineOfSight(rivalX, rivalY);

  // マップ描画（まずスプライト）
  for (let vy = 0; vy < VIEW_H; vy++) {
    for (let vx = 0; vx < VIEW_W; vx++) {
      const mx = startX + vx;
      const my = startY + vy;

      if (mx >= 0 && mx < MAP_W && my >= 0 && my < MAP_H) {
        const screenX = vx * TILE_SIZE;
        const screenY = vy * TILE_SIZE;
        const key = `${mx},${my}`;

        let tile = map[my][mx];

        // 発見済みの時間の断片
        if (tile === TILE.TIME_FRAGMENT && discovered.has(key)) {
          tile = TILE.TIME_DISCOVERED;
        }

        // スプライト描画
        if (sprites[tile]) {
          ctx.drawImage(sprites[tile], screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  // 視界オーバーレイ（スプライトの上に重ねる）
  for (let vy = 0; vy < VIEW_H; vy++) {
    for (let vx = 0; vx < VIEW_W; vx++) {
      const mx = startX + vx;
      const my = startY + vy;

      if (mx >= 0 && mx < MAP_W && my >= 0 && my < MAP_H) {
        const screenX = vx * TILE_SIZE;
        const screenY = vy * TILE_SIZE;
        const key = `${mx},${my}`;

        // ライバルの視界（黄色）
        if (rivalVisible.has(key) && map[my][mx] !== TILE.WALL) {
          ctx.fillStyle = 'rgba(100, 80, 0, 0.25)';
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }

        // プレイヤーの視界（シアン）
        if (playerVisible.has(key) && map[my][mx] !== TILE.WALL) {
          ctx.fillStyle = 'rgba(0, 80, 100, 0.2)';
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  // ライバル描画（画面内にいれば）
  if (rivalX >= startX && rivalX < startX + VIEW_W && rivalY >= startY && rivalY < startY + VIEW_H) {
    const rivalScreenX = (rivalX - startX) * TILE_SIZE;
    const rivalScreenY = (rivalY - startY) * TILE_SIZE;
    if (sprites.rival) {
      ctx.drawImage(sprites.rival, rivalScreenX, rivalScreenY, TILE_SIZE, TILE_SIZE);
    }
  }

  // プレイヤー描画
  const playerScreenX = (playerX - startX) * TILE_SIZE;
  const playerScreenY = (playerY - startY) * TILE_SIZE;

  if (sprites.player) {
    ctx.drawImage(sprites.player, playerScreenX, playerScreenY, TILE_SIZE, TILE_SIZE);
  }

  // ソナーピング効果
  const pingRadius = (Date.now() % 2000) / 2000 * 100;
  const pingAlpha = 1 - pingRadius / 100;
  ctx.strokeStyle = `rgba(0, 255, 255, ${pingAlpha * 0.3})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(playerScreenX + TILE_SIZE / 2, playerScreenY + TILE_SIZE / 2, pingRadius, 0, Math.PI * 2);
  ctx.stroke();
}

// 日付番号から日付文字列を生成
function getDayString(dayNum) {
  const date = new Date(year, 0, dayNum);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${year}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
}

// 墓碑銘を生成
function getEpitaph(dayNum) {
  const epitaphs = [
    'ここに眠る',
    'この日は還らない',
    '永遠に沈む',
    '深淵に消えた',
    '時は流れ去った',
    '記憶の底に',
    '静寂の中へ',
    'もう戻れない'
  ];
  return epitaphs[dayNum % epitaphs.length];
}

// 発見チェック
function checkDiscovery() {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = playerX + dx;
      const y = playerY + dy;
      const key = `${x},${y}`;

      if (map[y] && (map[y][x] === TILE.TIME_FRAGMENT || map[y][x] === TILE.TIME_FORGOTTEN) && !discovered.has(key)) {
        const wasRecovered = map[y][x] === TILE.TIME_FORGOTTEN;
        discovered.add(key);
        forgotten.delete(key);
        map[y][x] = TILE.TIME_DISCOVERED;

        // 墓標を発見した演出
        const dayNum = timeFragmentDays[key];
        if (dayNum) {
          const dateStr = getDayString(dayNum);
          const isPast = dayNum <= dayOfYear;

          // 十字架と日付を表示
          tombstonePopup.textContent = wasRecovered ? '憶' : '†';
          tombstonePopup.classList.add('show');

          // 墓碑銘
          const subText = wasRecovered ? '記憶を取り戻した' : (isPast ? getEpitaph(dayNum) : '未だ来たらず');
          epitaph.innerHTML = `${dateStr}<br><span style="font-size: 12px; opacity: 0.7">${subText}</span>`;
          epitaph.classList.add('show');

          // 一定時間後に消す
          setTimeout(() => {
            tombstonePopup.classList.remove('show');
          }, 2000);
          setTimeout(() => {
            epitaph.classList.remove('show');
          }, 3000);

          // おばけを出現させる
          spawnGhost();
        }
      }
    }
  }

  discoveredEl.textContent = `${discovered.size}/${daysInYear}`;

  // 観測者との接触チェック
  checkObserver();
}

// おばけを出現させる
function spawnGhost() {
  const ghost = document.createElement('div');
  ghost.className = 'ghost-popup';
  ghost.textContent = '👻';

  // ランダムな位置（画面中央付近）
  const offsetX = (Math.random() - 0.5) * 100;
  ghost.style.left = `calc(50% + ${offsetX}px)`;
  ghost.style.top = '50%';

  ghostContainer.appendChild(ghost);

  // アニメーション開始
  requestAnimationFrame(() => {
    ghost.classList.add('show');
  });

  // 削除
  setTimeout(() => {
    ghost.remove();
  }, 3000);
}

// 観測者チェック
let observerIndex = 0;
function checkObserver() {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const x = playerX + dx;
      const y = playerY + dy;
      const key = `${x},${y}`;

      if (map[y] && map[y][x] === TILE.OBSERVER && !observerSpoken.has(key)) {
        observerSpoken.add(key);

        const msg = observerMessages[observerIndex % observerMessages.length];
        observerIndex++;

        // メッセージ表示
        tombstonePopup.textContent = msg.symbol;
        tombstonePopup.style.color = '#ffff00';
        tombstonePopup.classList.add('show');

        epitaph.innerHTML = `${msg.message}<br><span style="font-size: 11px; opacity: 0.6">${msg.sub}</span>`;
        epitaph.style.color = 'rgba(255, 255, 150, 0.9)';
        epitaph.classList.add('show');

        setTimeout(() => {
          tombstonePopup.classList.remove('show');
          tombstonePopup.style.color = '';
        }, 3000);
        setTimeout(() => {
          epitaph.classList.remove('show');
          epitaph.style.color = '';
        }, 5000);

        return;
      }
    }
  }
}

// 移動
const keys = {};

document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  keys[e.code] = true;
  e.preventDefault();
});

document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
  keys[e.code] = false;
});

let lastMove = 0;
const MOVE_DELAY = 100;

function handleInput() {
  const now = Date.now();
  if (now - lastMove < MOVE_DELAY) return;

  let dx = 0;
  let dy = 0;

  if (keys['w'] || keys['arrowup']) dy = -1;
  if (keys['s'] || keys['arrowdown']) dy = 1;
  if (keys['a'] || keys['arrowleft']) dx = -1;
  if (keys['d'] || keys['arrowright']) dx = 1;

  if (dx !== 0 || dy !== 0) {
    const newX = playerX + dx;
    const newY = playerY + dy;

    if (map[newY] && map[newY][newX] !== TILE.WALL && map[newY][newX] !== TILE.ABYSS) {
      playerX = newX;
      playerY = newY;
      lastMove = now;

      coordsEl.textContent = `${playerX - 64}, ${playerY - 64}`;
      checkDiscovery();
      updateExplored();
    }
  }
}

// 探索済みマスを更新
function updateExplored() {
  // 視界範囲を探索済みに
  const radius = 5;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = playerX + dx;
      const y = playerY + dy;
      if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) {
        explored.add(`${x},${y}`);
      }
    }
  }
}

// ミニマップ描画
let cachedPlayerVisible = new Set();

function drawMinimap() {
  minimapCtx.fillStyle = '#000';
  minimapCtx.fillRect(0, 0, MAP_W, MAP_H);

  // 現在の視界を計算してキャッシュ
  cachedPlayerVisible = calculateLineOfSight(playerX, playerY);

  // 探索済みエリアと現在の視界を結合
  const visibleOnMap = new Set([...explored, ...cachedPlayerVisible]);

  // エリアを描画
  for (const key of visibleOnMap) {
    const [x, y] = key.split(',').map(Number);
    const tile = map[y]?.[x];

    // 現在の視界内かどうか
    const inSight = cachedPlayerVisible.has(key);

    if (tile === TILE.WALL) {
      minimapCtx.fillStyle = inSight ? '#2a4a5a' : '#1a2a3a';
    } else if (tile === TILE.TIME_FRAGMENT) {
      if (discovered.has(key)) {
        minimapCtx.fillStyle = '#00ffff';
      } else {
        minimapCtx.fillStyle = inSight ? '#ff44ff' : '#ff00ff';
      }
    } else if (tile === TILE.TIME_FORGOTTEN) {
      minimapCtx.fillStyle = '#333333';
    } else if (tile === TILE.OBSERVER) {
      minimapCtx.fillStyle = '#ffff00';
    } else if (tile === TILE.ABYSS) {
      minimapCtx.fillStyle = '#000000';
    } else {
      // 空きスペース：視界内は明るく
      minimapCtx.fillStyle = inSight ? '#1a3040' : '#0a1520';
    }

    minimapCtx.fillRect(x, y, 1, 1);
  }

  // ライバル位置
  minimapCtx.fillStyle = '#ff4444';
  minimapCtx.fillRect(rivalX - 1, rivalY - 1, 3, 3);

  // プレイヤー位置
  minimapCtx.fillStyle = '#ffffff';
  minimapCtx.fillRect(playerX - 1, playerY - 1, 3, 3);
}

// ライバルの移動
let lastRivalMove = 0;
const RIVAL_MOVE_DELAY = 200;
let rivalTargetX = -1;
let rivalTargetY = -1;

function findNearestFragment() {
  let nearest = null;
  let minDist = Infinity;

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (map[y][x] === TILE.TIME_FRAGMENT && !discovered.has(`${x},${y}`)) {
        const dist = Math.abs(x - rivalX) + Math.abs(y - rivalY);
        if (dist < minDist) {
          minDist = dist;
          nearest = { x, y };
        }
      }
    }
  }
  return nearest;
}

function moveRival() {
  const now = Date.now();
  if (now - lastRivalMove < RIVAL_MOVE_DELAY) return;

  // 最寄りの十字架を探す
  const target = findNearestFragment();
  if (!target) return;

  // ターゲットに向かって移動
  let dx = 0;
  let dy = 0;

  if (target.x > rivalX) dx = 1;
  else if (target.x < rivalX) dx = -1;

  if (target.y > rivalY) dy = 1;
  else if (target.y < rivalY) dy = -1;

  // どちらか一方向に移動（ランダムに選択）
  if (dx !== 0 && dy !== 0) {
    if (Math.random() < 0.5) dx = 0;
    else dy = 0;
  }

  const newX = rivalX + dx;
  const newY = rivalY + dy;

  if (map[newY] && map[newY][newX] !== TILE.WALL && map[newY][newX] !== TILE.ABYSS) {
    rivalX = newX;
    rivalY = newY;
    lastRivalMove = now;

    checkRivalDiscovery();
  } else {
    // 壁にぶつかったらランダムに迂回
    const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const altX = rivalX + dir.dx;
    const altY = rivalY + dir.dy;
    if (map[altY] && map[altY][altX] !== TILE.WALL && map[altY][altX] !== TILE.ABYSS) {
      rivalX = altX;
      rivalY = altY;
      lastRivalMove = now;
      checkRivalDiscovery();
    }
  }
}

// ライバルの発見（忘却）チェック
function checkRivalDiscovery() {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = rivalX + dx;
      const y = rivalY + dy;
      const key = `${x},${y}`;

      // 未発見の十字架、または発見済みの十字架を忘却させる
      const tile = map[y]?.[x];
      if (tile === TILE.TIME_FRAGMENT || tile === TILE.TIME_DISCOVERED) {
        const wasDiscovered = discovered.has(key);

        forgotten.add(key);
        discovered.delete(key);
        map[y][x] = TILE.TIME_FORGOTTEN;

        // ビューポートの開始位置を計算
        const startX = Math.max(0, Math.min(MAP_W - VIEW_W, playerX - Math.floor(VIEW_W / 2)));
        const startY = Math.max(0, Math.min(MAP_H - VIEW_H, playerY - Math.floor(VIEW_H / 2)));

        // 画面内の位置を計算
        const screenX = (x - startX) * TILE_SIZE + TILE_SIZE / 2;
        const screenY = (y - startY) * TILE_SIZE + TILE_SIZE / 2;

        // 「忘」を発見位置に表示
        forgetPopup.style.left = screenX + 'px';
        forgetPopup.style.top = screenY + 'px';
        forgetPopup.classList.add('show');
        setTimeout(() => {
          forgetPopup.classList.remove('show');
        }, 2000);

        // 発見数を更新
        discoveredEl.textContent = `${discovered.size}/${daysInYear}`;
      }
    }
  }
}

// ゲームループ
function gameLoop() {
  handleInput();
  moveRival();
  draw();
  drawMinimap();
  requestAnimationFrame(gameLoop);
}

// 時刻更新
function updateTime() {
  const n = new Date();
  const h = String(n.getHours()).padStart(2, '0');
  const m = String(n.getMinutes()).padStart(2, '0');
  const s = String(n.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${h}:${m}:${s}`;
}

// 初期化
loadSprites().then(() => {
  updateExplored(); // 初期位置の周囲を探索済みに
  gameLoop();
  updateTime();
  setInterval(updateTime, 1000);
  coordsEl.textContent = `${playerX - 64}, ${playerY - 64}`;
});
