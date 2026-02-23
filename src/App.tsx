import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Database, BrainCircuit, Activity, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, LayoutTemplate } from 'lucide-react';

// --- 型定義 ---
interface Item {
  id: string;
  text: string;
  vector: number[];
}

interface Cluster {
  id: number;
  name: string;
  itemIds: string[];
}

interface SearchResult {
  item: Item;
  score: number;
}

interface ThemeConfig {
  id: string;
  label: string;
  colors: string[];
  bg: string;
  text: string;
  sidebarBg: string;
  sidebarLeftClass: string;
  sidebarRightClass: string;
  panel: string;
  listItem: string;
  button: string;
  input: string;
  searchBar: string;
  iconBg: string;
  sideBtn: string;
  tileClass: string;
  textColor: string;
  watermark: string;
  scoreClass: string;
  switchContainer: string;
  switchBase: string;
  switchActive: string;
  barContainer: string;
  barFill: string;
  barText: string;
  border: string;
}

// --- ユーティリティ関数 ---
const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const getTileSpan = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  const rand = Math.abs(hash) % 100;
  
  if (text.length >= 10) {
    return rand < 60 ? "col-span-2 row-span-1" : "col-span-2 row-span-2";
  }
  
  if (rand < 50) return "col-span-1 row-span-1"; 
  if (rand < 75) return "col-span-2 row-span-1"; 
  if (rand < 90) return "col-span-1 row-span-2"; 
  return "col-span-2 row-span-2";                
};

// --- テーマ定義 (Neu / M2 / M3 / Win10) ---
const THEMES: Record<string, ThemeConfig> = {
  neumorphism: {
    id: 'neumorphism',
    label: 'Neumorphism',
    colors: ["#FF8A80", "#82B1FF", "#B9F6CA", "#FFE57F", "#B388FF", "#FF80AB", "#84FFFF", "#FFD180"],
    bg: 'bg-[#e0e5ec]',
    text: 'text-slate-600',
    sidebarBg: 'bg-[#e0e5ec]',
    sidebarLeftClass: 'shadow-[10px_0_20px_rgba(190,195,201,0.4)] border-transparent',
    sidebarRightClass: 'shadow-[-10px_0_20px_rgba(190,195,201,0.4)] border-transparent',
    panel: 'neu-flat rounded-2xl',
    listItem: 'neu-flat rounded-2xl my-3 hover:scale-[0.98]',
    button: 'neu-button rounded-2xl text-blue-500 font-bold',
    input: 'neu-pressed bg-[#e0e5ec] rounded-2xl text-slate-600 placeholder-slate-400 focus:outline-none',
    searchBar: 'bg-neu neu-pressed rounded-full',
    iconBg: 'neu-flat rounded-full text-blue-400',
    sideBtn: 'neu-button text-slate-500 hover:text-blue-500 rounded-full',
    tileClass: 'neu-tile rounded-3xl',
    textColor: 'text-slate-600',
    watermark: 'text-white/20', // ウォーターマークの透明度を下げて被りを軽減
    scoreClass: 'neu-pressed text-blue-500 rounded-md',
    switchContainer: 'rounded-full bg-black/5 backdrop-blur-md border border-white/10',
    switchBase: 'neu-button text-slate-500 rounded-full',
    switchActive: 'neu-pressed text-blue-500 rounded-full',
    barContainer: 'neu-pressed p-[1px] rounded-full',
    barFill: 'bg-blue-400 rounded-full',
    barText: 'text-blue-500',
    border: 'border-slate-300/30'
  },
  material2: {
    id: 'material2',
    label: 'Material 2',
    colors: ["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", "#E91E63", "#00BCD4", "#FF9800"],
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    sidebarBg: 'bg-white',
    sidebarLeftClass: 'shadow-[4px_0_16px_rgba(0,0,0,0.1)] border-r border-gray-200',
    sidebarRightClass: 'shadow-[-4px_0_16px_rgba(0,0,0,0.1)] border-l border-gray-200',
    panel: 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] rounded-md border border-gray-100',
    listItem: 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] rounded-sm my-2 hover:shadow-[0_3px_6px_rgba(0,0,0,0.16)]',
    button: 'bg-blue-500 hover:bg-blue-600 text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16)] rounded-sm uppercase tracking-wide transition-all',
    input: 'bg-gray-100 border-b-2 border-blue-500 focus:bg-gray-200 rounded-t-sm text-gray-800 placeholder-gray-500 focus:outline-none',
    searchBar: 'bg-white shadow-[0_2px_5px_rgba(0,0,0,0.16)] rounded-sm',
    iconBg: 'bg-blue-50 text-blue-600 rounded-full',
    sideBtn: 'bg-white shadow-md text-gray-600 hover:text-blue-500 rounded-full',
    tileClass: 'rounded-md shadow-[0_3px_6px_rgba(0,0,0,0.16)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.19)] transition-shadow',
    textColor: 'text-white',
    watermark: 'text-white/20',
    scoreClass: 'bg-black/30 text-white rounded-md',
    switchContainer: 'rounded-full bg-black/5 backdrop-blur-md border border-white/10',
    switchBase: 'bg-white shadow-sm text-gray-600 hover:bg-gray-50 rounded-full',
    switchActive: 'bg-blue-500 text-white shadow-md rounded-full',
    barContainer: 'bg-gray-200 rounded-full',
    barFill: 'bg-blue-500 rounded-full',
    barText: 'text-blue-600',
    border: 'border-gray-200'
  },
  material3: {
    id: 'material3',
    label: 'Material 3',
    colors: ["#FFB4AB", "#AEC6FF", "#94EBAC", "#FFE082", "#EADDFF", "#FFD9E2", "#8EF3F3", "#FFB77C"],
    bg: 'bg-[#FDF8FD]',
    text: 'text-[#1D1B20]',
    sidebarBg: 'bg-[#F4EDF4]',
    sidebarLeftClass: 'border-r border-[#E7E0E8]',
    sidebarRightClass: 'border-l border-[#E7E0E8]',
    panel: 'bg-[#EADDFF]/40 rounded-[24px]',
    listItem: 'bg-[#EADDFF]/40 hover:bg-[#EADDFF]/80 rounded-[16px] my-2 transition-colors',
    button: 'bg-[#6750A4] hover:bg-[#4F378B] text-white rounded-full transition-colors',
    input: 'bg-[#E7E0E8] focus:bg-[#EADDFF]/50 rounded-full text-[#1D1B20] placeholder-[#49454F]/60 focus:outline-none transition-colors',
    searchBar: 'bg-[#E7E0E8] focus-within:bg-[#EADDFF]/50 rounded-full transition-colors',
    iconBg: 'bg-[#EADDFF] text-[#21005D] rounded-full',
    sideBtn: 'bg-[#E7E0E8] text-[#49454F] hover:bg-[#EADDFF] rounded-full',
    tileClass: 'rounded-[24px] border border-transparent hover:border-[#6750A4]/20 hover:shadow-sm transition-all',
    textColor: 'text-[#1D1B20]',
    watermark: 'text-[#1D1B20]/10',
    scoreClass: 'bg-[#1D1B20]/10 text-[#1D1B20] rounded-full',
    switchContainer: 'rounded-full bg-black/5 backdrop-blur-md border border-white/10',
    switchBase: 'bg-[#E7E0E8] text-[#49454F] hover:bg-[#D0BCFF]/50 rounded-full',
    switchActive: 'bg-[#6750A4] text-white rounded-full',
    barContainer: 'bg-[#E7E0E8] rounded-full',
    barFill: 'bg-[#6750A4] rounded-full',
    barText: 'text-[#6750A4]',
    border: 'border-[#E7E0E8]'
  },
  windows10: {
    id: 'windows10',
    label: 'Windows 10',
    colors: ["#0078D7", "#D83B01", "#10893E", "#E81123", "#00B294", "#68217A", "#00188F", "#C30052"],
    bg: 'bg-[#1e1e1e]',
    text: 'text-gray-100',
    sidebarBg: 'bg-[#252526]',
    sidebarLeftClass: 'border-r border-[#3e3e42] shadow-2xl',
    sidebarRightClass: 'border-l border-[#3e3e42] shadow-2xl',
    panel: 'bg-[#2d2d30] rounded-none border border-[#3e3e42]',
    listItem: 'bg-[#2d2d30] hover:bg-[#3e3e42] rounded-none my-2 transition-colors',
    button: 'bg-[#0078D7] hover:bg-[#005a9e] text-white rounded-none transition-colors',
    input: 'bg-[#1e1e1e] border-2 border-transparent focus:border-[#0078D7] rounded-none text-white placeholder-gray-500 focus:outline-none',
    searchBar: 'bg-[#2d2d30] border-2 border-transparent focus-within:border-[#0078D7] rounded-none',
    iconBg: 'bg-transparent text-[#0078D7] rounded-none',
    sideBtn: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 rounded-none transition-colors',
    tileClass: 'rounded-none border border-transparent hover:border-white/40 hover:scale-[0.98] transition-all',
    textColor: 'text-white',
    watermark: 'text-white/10',
    scoreClass: 'bg-black/60 text-white rounded-none',
    switchContainer: 'rounded-none bg-[#2d2d30] border border-[#3e3e42]',
    switchBase: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 rounded-none',
    switchActive: 'bg-[#0078D7] text-white rounded-none',
    barContainer: 'bg-[#3e3e42] rounded-none',
    barFill: 'bg-[#0078D7] rounded-none',
    barText: 'text-[#0078D7]',
    border: 'border-[#3e3e42]'
  }
};

// --- 初期データ ---
const INITIAL_DATA = [
  "美味しい赤りんご", "新鮮なバナナ", "甘いイチゴ", "酸っぱいレモン",
  "速いスポーツカー", "便利な自転車", "大型トラック", "通勤用の電車",
  "かわいい子犬", "眠っている猫", "空を飛ぶ鳥", "泳ぐ魚",
  "最新のスマートフォン", "高性能なパソコン", "便利なスマートウォッチ",
  "AIの技術が進化する", "プログラミングは楽しい", "データサイエンスを学ぶ"
];

// --- メインコンポーネント ---
export default function VectorExplorer() {
  const [modelStatus, setModelStatus] = useState<'initializing' | 'loading' | 'ready' | 'error'>('initializing');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [extractor, setExtractor] = useState<any>(null);
  
  const [items, setItems] = useState<Item[]>([]);
  const [clustersInfo, setClustersInfo] = useState<Cluster[]>([]);

  const [inputText, setInputText] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); 
  
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // ★テーマ設定
  const [themeId, setThemeId] = useState<keyof typeof THEMES>('neumorphism');
  const t = THEMES[themeId];

  // --- Gridの動的サイズ計算 ---
  const gridConfig = useMemo(() => {
    let totalCells = 0;
    items.forEach(item => {
      const span = getTileSpan(item.text);
      if (span.includes("col-span-2") && span.includes("row-span-2")) totalCells += 4;
      else if (span.includes("col-span-2") || span.includes("row-span-2")) totalCells += 2;
      else totalCells += 1;
    });
    
    if (totalCells === 0) return { cols: 4, rows: 4 };

    let cols = Math.max(4, Math.ceil(Math.sqrt(totalCells * 1.5)));
    let rows = Math.ceil(totalCells / cols);
    rows += Math.ceil(rows * 0.25); 

    return { cols, rows };
  }, [items]);

  // --- ベクトル類似度に基づく並び替え ---
  const sortedItems = useMemo(() => {
    if (items.length <= 1) return items;
    const unvisited = [...items];
    const sorted: Item[] = [];
    let current = unvisited.shift()!;
    sorted.push(current);
    
    while (unvisited.length > 0) {
      let bestIndex = -1;
      let maxSim = -Infinity;
      for (let i = 0; i < unvisited.length; i++) {
        const sim = cosineSimilarity(current.vector, unvisited[i].vector);
        if (sim > maxSim) { maxSim = sim; bestIndex = i; }
      }
      current = unvisited.splice(bestIndex, 1)[0];
      sorted.push(current);
    }
    return sorted;
  }, [items]);

  // 1. AIモデル初期化
  useEffect(() => {
    let active = true;
    const initModel = async () => {
      try {
        setModelStatus('loading');
        // @ts-ignore
        const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0/dist/transformers.min.js');
        env.allowLocalModels = false;
        const pipe = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2', {
          progress_callback: (info: any) => {
            if (info.status === 'progress' && info.progress) setLoadingProgress(Math.round(info.progress));
          }
        });
        if (!active) return;
        setExtractor(() => pipe);
        setModelStatus('ready');
      } catch (err) {
        console.error(err);
        if (active) setModelStatus('error');
      }
    };
    initModel();
    return () => { active = false; };
  }, []);

  // 2. 初期データロード
  useEffect(() => {
    if (modelStatus === 'ready' && extractor && items.length === 0) {
      const loadInitialData = async () => {
        const newItems: Item[] = [];
        for (const text of INITIAL_DATA) {
          const output = await extractor(text, { pooling: 'mean', normalize: true });
          newItems.push({ 
            id: Math.random().toString(36).substr(2, 9), text, vector: Array.from(output.data)
          });
        }
        setItems(newItems);
      };
      loadInitialData();
    }
  }, [modelStatus, extractor]);

  // 3. K-Means クラスタリング (色は後からテーマに応じて適用)
  useEffect(() => {
    if (items.length < 2) { setClustersInfo([]); return; }
    const k = Math.min(8, Math.max(2, Math.floor(items.length / 4))); 
    let centroids = [items[0].vector];
    for (let i = 1; i < k; i++) {
      let maxDist = -1, farthestVector: number[] | null = null;
      for (const item of items) {
        let minDist = Infinity;
        for (const centroid of centroids) {
          const dist = 1 - cosineSimilarity(item.vector, centroid);
          if (dist < minDist) minDist = dist;
        }
        if (minDist > maxDist) { maxDist = minDist; farthestVector = item.vector; }
      }
      if (farthestVector) centroids.push(farthestVector);
    }

    let assignments = new Array(items.length).fill(-1);
    let changed = true;
    for (let iter = 0; iter < 15 && changed; iter++) {
      changed = false;
      for (let i = 0; i < items.length; i++) {
        let best = -1, maxSim = -Infinity;
        for (let c = 0; c < k; c++) {
          let sim = cosineSimilarity(items[i].vector, centroids[c]);
          if (sim > maxSim) { maxSim = sim; best = c; }
        }
        if (assignments[i] !== best) { assignments[i] = best; changed = true; }
      }
      let newCentroids = Array.from({length: k}, () => new Array(items[0].vector.length).fill(0));
      let counts = new Array(k).fill(0);
      for (let i = 0; i < items.length; i++) {
        const c = assignments[i];
        counts[c]++;
        for (let d = 0; d < items[i].vector.length; d++) newCentroids[c][d] += items[i].vector[d];
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let d = 0; d < newCentroids[c].length; d++) newCentroids[c][d] /= counts[c];
        } else newCentroids[c] = centroids[c];
      }
      centroids = newCentroids;
    }

    const clusters: Cluster[] = [];
    for (let c = 0; c < k; c++) {
      const clusterItems = items.filter((_, i) => assignments[i] === c);
      if (clusterItems.length === 0) continue;
      let bestItem = clusterItems[0], maxSim = -Infinity;
      for (const item of clusterItems) {
        const sim = cosineSimilarity(item.vector, centroids[c]);
        if (sim > maxSim) { maxSim = sim; bestItem = item; }
      }
      clusters.push({
        id: c, 
        name: bestItem ? bestItem.text : `カテゴリ ${c+1}`,
        itemIds: clusterItems.map(item => item.id),
      });
    }
    setClustersInfo(clusters);
  }, [items.length]);

  // 4. インタラクション処理
  const handleAddText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !extractor) return;
    const text = inputText.trim();
    setInputText('');
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    setItems(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), text, vector: Array.from(output.data) }]);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim() || !extractor || items.length === 0) { setSearchResults([]); return; }
    try {
      const output = await extractor(query, { pooling: 'mean', normalize: true });
      const vector = Array.from(output.data) as number[];
      const results = items.map(item => ({ item, score: cosineSimilarity(vector, item.vector) })).sort((a, b) => b.score - a.score);
      setSearchResults(results.slice(0, 5));
    } catch (err) { console.error(err); }
  };

  const removeText = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (searchQuery) { setSearchQuery(''); setSearchResults([]); }
  };

  // --- UI レンダリング ---
  if (modelStatus !== 'ready') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${t.bg} ${t.text} font-sans transition-colors duration-500`}>
        <BrainCircuit className={`w-16 h-16 mb-6 ${modelStatus === 'error' ? 'text-red-400' : 'text-blue-400 animate-pulse'} drop-shadow-md`} />
        <h1 className="text-2xl font-bold mb-2">Vector Explorer</h1>
        {modelStatus === 'error' ? (
          <p className="text-red-400">モデルの読み込みに失敗しました。</p>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-sm font-medium opacity-70">AIモデルを準備中...</p>
            <div className={`w-64 h-3 overflow-hidden ${t.barContainer} mx-auto`}>
              <div className={`h-full transition-all duration-300 ${t.barFill}`} style={{ width: `${loadingProgress}%` }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden select-none transition-colors duration-500 ${t.bg} ${t.text}`}>
      
      {/* 左サイドバー: データセット管理 */}
      <div className={`flex flex-col z-40 transition-all duration-300 ${t.sidebarBg} ${isSidebarOpen ? `w-80 ${t.sidebarLeftClass}` : 'w-0 overflow-hidden border-transparent'}`}>
        <div className="p-6 flex items-center gap-3 w-80 mt-12">
          <div className={`p-2 ${t.iconBg}`}><Database className="w-5 h-5" /></div>
          <h2 className="font-bold text-lg">データセット</h2>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${themeId==='neumorphism'?'neu-pressed':t.panel}`}>{items.length}</span>
        </div>
        <div className="px-6 pb-4 w-80">
          <form onSubmit={handleAddText} className="flex flex-col gap-4">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="テキストを追加..." className={`w-full px-4 py-3 text-sm transition-colors ${t.input}`} />
            <button type="submit" disabled={!inputText.trim()} className={`w-full p-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${t.button}`}>
              <Plus className="w-5 h-5" /> 追加
            </button>
          </form>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 w-80 custom-scrollbar">
          {items.map(item => (
            <div key={item.id} className={`flex items-center justify-between group p-4 transition-all cursor-default ${t.listItem}`} onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
              <span className="text-sm truncate pr-2 font-medium">{item.text}</span>
              <button onClick={() => removeText(item.id)} className={`hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full ${themeId==='neumorphism'?'hover:neu-pressed':'hover:bg-black/5'} opacity-60`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* 中央メインエリア */}
      <div className="flex-1 flex flex-col relative bg-transparent">
        
        {/* ヘッダーエリア (Flexboxで被りを防止) */}
        <div className="absolute top-0 left-0 w-full z-30 p-4 md:p-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 pointer-events-none">
          
          {/* 左: パネル開閉ボタン */}
          <div className="pointer-events-auto shrink-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-3 transition-all ${t.sideBtn}`} title={isSidebarOpen ? "閉じる" : "開く"}>
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          </div>

          {/* 中央: 検索バー */}
          <div className="pointer-events-auto flex-1 max-w-lg w-full order-last lg:order-none mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              <input type="text" value={searchQuery} onChange={handleSearch} placeholder="検索してハイライト..." className={`w-full py-3 pl-14 pr-6 text-sm font-medium transition-all placeholder:opacity-50 ${t.searchBar} ${t.text}`} />
            </div>
          </div>

          {/* 右: テーマスイッチャー & パネル開閉ボタン */}
          <div className="pointer-events-auto flex items-center gap-2 md:gap-3 shrink-0 ml-auto">
            {/* テーマスイッチャー (画面が狭いときはスクロール可能に) */}
            <div className={`flex overflow-x-auto max-w-[200px] sm:max-w-none gap-1.5 p-1.5 transition-all custom-scrollbar ${t.switchContainer}`}>
              {Object.values(THEMES).map(themeDef => (
                <button 
                  key={themeDef.id}
                  onClick={() => setThemeId(themeDef.id as keyof typeof THEMES)} 
                  className={`px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all ${themeId === themeDef.id ? t.switchActive : t.switchBase}`}
                >
                  {themeDef.label}
                </button>
              ))}
            </div>

            <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className={`p-3 transition-all ${t.sideBtn}`} title={isRightSidebarOpen ? "閉じる" : "開く"}>
              {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 自動タイリング */}
        <div className="flex-1 overflow-hidden p-6 md:p-8 pt-36 lg:pt-28">
          <div className="w-full h-full max-w-[1400px] mx-auto flex flex-col justify-center">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 opacity-60">
                <div className={`p-6 rounded-full ${t.iconBg}`}><LayoutTemplate className="w-10 h-10" /></div>
                <span className="font-medium text-sm">左のパネルからデータを追加してください</span>
              </div>
            ) : (
              <div className="animate-fade-in w-full h-full">
                <div 
                  className="w-full h-full grid gap-5 lg:gap-6 grid-flow-dense p-2"
                  style={{
                    gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`
                  }}
                >
                  {sortedItems.map(item => {
                    const cluster = clustersInfo.find(c => c.itemIds.includes(item.id));
                    // 選択されたテーマのカラー配列から取得
                    const bgColor = cluster ? t.colors[cluster.id % t.colors.length] : "#a0aec0";
                    
                    const searchHit = searchResults.find(r => r.item.id === item.id);
                    const isSearchHit = !!searchHit;
                    const opacity = searchQuery ? (isSearchHit ? 1 : (themeId==='material3'?0.3:0.4)) : 1;
                    const isHovered = hoveredItem === item.id;
                    const spanClass = getTileSpan(item.text);
                    
                    // テーマごとのホバー時のスケール
                    const scale = isHovered && (!searchQuery || isSearchHit) ? (themeId==='neumorphism' ? 'scale(0.97)' : 'scale(1.02)') : 'scale(1)';
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`relative p-4 flex flex-col justify-between overflow-hidden cursor-pointer group ${spanClass} ${t.tileClass} ${searchQuery && isSearchHit && themeId==='neumorphism' ? 'is-hit' : ''}`}
                        style={{ 
                          backgroundColor: bgColor,
                          opacity,
                          transform: scale,
                          containerType: 'size'
                        }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* ニューモーフィズム時のみ、光るインジケーターを表示 */}
                        {themeId === 'neumorphism' && (
                          <div className="w-3 h-3 rounded-full mb-2 opacity-80" style={{ backgroundColor: bgColor, boxShadow: `0 2px 8px ${bgColor}` }} />
                        )}
                        
                        {/* 背景のウォーターマーク */}
                        <span 
                          className={`absolute -top-[5cqh] -right-[5cqw] font-bold pointer-events-none leading-none select-none ${t.watermark}`}
                          style={{ fontSize: '70cqmin' }}
                        >
                          {item.text.charAt(0)}
                        </span>
                        
                        {/* タイルテキスト */}
                        <span 
                          className={`relative z-10 font-bold leading-tight drop-shadow-sm line-clamp-4 break-words pr-1 ${t.textColor}`}
                          style={{ fontSize: 'clamp(11px, 10cqmin, 20px)' }}
                        >
                          {item.text}
                        </span>
                        
                        {/* 検索スコア */}
                        {isSearchHit && (
                          <div className="absolute top-3 right-3 z-20">
                            <span className={`text-[10px] font-bold font-mono px-2 py-1 shadow-sm ${t.scoreClass}`}>
                              {searchHit.score.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右サイドバー: 情報パネル */}
      <div className={`flex flex-col z-40 transition-all duration-300 ${t.sidebarBg} ${isRightSidebarOpen ? `w-80 ${t.sidebarRightClass}` : 'w-0 overflow-hidden border-transparent'}`}>
        <div className="w-80 flex flex-col h-full">
          <div className="p-6 mt-12 flex items-center gap-3">
            <div className={`p-2 ${t.iconBg}`}><LayoutTemplate className="w-5 h-5"/></div>
            <h3 className="font-bold text-lg">カテゴリ凡例</h3>
          </div>
          
          <div className="px-6 space-y-3 max-h-[45%] overflow-y-auto custom-scrollbar">
            {clustersInfo.length === 0 ? (
              <p className="text-sm font-medium opacity-60">カテゴリがありません</p>
            ) : (
              clustersInfo.map(cluster => (
                <div key={cluster.id} className={`flex items-center gap-4 text-sm font-medium p-3 transition-colors ${t.listItem}`}>
                  <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: t.colors[cluster.id % t.colors.length], borderRadius: themeId==='windows10' ? '0' : '9999px', boxShadow: themeId==='neumorphism'?`0 2px 6px ${t.colors[cluster.id % t.colors.length]}`:'none' }}></div>
                  <span className="truncate" title={cluster.name}>{cluster.name}</span>
                </div>
              ))
            )}
          </div>
          
          {/* 検索ランキング */}
          <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-500 ${searchQuery && searchResults.length > 0 ? 'opacity-100 mt-6' : 'opacity-0 pointer-events-none mt-0 h-0'}`}>
            <div className={`p-6 border-t ${t.border} flex items-center gap-3`}>
              <div className={`p-2 ${t.iconBg}`}><Activity className="w-5 h-5"/></div>
              <h3 className="font-bold text-lg">検索結果</h3>
            </div>
            <div className="px-4 pb-4 space-y-3 overflow-y-auto custom-scrollbar">
              {searchResults.map((res, idx) => (
                <div key={idx} className={`flex flex-col p-4 mx-2 transition-colors ${t.panel}`}>
                  <span className="font-bold text-sm truncate" title={res.item.text}>{res.item.text}</span>
                  <div className="flex items-center gap-3 mt-3">
                    <div className={`flex-1 h-2 ${t.barContainer}`}>
                      <div className={`h-full transition-all duration-300 ${t.barFill}`} style={{ width: `${Math.max(0, res.score * 100)}%` }} />
                    </div>
                    <span className={`text-xs font-mono w-8 text-right font-bold ${t.barText}`}>{res.score.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS: ニューモーフィズム等の定義 */}
      <style dangerouslySetInnerHTML={{__html: `
        .bg-neu { background-color: #e0e5ec; }
        
        .neu-flat {
          background: #e0e5ec;
          box-shadow: 6px 6px 12px #bec3c9, -6px -6px 12px #ffffff;
        }
        
        .neu-pressed {
          background: #e0e5ec;
          box-shadow: inset 4px 4px 8px #bec3c9, inset -4px -4px 8px #ffffff;
        }
        
        .neu-button {
          background: #e0e5ec;
          box-shadow: 4px 4px 8px #bec3c9, -4px -4px 8px #ffffff;
        }
        .neu-button:active {
          box-shadow: inset 3px 3px 6px #bec3c9, inset -3px -3px 6px #ffffff;
        }

        .neu-tile {
          background: #e0e5ec;
          box-shadow: 8px 8px 16px #bec3c9, -8px -8px 16px #ffffff;
          transition: all 0.3s ease;
        }
        .neu-tile:active, .neu-tile.is-hit {
          box-shadow: inset 6px 6px 12px #bec3c9, inset -6px -6px 12px #ffffff;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
