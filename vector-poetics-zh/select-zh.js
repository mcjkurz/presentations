(() => {
  // Slides reused from the English deck (lit-machines), translated at runtime below.
  const slideIds = ['s-reg', 's-geometry', 's-poem', 's-clf-res', 's-kqv', 's-encoder', 's-kq', 's-attn-corr', 's-align-ex', 's-3d', 's-gardenfors'];
  const translations = {
    'Parallelism': '平行對仗',
    'In the empty mountains after fresh rain, evening air turns autumn.': '新雨過後，空山清朗；傍晚的天氣已帶著秋意。',
    'The bright moon shines between the pines; a clear spring flows over the stones.': '明月映照松林，清泉流過石頭。',
    'Bamboo rustles: washerwomen head home; lotus stirs: a fishing boat sets out.': '竹林喧響，浣衣女子歸來；蓮葉搖動，漁舟順流而下。',
    'Spring’s fragrance may fade as it pleases; the noble guest is free to stay.': '任憑春芳消歇，王孫仍可自在留居。',
    'Regulated verse': '律詩',
    'Eight lines, four couplets, and strict rules of form.': '八句四聯，格律嚴謹。',
    'The middle two couplets must be parallel.': '中間兩聯必須對仗。',
    ' This is a formal requirement of the genre: line against line, word for word. ': '這是此詩體的形式要求：上下句相對，字字相應。',
    'The opening and closing couplets are free.': '首聯與尾聯不受此限。',
    ' They may be parallel, but they do not have to be.': '它們可以對仗，但並非必須。',
    'Parallelism': '平行結構',
    'duìzhàng': 'duìzhàng',
    'Landscape with ceremonial guards, two horses, and two people ploughing with an ox': '描繪儀仗隊列、兩匹馬，以及兩人以牛耕作的山水畫',
    'Keys, queries and values computed from a token embedding': '由詞元嵌入向量計算出的鍵、查詢與值',
    'Correlation between attention to first-line and second-line characters, by head, parallel vs non-parallel couplets': '按注意力頭比較上下句字詞的注意力相關性：對仗與非對仗詩聯',
    'Cover of Peter Gärdenfors, Conceptual Spaces: The Geometry of Thought': 'Peter Gärdenfors《概念空間：思想的幾何學》封面',
    ':': '：',
    'The bright moon': '明月',
    'shines': '照耀',
    'between the pines': '松間',
    ';': '；',
    'a clear spring': '清泉',
    'flows': '流淌',
    'over the stones': '石上',
    'Is this couplet': '這一聯是否',
    'parallel': '對仗？',
    '?': '？',
    'In regulated verse (律詩), two lines that pair up word for word are “parallel”. A classifier reads a couplet and returns a probability.': '在律詩中，上下兩句逐字相對便構成「對仗」。分類器讀取一聯，並輸出其為對仗的機率。',
    'classifier': '分類器',
    'SikuBERT, a BERT-based classifier fine-tuned on couplets from 140,000+ regulated poems (律詩), performs on par with GPT-4o and DeepSeek R1.': 'SikuBERT 是以 BERT 為基礎的分類器，在超過 14 萬首律詩的詩聯上微調；其表現與 GPT-4o、DeepSeek R1 相當。',
    'How well does': '效果有多',
    'it work': '好',
    'Test set: 6,153 pentasyllabic couplets from the Six Dynasties (222–589), labelled by hand: 2,072 parallel, 4,081 not.': '測試集：六朝（222–589）的 6,153 組五言詩聯，均由人工標註；其中 2,072 組為對仗，4,081 組不是。',
    'Method': '方法',
    'Accuracy': '準確率',
    'Precision': '精確率',
    'Recall': '召回率',
    'Earlier methods': '既有方法',
    'Fine-tuned SikuBERT': '微調後的 SikuBERT',
    '(couplet position as label)': '（以詩聯位置作為標籤）',
    '(filtered labels)': '（篩選後的標籤）',
    'Generative models': '生成式模型',
    'A small fine-tuned encoder': '小型微調編碼器',
    'matches the large generative models': '表現媲美大型生成式模型',
    ', and finds the most parallel couplets (recall 82.2%).': '，並能找出最多對仗詩聯（召回率 82.2%）。',
    'The': '恰到好處的',
    'result': '結果',
    'Character': '單字',
    'Couplet': '詩聯',
    'The geometry of': '「對仗」的',
    '“parallelism”': '幾何',
    'The English word comes from the Greek': '英文一詞源自希臘文',
    'parallelos': 'parallelos',
    ', “side by side”:': '，意為「並列」：',
    'a spatial image': '一種空間意象',
    '. The Chinese terms are just as spatial.': '。中文術語同樣帶有空間意象。',
    'the symmetrical formation of ceremonial processions': '儀仗隊列的對稱排列',
    'a pair of people ploughing side by side': '兩人並肩耕作',
    'two horses harnessed abreast': '兩匹馬並排駕車',
    'These images have become': '這些意象如今已成為',
    'dead metaphors': '失去鮮活感的隱喻',
    '. If parallelism is a spatial relation, perhaps we can measure it in a space.': '。若對仗是一種空間關係，或許便能在空間中測量它。',
    'Vector semantics': '向量語義學',
    'man': '男性',
    'woman': '女性',
    'king': '國王',
    'queen': '王后',
    '“female” direction': '「女性」方向',
    '“royal” direction': '「王室」方向',
    'Every word becomes a list of numbers:': '每個詞都化為一串數字：',
    'a point, an arrow': '一個點、一支箭頭',
    '. Words used alike sit close together, and a': '。用法相近的詞彼此靠近，而',
    'relation is a direction': '關係則是一個方向',
    '.': '。',
    'Vector poetics.': '向量詩學。',
    'A language model places every line in a high-dimensional space. Parallelism becomes a question of geometry: are the two verses laid out side by side?': '語言模型將每句詩置於高維空間。於是，對仗成了一個幾何問題：兩句詩是否並列排列？',
    'Keys, queries and': '鍵、查詢與',
    'Diagram: @akshay_pachaar': '圖示：@akshay_pachaar',
    'Every token embedding is multiplied by three learned matrices. The result: a': '每個詞元嵌入向量會乘上三個學得的矩陣，產生',
    'query': '查詢（query）',
    '(what this token is looking for), a': '（此詞元正在尋找的內容）、',
    'key': '鍵（key）',
    '(what it contains) and a': '（此詞元所包含的內容），以及',
    'value': '值（value）',
    '(what it will provide).': '（此詞元將提供的內容）。',
    'Attention is a match: the more a key points in the same direction as the query, the more that token is attended to.': '注意力是一種匹配：鍵與查詢的方向越一致，該詞元受到的注意力就越多。',
    'is a special token placed at the start of every input. Its query asks the whole sentence a question, and its final vector is what the classifier reads.': '是置於每個輸入開頭的特殊詞元。它的查詢向整個句子提問，最終向量則供分類器讀取。',
    'So we watch what [CLS] attends to.': '因此，我們觀察 [CLS] 將注意力放在哪裡。',
    'What happens': '分類器',
    'inside the classifier': '內部如何運作',
    'tokens': '詞元',
    'embeddings': '嵌入向量',
    'layer 1': '第 1 層',
    'layer 2': '第 2 層',
    'layer 12': '第 12 層',
    '[CLS] vector': '[CLS] 向量',
    'parallel: 0.97': '對仗：0.97',
    'Every character is re-read in the light of': '每個字都在',
    'all the others': '其他所有字的脈絡下重新解讀',
    ', layer after layer.': '，逐層進行。',
    'attends to the whole couplet and collects a summary of it.': '會注意整聯，並彙集其摘要。',
    'The classifier reads': '分類器只讀取',
    'only': '唯一的',
    'that vector: parallel or not?': '這個向量：對仗，還是不對仗？',
    'The game of': '鍵與查詢',
    'keys and queries': '的互動',
    'The bright moon shines between the pines; a clear spring flows over the stones.': '明月照松間，清泉流石上。',
    'parallel': '對仗',
    'After a fresh rain in the empty mountains, the evening weather turns to autumn.': '空山新雨後，天氣晚來秋。',
    'not parallel': '不對仗',
    'ATTENTION OF [CLS], ONE HEAD': '[CLS] 的注意力：單一注意力頭',
    'first line': '上句',
    'second line': '下句',
    'Drag the red query.': '拖曳紫色查詢。',
    ', the brighter its square. Characters of the same kind point the same way:': '方向越一致，其方格就越亮。同類的字指向相同方向：',
    '4 nouns': '4 個名詞',
    '(月 松 泉 石),': '（月 松 泉 石）、',
    '2 adjectives': '2 個形容詞',
    '(明 清),': '（明 清）、',
    '2 locatives': '2 個方位詞',
    '(間 上),': '（間 上）、',
    '2 verbs': '2 個動詞',
    '(照 流). Aim the query at one kind, and': '（照 流）。把查詢對準其中一類，',
    'both lines light up together': '上下兩句便會一起亮起',
    'A counter-example.': '反例。',
    'Here the keys of corresponding characters point in different directions. Wherever you aim the query,': '這裡對應字的鍵指向不同方向。無論把查詢指向哪裡，',
    'the two lines do not light up together': '上下兩句都不會一起亮起',
    ': nothing is aligned.': '：沒有任何對齊。',
    '.': '。',
    'Each character offers a': '每個字都提供一個',
    '; the more a key points the same way as the': '；鍵與',
    ', the brighter its square. Point the query between a pair, and': '方向越一致，其方格就越亮。將查詢指向一組配對，',
    'corresponding characters light up together': '相應的字便會一起亮起',
    ': 松 and 石, 照 and 流.': '：松與石、照與流。',
    'Matching characters': '對應字詞',
    'respond alike': '回應相似',
    'The test.': '檢驗方式：',
    'In each head, do line one and line two get attention in the same pattern? One dot is one couplet; 1.0 means an identical pattern.': '在每個注意力頭中，上下句是否以相同模式獲得注意力？每個點代表一組詩聯；1.0 表示模式完全相同。',
    'The result.': '結果：',
    'Across 5,178 test couplets,': '在 5,178 組測試詩聯中，',
    'parallel couplets': '對仗詩聯',
    ' score higher than': '的分數在每個注意力頭都高於',
    'non-parallel ones': '非對仗詩聯',
    ' in every head: matching characters offer similar keys as answers to [CLS]’s query.': '：對應字詞提供相似的鍵，以回應 [CLS] 的查詢。',
    'aligned': '對齊',
    'builds up': '逐層累積',
    'The bright moon shines between the pines': '明月照松間',
    'a clear spring flows over the stones': '清泉流石上',
    'top layer (12)': '頂層（第 12 層）',
    '· 10 characters → PCA → 3 dimensions': '・10 個字 → 主成分分析（PCA）→ 3 個維度',
    'TRANSITION ALIGNMENT ·': '轉換對齊度 ·',
    'LAYER 12 (TOP)': '第 12 層（頂層）',
    'encoded apart': '分開編碼',
    'encoded together': '共同編碼',
    'Mean cosine between the two verses’': '兩句詩之間的平均餘弦相似度；比較其',
    'step vectors': '步進向量',
    '(each character → the next), computed in the model’s full': '（從一字到下一字），並以模型完整的',
    '768 dimensions': '768 個維度',
    '. The 3D picture is only a PCA view.': '計算。三維圖僅為主成分分析（PCA）的投影。',
    'Verse one, on its own.': '只看上句。',
    ' Feed 明月松間照 to BERT by itself: its five characters trace a path through 3D space.': '將「明月松間照」單獨輸入 BERT：五個字在三維空間中形成一條路徑。',
    'Verse two, on its own.': '只看下句。',
    '清泉石上流, encoded separately, traces a different path.': '「清泉石上流」分開編碼後，形成另一條路徑。',
    'Both in one space, same positions.': '同處一個空間、位置不變。',
    ' Read apart, the paths wander independently: nothing ties 明 to 清, or 月 to 泉.': '分開閱讀時，兩條路徑各自游移：明與清、月與泉之間並無聯繫。',
    'Now read the couplet together.': '現在將詩聯一起閱讀。',
    ' The same ten characters, but each verse can see the other: the points glide, the paths line up, and the pairs (bright–clear, moon–spring, pines–stones, between–over, shines–flows) pull together.': '十個字仍然相同，但上下句可以彼此參照：點位移動、路徑對齊，字詞配對（明–清、月–泉、松–石、間–上、照–流）也彼此靠攏。',
    'Parallelism is not in the characters.': '對仗並非存在於單字之中。',
    ' It appears only when the verses see each other, and it builds up in the top layers.': '只有當上下句彼此參照時，對仗才浮現，並在較高層逐漸形成。',
    'drag to rotate · scroll to zoom ·': '拖曳旋轉・捲動縮放・',
    'layer': '圖層',
    'layer ·': '圖層 ·',
    'auto-rotate ·': '自動旋轉・',
    'reset': '重設',
    'Language discretizes,': '語言將經驗離散化，',
    'parallelism reconnects': '對仗則重新連結',
    'continuous, undivided experience': '連續而未分化的經驗',
    'Experience is continuous.': '經驗是連續的。',
    'A conceptual space is built from': '概念空間由',
    'quality dimensions': '性質維度',
    ' such as colour, size or force.': '建構而成，例如色彩、大小或力量。',
    'Language discretizes it.': '語言將經驗離散化。',
    'The space is cut, region by region, into convex cells: a': '空間被逐區切分為凸形區域，形成',
    'Voronoi tessellation': 'Voronoi 鑲嵌',
    '.': '。',
    'The central point of each cell is a': '每個區域的中心點稱為',
    'prototype': '原型',
    ', and a word names the region.': '，而詞語為該區域命名。',
    'Parallelism bridges regions.': '對仗連結不同區域。',
    ' It pairs words from separate regions (moon–spring, pines–stones, wind–water) along a shared dimension, momentarily gesturing towards the': '它沿著共享的維度配對來自不同區域的詞語（月–泉、松–石、風–水），短暫指向',
    'undifferentiated unity': '尚未分化的整體',
    'beneath the divisions.': '，亦即各種區分之下的統一。',
    'I/O + SymNet': 'I/O + SymNet',
    'Moonshot AI (v1-8k)': 'Moonshot AI（v1-8k）',
    'Peter Gärdenfors,': 'Peter Gärdenfors，',
    'Conceptual Spaces: The Geometry of Thought': '《概念空間：思想的幾何學》',
    'Gärdenfors,': 'Gärdenfors，',
    'Conceptual Spaces': '《概念空間》',
    '(2000) and': '（2000）及',
    'The Geometry of Meaning': '《意義的幾何學》',
    '(2014); Kurzynski, Xu, and Feng,': '（2014）；Kurzynski、Xu 與 Feng，',
    '19.2 (2025); Kurzynski, EADH 2026.': '19.2（2025）；Kurzynski，EADH 2026。',
    'What does “': '「',
    '” look like?': '」看起來是什麼樣子？',
    'Read each verse as a path through a 3D meaning space, one character at a time. At each step, ask: do the two paths move in the same direction?': '將每句詩視為穿越三維語義空間的一條路徑，逐字前進。每一步都問：兩條路徑是否朝同一方向移動？',
    'Misaligned': '未對齊',
    'Aligned': '已對齊',
    'Misaligned.': '未對齊。',
    ' Each verse wanders its own way: the steps of the two paths point in different, often opposite, directions.': '兩句各行其是：兩條路徑的步向各異，甚至常常相反。',
    'Aligned.': '已對齊。',
    ' Matching steps point the same way: the two verses move in parallel, which is what parallelism means geometrically.': '對應步向一致：兩句詩平行移動，這正是對仗在幾何上的意義。',
  };
  const cjk = /[\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/;
  const normalize = text => text.replace(/\s+/g, ' ').trim();
  const selected = new Set(slideIds);
  const translationMap = Object.fromEntries(
    Object.entries(translations).map(([source, translated]) => [normalize(source), translated]),
  );

  function localize(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('[data-keep-en]')) continue;
      const source = normalize(node.nodeValue);
      if (!source) continue;
      let translated = translationMap[source];
      if (!translated) {
        const pair = source.match(/^pair ([1-5]) of 5: (.+)$/);
        if (pair) {
          const names = ['遠–晴', '芳–翠', '侵–接', '古–荒', '道–城'];
          translated = `第 ${pair[1]} 組（${names[+pair[1] - 1]}）`;
        } else {
          const layer = source.match(/^LAYER (\d+)( \(TOP\))?$/);
          if (layer) translated = `第 ${layer[1]} 層${layer[2] ? '（頂層）' : ''}`;
        }
      }
      if (translated !== undefined) {
        const whitespace = node.nodeValue.match(/^\s*/)[0];
        const trailing = node.nodeValue.match(/\s*$/)[0];
        node.nodeValue = whitespace + translated + trailing;
      }
    }
    // second pass, once everything is Chinese: no space between two Chinese characters
    // (the English spacing around inline emphasis survives translation otherwise); a word label followed by
    // its character (國王 王 in the vector-semantics figure) keeps its space
    const lastChar = n => { const t = n && n.textContent; return t ? t[t.length - 1] : ''; };
    const firstChar = n => { const t = n && n.textContent; return t ? t[0] : ''; };
    const isGloss = n => n && n.nodeType === 1 && n.classList.contains('zh') && n.closest('svg');
    const w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while ((node = w2.nextNode())) {
      if (isGloss(node.nextSibling) || isGloss(node.previousSibling) || !/^\s|\s$/.test(node.nodeValue)) continue;
      const v = node.nodeValue, body = v.trim();
      const before = lastChar(node.previousSibling), after = firstChar(node.nextSibling);
      if (!body) { if (cjk.test(before) && cjk.test(after)) node.nodeValue = ''; continue; }
      // full-width punctuation (：、，。（）) needs no space on either side, whatever comes next to it
      const punct = /[\u3000-\u303f\uff00-\uffef]/;
      let out = v;
      if ((cjk.test(before) && cjk.test(body[0])) || punct.test(before) || punct.test(body[0])) out = out.replace(/^\s+/, '');
      if ((cjk.test(after) && cjk.test(body[body.length - 1])) || punct.test(after) || punct.test(body[body.length - 1])) out = out.replace(/\s+$/, '');
      node.nodeValue = out;
    }
    root.querySelectorAll('[alt], [title], [aria-label]').forEach(el => {
      for (const attr of ['alt', 'title', 'aria-label']) {
        const value = el.getAttribute(attr);
        if (value && translationMap[normalize(value)]) el.setAttribute(attr, translationMap[normalize(value)]);
      }
    });
  }

  document.documentElement.lang = 'zh-Hant';
  selected.forEach(id => {
    const slide = document.getElementById(id);
    slide.classList.add('nokicker');
    slide.dataset.sec = 'pair';
  });
  slideIds.forEach(id => localize(document.getElementById(id)));

  for (const id of slideIds) {
    const hook = window.HOOKS[id];
    if (!hook) continue;
    for (const method of ['enter', 'render', 'key']) {
      if (typeof hook[method] !== 'function') continue;
      const original = hook[method];
      hook[method] = function (...args) {
        const result = original.apply(this, args);
        localize(document.getElementById(id));
        return result;
      };
    }
  }
  document.getElementById('s-kq').addEventListener('click', () => {
    requestAnimationFrame(() => localize(document.getElementById('s-kq')));
  });
})();
