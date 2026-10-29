/* UI translations only. The book, article text and citations remain in Simplified Chinese.
   No text-node replacement: index.html applies explicit keys to interface elements. */
(function (global) {
  'use strict';
  const SUPPORTED = Object.freeze(['zh-Hans', 'zh-Hant', 'en']);
  // One row per key keeps all three dictionaries complete and easy to review.
  const rows = [
    ['app.title', '人生通关手册', '人生通關手冊', 'Game Plan for Life'],
    ['app.fullTitle', '人生通关手册 · 先看打法再上场', '人生通關手冊 · 先看打法再上場', 'Game Plan for Life · Evidence and practical choices'],
    ['app.subtitle', '先看打法再上场', '先看打法再上場', 'Plan your next move'],
    ['app.edition', '迭代版', '持續更新版', 'Updated edition'],
    ['language.label', '界面语言', '介面語言', 'Interface language'],
    ['language.note', '语言切换只影响界面，正文和来源保留简体中文。', '語言切換只影響介面，正文與來源保留簡體中文。', 'Language changes the interface only. Articles and sources remain in Simplified Chinese.'],
    ['language.switched', '界面语言已切换', '介面語言已切換', 'Interface language changed'],
    ['language.zh-Hans', '简体中文', '简体中文', '简体中文'],
    ['language.zh-Hant', '繁體中文', '繁體中文', '繁體中文'],
    ['language.en', 'English', 'English', 'English'],
    ['nav.open', '打开目录和筛选', '開啟目錄與篩選', 'Open contents and filters'],
    ['nav.close', '关闭目录和筛选', '關閉目錄與篩選', 'Close contents and filters'],
    ['nav.title', '目录和筛选', '目錄與篩選', 'Contents & filters'],
    ['nav.skip', '跳到正文与检索结果', '跳到正文與搜尋結果', 'Skip to articles and results'],
    ['nav.readme', '查看 README', '查看 README', 'Read the README'],
    ['nav.github', 'GitHub 仓库', 'GitHub 儲存庫', 'GitHub repository'],
    ['search.heading', '先搜眼前的问题', '先搜尋眼前的問題', 'What do you need help with?'],
    ['search.label', '关键词搜索', '關鍵字搜尋', 'Keyword search'],
    ['search.inputLabel', '搜索条目，空格分隔多个关键词', '搜尋條目，多個關鍵字請用空格分開', 'Search entries; separate keywords with spaces'],
    ['search.placeholder', '输入关键词', '輸入關鍵字', 'Enter keywords'],
    ['search.button', '搜索', '搜尋', 'Search'],
    ['search.clear', '清除搜索词', '清除搜尋詞', 'Clear search'],
    ['search.hint', '多个关键词用空格隔开，每个词都要匹配。', '多個關鍵字請用空格分開，每個詞都要符合。', 'Separate keywords with spaces. All keywords must match.'],
    ['search.aliasHint', '支持常见繁体词和英文主题词，正文保留简体。', '支援常見繁體詞與英文主題詞，正文保留簡體。', 'Common English and Traditional Chinese topic words are supported. Articles stay in Simplified Chinese.'],
    ['search.examples', '主题', '主題', 'Topics'],
    ['search.query', '搜索：{query}', '搜尋：{query}', 'Search: {query}'],
    ['example.ai', 'AI', 'AI', 'AI'],
    ['example.design', '设计', '設計', 'Design'],
    ['example.art', '艺术', '藝術', 'Art'],
    ['example.animation', '动画', '動畫', 'Animation'],
    ['example.anxiety', '焦虑', '焦慮', 'Anxiety'],
    ['example.career', '职业', '職業', 'Careers'],
    ['example.rent', '租房', '租屋', 'Rent'],
    ['search.preset.ai', 'AI', 'AI', 'AI'],
    ['search.preset.design', '设计', '設計', 'Design'],
    ['search.preset.art', '艺术', '藝術', 'Art'],
    ['search.preset.animation', '动画', '動畫', 'Animation'],
    ['search.preset.jobs', '职业', '職業', 'Careers'],
    ['filter.title', '按成本和证据筛选', '按成本與證據篩選', 'Filter by cost and evidence'],
    ['filter.help', '同一组多选是「或」，不同组之间是「且」。', '同一組多選是「或」，不同組之間是「且」。', 'Within a group, any selected option can match. Across groups, every group must match.'],
    ['filter.multi', '可多选', '可複選', 'Select multiple'],
    ['filter.selected', '已选 {count} 项', '已選 {count} 項', '{count} selected'],
    ['filter.clear', '清空筛选', '清除篩選', 'Clear filters'],
    ['filter.allChapters', '全部章节', '全部章節', 'All sections'],
    ['filter.chapters', '章节', '章節', 'Sections'],
    ['filter.chapterHint', '选一节阅读', '選一節閱讀', 'Read one section'],
    ['filter.part', '篇', '篇', 'Parts'],
    ['filter.partHint', '点击跳到该篇', '點選跳到該篇', 'Jump to a part'],
    ['filter.ratio', '性价比', '成本效益', 'Value for effort'],
    ['filter.ratioHint', '作者判断，同口径内可比', '作者判斷，限同類收益比較', 'Author’s assessment; compare the same outcome'],
    ['filter.lens', '换回什么', '換回什麼', 'What you gain'],
    ['filter.lensHint', '口径，不跨口径比较', '收益種類，彼此不換算', 'Different outcomes are measured separately'],
    ['filter.grade', '证据等级', '證據等級', 'Evidence level'],
    ['filter.gradeHint', 'A 数字 · B 研究 · C 经验', 'A 數據 · B 研究 · C 經驗', 'A: quantified · B: research · C: experience'],
    ['filter.money', '花钱', '花錢', 'Money cost'],
    ['filter.time', '花时间', '花時間', 'Time cost'],
    ['filter.will', '要毅力', '要毅力', 'Ongoing effort'],
    ['filter.dispute', '只看标了争议的', '只看標有爭議的', 'Show disputed evidence only'],
    ['filter.todo', '只看有待核实的', '只看有待查證的', 'Show entries awaiting verification'],
    ['filter.hintChapters', '章节一次只看一个，成本和等级可多选。', '章節一次只看一個，成本與等級可複選。', 'Read one section at a time, or select multiple cost and evidence options.'],
    ['filter.hintOrder', '检索不改变条目顺序。篇名用于跳转，不会隐藏其他篇。', '搜尋不改變條目順序。篇名用來跳轉，不會隱藏其他篇。', 'Search keeps the reading order. Part links navigate without hiding other parts.'],
    ['filter.hintSource', '正文与标签来自 book/ 下的 {count} 个文件。', '正文與標籤來自 book/ 下的 {count} 個檔案。', 'Articles and labels come from {count} files in book/.'],
    ['results.view', '查看 {count} 条结果', '查看 {count} 條結果', 'View {count} results'],
    ['results.count', '{count} 条结果', '{count} 條結果', '{count} results'],
    ['results.summary', '当前显示 {shown} 条，共 {total} 条', '目前顯示 {shown} 條，共 {total} 條', 'Showing {shown} of {total} entries'],
    ['results.showing', '当前显示', '目前顯示', 'Showing'],
    ['results.of', '条，共', '條，共', 'of'],
    ['results.unit', '条', '條', 'entries'],
    ['results.selected', '已选条件', '已選條件', 'Active filters'],
    ['results.selectionSummary', '{count} 条结果 · 已选条件', '{count} 條結果 · 已選條件', '{count} results · Active filters'],
    ['results.remove', '移除{name}', '移除{name}', 'Remove {name}'],
    ['results.clearAll', '清空全部', '全部清除', 'Clear all'],
    ['results.region', '正文与检索结果', '正文與搜尋結果', 'Articles and search results'],
    ['results.token', '{name}：{value}', '{name}：{value}', '{name}: {value}'],
    ['empty.title', '没有匹配的条目', '沒有符合的條目', 'No matching entries'],
    ['empty.hint', '可以点条件旁的 × 逐项撤销，或换个更短的关键词。多个关键词请用空格隔开。', '可點條件旁的 × 逐項移除，或換較短的關鍵字。多個關鍵字請用空格分開。', 'Remove a filter with ×, or try a shorter keyword. Separate multiple keywords with spaces.'],
    ['loading.body', '正在读取正文…', '正在讀取正文…', 'Loading articles…'],
    ['loading.progress', '正在读取正文 {done}/{total}', '正在讀取正文 {done}/{total}', 'Loading articles {done}/{total}'],
    ['loading.retry', '重新加载正文', '重新載入正文', 'Retry loading articles'],
    ['loading.network', '网络中断，正文还没读完。已读取的内容会保留，重试时接着加载。', '網路中斷，正文尚未讀完。已讀取的內容會保留，重試時會繼續載入。', 'The connection was interrupted. Loaded files are kept so you can continue by retrying.'],
    ['loading.error', '正文暂时无法读取，可以重试或从 README 查阅。', '正文暫時無法讀取，可以重試或從 README 查閱。', 'Articles could not be loaded. Retry or use the README to browse them.'],
    ['loading.file', '当前文件需要联网读取正文。请打开在线阅读页，或从 README 下载可直接打开的离线单文件版。', '目前的檔案需要連線讀取正文。請開啟線上閱讀頁，或從 README 下載可直接開啟的離線單檔版。', 'This file needs an online connection to load articles. Open the website or download the offline HTML edition from the README.'],
    ['loading.readme', '查看 README', '查看 README', 'Read the README'],
    ['loading.online', '打开在线阅读页', '開啟線上閱讀頁', 'Open the website'],
    ['theme.toggle', '切换深色模式', '切換深色模式', 'Toggle dark mode'],
    ['theme.light', '切换浅色模式', '切換淺色模式', 'Switch to light mode'],
    ['theme.dark', '切换深色模式', '切換深色模式', 'Switch to dark mode'],
    ['doc.openGithub', '在 GitHub 打开', '在 GitHub 開啟', 'Open on GitHub'],
    ['doc.close', '关闭长文', '關閉長文', 'Close article'],
    ['doc.jump', '跳到章节', '跳到章節', 'Jump to section'],
    ['doc.chapters', '长文章节', '長文章節', 'Article contents'],
    ['doc.body', '长文正文', '長文正文', 'Article text'],
    ['doc.loading', '正在读取…', '正在讀取…', 'Loading…'],
    ['doc.error', '读不到这篇长文。可以重新读取，或用上方按钮在 GitHub 打开。', '無法讀取這篇長文。可以重試，或用上方按鈕在 GitHub 開啟。', 'This article could not be loaded. Retry or use the button above to open it on GitHub.'],
    ['doc.retry', '重新读取', '重新讀取', 'Retry'],
    ['doc.unavailable', '暂时无法读取', '暫時無法讀取', 'Currently unavailable'],
    ['doc.noChapters', '没有章节目录', '沒有章節目錄', 'No section headings'],
    ['doc.untitled', '长文', '長文', 'Article'],
    ['field.cost', '成本', '成本', 'Cost'],
    ['field.human', '说人话', '白話說明', 'In plain language'],
    ['field.gain', '收益', '收益', 'Benefit'],
    ['field.grade', '证据等级', '證據等級', 'Evidence level'],
    ['field.source', '来源', '來源', 'Sources'],
    ['field.note', '备注', '備註', 'Notes'],
    ['badge.grade', '证据 {value} 级', '證據 {value} 級', 'Evidence {value}'],
    ['badge.ratio', '性价比 {value}', '成本效益 {value}', 'Value: {value}'],
    ['badge.dispute', '争议', '爭議', 'Disputed'],
    ['badge.todo', '含待核实', '含待查證內容', 'Awaiting verification'],
    ['badge.sourceCount', ' · {count} 条', ' · {count} 條', ' · Sources: {count}'],
    ['badge.ratioHelp', '作者判断：由收益量级（{level}）和三项成本合成，只在同一口径（{lens}）内可比，与证据等级无关', '作者判斷：由收益量級（{level}）與三項成本合成，只能比較同類收益（{lens}），與證據等級無關', 'Author’s assessment based on benefit size ({level}) and three costs. Compare only the same outcome ({lens}); evidence level is separate.'],
    ['badge.ratioHint', '作者判断：由收益量级（{value}）和三项成本合成，只在同一口径（{name}）内可比，与证据等级无关', '作者判斷：由收益量級（{value}）與三項成本合成，只能比較同類收益（{name}），與證據等級無關', 'Author’s assessment based on benefit size ({value}) and three costs. Compare only the same outcome ({name}); evidence level is separate.'],
    ['xref.go', '跳过去', '跳到該處', 'Go to entry'],
    ['xref.section', '第 {section} 节第 {entry} 条', '第 {section} 節第 {entry} 條', 'Section {section}, entry {entry}'],
    ['xref.count', '整节，共 {count} 条', '整節，共 {count} 條', 'Full section · {count} entries'],
    ['xref.entry', '第 {section} 节第 {number} 条', '第 {section} 節第 {number} 條', 'Section {section}, entry {number}'],
    ['xref.link', '本条链接', '本條連結', 'Link to this entry'],
    ['xref.fold', '展开或收起本节目录', '展開或收合本節目錄', 'Expand or collapse section contents'],
    ['xref.none', '没有符合当前筛选的条目', '沒有符合目前篩選的條目', 'No entries match the current filters'],
    ['topic.title', 'AI时代的学习与职业选择', 'AI時代的學習與職業選擇', 'Learning and careers in the AI era'],
    ['topic.description', '学生焦虑、职业变化，以及设计、艺术、动画专业的准备办法', '學生焦慮、職業變化，以及設計、藝術、動畫科系的準備方法', 'Student anxiety, changing work, and practical steps for design, art and animation students'],
    ['topic.read', '阅读专题 →', '閱讀專題 →', 'Read the guide →'],
    ['hero.intro', '把人生当一局游戏来打：每一节是一张地图，每一条攻略都写明花掉什么、换回什么、证据有多硬。', '把人生當一局遊戲來玩：每一節是一張地圖，每一條攻略都寫明要付出什麼、換回什麼，以及證據有多可靠。', 'A practical guide to life’s choices. Each entry states the cost, the possible benefit and the strength of the evidence.'],
    ['hero.help', '先搜眼前的问题，或从目录选一节。想找省力的做法，可以展开筛选，选「不花钱」和「不用毅力」。挑走一两条就算数。', '先搜尋眼前的問題，或從目錄選一節。想找省力的做法，可展開篩選，選「不花錢」與「不用毅力」。挑一兩條來做就算數。', 'Search for a current concern, or choose a section. For easier actions, filter for no money cost and no ongoing effort. Trying one or two is enough.'],
    ['guide.title', '怎么读、怎么看证据', '怎麼讀、怎麼看證據', 'How to read this guide'],
    ['guide.item1', '这是一份备选单，不是任务清单。作者自己也没做到其中大部分。', '這是一份備選清單，不是任務表。作者自己也沒有做到其中大部分。', 'These are options, not assignments. The author has not followed most of them either.'],
    ['guide.item2', '每条先看「说人话」，再看成本、收益与备注。有疑问时展开来源，核对原始证据。', '每條先看「白話說明」，再看成本、收益與備註。有疑問時展開來源，核對原始證據。', 'Start with the plain-language explanation, then read the cost, benefit and notes. Expand Sources to check the original evidence.'],
    ['guide.item3', '收益分四档算：你自己、配偶和直系亲属、朋友同事、陌生人。帮助陌生人的回报期望较小，也要考虑风险。', '收益分四類計算：你自己、配偶與直系親屬、朋友同事、陌生人。幫助陌生人的預期回報較小，也要考慮風險。', 'Benefits are considered separately for you, close family, friends or colleagues, and strangers. Helping strangers has a lower expected personal return and may involve risks.'],
    ['guide.item4', '正文里带虚线的「第 X 条」可以点开，就地看那条写了什么。', '正文中有虛線的「第 X 條」可以點開，直接查看該條內容。', 'Select a dotted entry reference to preview it without leaving your place.'],
    ['gloss.title', '看不懂的缩写和名词', '看不懂的縮寫與名詞', 'Abbreviations and terms'],
    ['gloss.help', '正文里带虚线的词，点一下或把鼠标放上去就有解释。全表如下。', '正文中有虛線的詞，點選或移入滑鼠即可查看說明。完整列表如下。', 'Select or hover over a dotted term for its explanation. The full glossary follows in Simplified Chinese.'],
    ['meter.entries', 'HP 条目', 'HP 條目', 'HP Entries'],
    ['meter.evidence', 'MP A级', 'MP A級', 'MP Grade A'],
    ['docs.label', '长文', '長文', 'Guides'],
    ['docs.helpStranger', '遇到陌生人出事该不该停', '遇到陌生人出事該不該停', 'Helping a stranger in an emergency'],
    ['docs.emergency', '家庭应急装备清单', '家庭緊急用品清單', 'Home emergency supplies'],
    ['docs.marriage', '结婚划不划算', '結婚划不划算', 'The costs and benefits of marriage'],
    ['docs.platform', '做平台要办哪些证', '經營平台需要哪些許可', 'Permits for running a platform'],
    ['docs.nightShift', '生物钟和夜班', '生理時鐘與夜班', 'Body clocks and night shifts'],
    ['docs.records', '来源核实记录', '來源查證紀錄', 'Source verification records'],
    ['docs.aiLabel', 'AI 助手', 'AI 助手', 'AI assistant'],
    ['docs.aiSetup', '让 Claude Code 或 Codex 照这本书回答你的问题（skill 装法）', '讓 Claude Code 或 Codex 根據這本書回答問題（skill 安裝方式）', 'Set up Claude Code or Codex to answer using this book'],
    ['links.longform', '长文', '長文', 'Guides'],
    ['links.aiAssistant', 'AI 助手', 'AI 助手', 'AI assistant'],
    ['links.skill', '让 Claude Code 或 Codex 照这本书回答你的问题（skill 装法）', '讓 Claude Code 或 Codex 根據這本書回答問題（skill 安裝方式）', 'Set up Claude Code or Codex to answer using this book'],
    ['links.verification', '来源核实记录', '來源查證紀錄', 'Source verification records'],
    ['links.doc.emergency', '家庭应急装备清单', '家庭緊急用品清單', 'Home emergency supplies'],
    ['links.doc.stranger', '遇到陌生人出事该不该停', '遇到陌生人出事該不該停', 'Helping a stranger in an emergency'],
    ['links.doc.marriage', '结婚划不划算', '結婚划不划算', 'The costs and benefits of marriage'],
    ['links.doc.platform', '做平台要办哪些证', '經營平台需要哪些許可', 'Permits for running a platform'],
    ['links.doc.shift', '生物钟和夜班', '生理時鐘與夜班', 'Body clocks and night shifts'],
    ['history.title', '历史更新记录（2026-09，正文保留简体）', '歷次更新紀錄（2026-09，內容保留簡體）', 'Edition history (2026-09, in Simplified Chinese)'],
    ['changelog.title', '本迭代版改了什么（KINGKAZMAX，2026-09）', '這個版本更新了什麼（KINGKAZMAX，2026-09）', 'What changed in this edition (KINGKAZMAX, 2026-09)'],
    ['changelog.sections', '章节 33 → 53 节：新增第 34—53 节共 20 个章节', '章節 33 → 53 節：新增第 34—53 節，共 20 節', 'Sections: 33 → 53, adding 20 sections numbered 34–53.'],
    ['changelog.entries', '内容 615 → 916 条（当时净增 301 条），其中 7 条整编自同类公开项目；原 33 节持续修正来源与数字。', '內容 615 → 916 條（當時淨增 301 條），其中 7 條整理自同類公開專案；原 33 節持續修正來源與數字。', 'Entries: 615 → 916 at that update, a net increase of 301; seven were adapted from related public projects. Sources and figures in the original 33 sections continue to be revised.'],
    ['changelog.topics', '体系：补充健康管理、钱、关系与心态、生命周期、方法与查证。', '架構：補充健康管理、金錢、關係與心態、人生階段、方法與查證。', 'Topics added: health management, money, relationships and wellbeing, life stages, and ways to check evidence.'],
    ['changelog.navigation', '导航：目录与正文按六篇分组。篇名用于跳转，不隐藏其他内容；节号保持不变。', '導覽：目錄與正文分為六篇。篇名用來跳轉，不隱藏其他內容；節號維持不變。', 'Navigation: six parts organize the contents and articles. Part links navigate without hiding content; section numbers stay unchanged.'],
    ['footer.note', '书里的内容可能过时，也可能有错。不少政策各地执行不一样。真去办事、看病、打官司时，以当地部门、医生和律师的说法为准。发现写错了，欢迎', '書中內容可能過時，也可能有誤。不少政策的各地做法不同。實際辦事、就醫或訴訟時，以當地機關、醫師和律師的說法為準。發現錯誤，歡迎', 'This book may contain errors or outdated information. Policies can differ by location. For real decisions, check with the relevant local authority, doctor or lawyer. To report an error,'],
    ['footer.report', '提 issue', '提出 issue', 'open an issue'],
    ['footer.evidence', '数字口径以条目内标注为准。寿命、时间精力、金钱与人身自由分别计算，互不换算。来源核实过程见', '數字的定義以各條目標示為準。壽命、時間精力、金錢與人身自由分別計算，彼此不換算。來源查證過程見', 'Check each entry for how its figures are defined. Lifespan, time and energy, money, and legal rights are measured separately. For source checks, see'],
    ['footer.license', 'Unlicense，公有领域。', 'Unlicense，公有領域。', 'Unlicense; public domain.'],
    ['footer.disclaimer', '书里的内容可能过时，也可能有错。不少政策各地执行不一样。真去办事、看病、打官司时，以当地部门、医生和律师的说法为准。发现写错了，欢迎通过以下入口反馈：', '書中內容可能過時，也可能有誤。不少政策的各地做法不同。實際辦事、就醫或訴訟時，以當地機關、醫師和律師的說法為準。發現錯誤，歡迎由以下入口反映：', 'This book may contain errors or outdated information. Policies can differ by location. Check real decisions with the relevant local authority, doctor or lawyer. Report errors through '],
    ['footer.provenance', '寿命、时间精力、金钱和人身自由分别计算，互不换算。来源核实过程见', '壽命、時間精力、金錢與人身自由分別計算，彼此不換算。來源查證過程見', 'Lifespan, time and energy, money, and legal rights are measured separately. For source checks, see '],
    ['footer.offline', '离线副本生成于 {date}，版本 {commit}。联网时可到在线页面查看更新。', '離線副本建立於 {date}，版本 {commit}。連線時可到線上頁面查看更新。', 'Offline copy built {date}, version {commit}. Visit the website when online for updates.'],
    ['value.ratio.极高', '极高', '極高', 'Very high'],
    ['value.ratio.高', '高', '高', 'High'],
    ['value.ratio.一般', '一般', '一般', 'Moderate'],
    ['value.lens.死亡率', '寿命', '壽命', 'Lifespan'],
    ['value.lens.金钱', '钱', '金錢', 'Money'],
    ['value.lens.时间', '时间精力', '時間精力', 'Time & energy'],
    ['value.lens.自由', '人身自由', '人身自由', 'Rights & freedom'],
    ['value.grade.A', 'A 级', 'A 級', 'Grade A'],
    ['value.grade.B', 'B 级', 'B 級', 'Grade B'],
    ['value.grade.C', 'C 级', 'C 級', 'Grade C'],
    ['value.money.0', '不花钱', '不花錢', 'No money cost'],
    ['value.money.少', '花少量钱', '花少量錢', 'Low cost'],
    ['value.money.多', '花不少钱', '花不少錢', 'Higher cost'],
    ['value.time.少', '顺手', '順手', 'A quick action'],
    ['value.time.中', '花几小时', '花幾小時', 'A few hours'],
    ['value.time.多', '每天占时间', '每天占時間', 'Time every day'],
    ['value.will.否', '不用毅力', '不用毅力', 'No ongoing effort'],
    ['value.will.些', '要一点毅力', '需要一些毅力', 'Some effort'],
    ['value.will.是', '要很多毅力', '需要持續毅力', 'Sustained effort'],
    ['value.level.大', '大', '大', 'Large'],
    ['value.level.中', '中', '中', 'Medium'],
    ['value.level.小', '小', '小', 'Small'],
    ['part.hp.title', '血条', '血條', 'Health'],
    ['part.hp.tag', 'HP', 'HP', 'HP'],
    ['part.hp.sub', '先保住血条', '先保住血條', 'Guard your health and survival'],
    ['part.gold.title', '金币', '金幣', 'Money'],
    ['part.gold.tag', 'Gold', 'Gold', 'Gold'],
    ['part.gold.sub', '攒住你的金币', '存好你的金幣', 'Protect your money and livelihood'],
    ['part.ban.title', '红线', '紅線', 'Safety'],
    ['part.ban.tag', 'No-Ban', 'No-Ban', 'No-Ban'],
    ['part.ban.sub', '别吃红牌下场', '別吃紅牌下場', 'Stay safe and protect your rights'],
    ['part.coop.title', '组队', '組隊', 'Relationships'],
    ['part.coop.tag', 'Co-op', 'Co-op', 'Co-op'],
    ['part.coop.sub', '拉一支固定队', '組一支固定隊伍', 'Build lasting relationships'],
    ['part.buff.title', '状态', '狀態', 'Wellbeing'],
    ['part.buff.tag', 'Buffs', 'Buffs', 'Buffs'],
    ['part.buff.sub', '保持好状态', '保持好狀態', 'Look after your energy and wellbeing'],
    ['part.quest.title', '主线', '主線', 'Life stages'],
    ['part.quest.tag', 'Main Quest', 'Main Quest', 'Main Quest'],
    ['part.quest.sub', '走过每一个人生关口', '走過每一個人生關卡', 'Navigate major life transitions'],
    ['section.1', '不要早死', '不要早死', 'Avoid preventable early death'],
    ['section.2', '不要慢慢死', '不要慢慢死', 'Reduce long-term health risks'],
    ['section.3', '不要浪费精力', '不要浪費精力', 'Protect your energy'],
    ['section.4', '不要浪费时间', '不要浪費時間', 'Use your time well'],
    ['section.5', '不要浪费钱', '不要浪費錢', 'Avoid wasting money'],
    ['section.6', '反面清单', '反面清單', 'Choices that offer poor value'],
    ['section.7', '没钱的时候怎么活', '沒錢的時候怎麼生活', 'Getting by when money runs out'],
    ['section.8', '别把自己搭进去：法律与财产安全', '別把自己搭進去：法律與財產安全', 'Protecting your rights and property'],
    ['section.9', '普通人容易踩的法律红线', '一般人容易踩到的法律紅線', 'Everyday legal pitfalls'],
    ['section.10', '恋爱和结婚划不划算', '戀愛與結婚划不划算', 'The costs and benefits of relationships and marriage'],
    ['section.11', '程序员和技术人容易踩的红线', '程式設計師與技術人員容易踩到的紅線', 'Legal pitfalls for programmers and technical workers'],
    ['section.12', '创业与做生意：别把家底赔进去', '創業與做生意：別把家底賠進去', 'Starting a business without risking everything'],
    ['section.13', '紧急情况：先做什么', '緊急情況：先做什麼', 'Emergencies: what to do first'],
    ['section.14', '账号与信息安全', '帳號與資訊安全', 'Account and information security'],
    ['section.15', '租房与买房', '租屋與買房', 'Renting and buying a home'],
    ['section.16', '得了慢性病之后怎么活', '罹患慢性病之後怎麼生活', 'Living with a chronic condition'],
    ['section.17', '家里有老人', '家裡有長輩', 'Caring for older family members'],
    ['section.18', '养孩子划不划算', '養育孩子的成本與收益', 'The costs and benefits of raising children'],
    ['section.19', '在职、离职和工伤', '在職、離職與職災', 'Employment, leaving a job and workplace injuries'],
    ['section.20', '刚出生的孩子怎么带', '新生兒怎麼照顧', 'Caring for a newborn'],
    ['section.21', '出国、旅行与境外安全', '出國、旅行與海外安全', 'Travel and safety abroad'],
    ['section.22', '怎么放松：娱乐场所和减压', '怎麼放鬆：娛樂場所與減壓', 'Leisure and stress relief'],
    ['section.23', '学什么技能划算', '學什麼技能值得', 'Choosing skills worth learning'],
    ['section.24', '看病：怎么少花钱少走弯路', '就醫：怎麼省錢、少走冤枉路', 'Getting medical care with less cost and confusion'],
    ['section.25', '人走了以后要办什么', '親友過世後要辦什麼', 'Practical steps after a death'],
    ['section.26', '做一个网站或平台：资质、备案和服务器', '經營網站或平台：資格、備案與伺服器', 'Running a website: permits, registration and hosting'],
    ['section.27', '怀孕和生产：从发现怀孕到出院办证', '懷孕與生產：從確認懷孕到出院辦證', 'Pregnancy and childbirth: care and paperwork'],
    ['section.28', '别为了外形把身体搞坏', '別為了外表傷害身體', 'Appearance choices that protect your health'],
    ['section.29', '遭遇重大打击之后', '遭遇重大打擊之後', 'After a major life crisis'],
    ['section.30', '上学以后的孩子', '上學以後的孩子', 'Children through the school years'],
    ['section.31', '十八岁之后有哪几条路', '十八歲之後有哪些路可走', 'Your options after turning eighteen'],
    ['section.32', '出国留学：身份、打工、保险和回国认证', '出國留學：身分、打工、保險與回國認證', 'Studying abroad: status, work, insurance and recognition'],
    ['section.33', '残疾之后怎么活', '有了身心障礙之後怎麼生活', 'Living with a disability'],
    ['section.34', '体检与筛查：不同年龄查什么', '健檢與篩檢：不同年齡查什麼', 'Health checks and screening by age'],
    ['section.35', '保险：怎么配、怎么买、怎么赔', '保險：怎麼規劃、投保與理賠', 'Insurance: coverage, purchase and claims'],
    ['section.36', '人情世故：随礼、求人与还情', '人情往來：送禮、請託與回報', 'Social obligations, gifts and asking for help'],
    ['section.37', '和机构打交道：证件、热线与投诉', '與機關打交道：證件、專線與申訴', 'Dealing with institutions: documents and complaints'],
    ['section.38', '人生时间表：几岁做什么，窗口期在哪', '人生時間表：幾歲做什麼、時機在哪裡', 'Life timing: milestones and windows of opportunity'],
    ['section.39', '一生值得做的事：体验与告别清单', '一生值得做的事：體驗與告別清單', 'Meaningful experiences and conversations before goodbye'],
    ['section.40', '前人吃过的亏：后悔与败局研究', '前人吃過的虧：後悔與挫敗研究', 'Learning from regrets and setbacks'],
    ['section.41', '经得起验证的老智慧', '經得起驗證的老智慧', 'Traditional wisdom tested against evidence'],
    ['section.42', '幸福科学：怎样算过得好', '幸福科學：怎樣算過得好', 'The science of wellbeing'],
    ['section.43', '心态与通透：比较、焦虑与意义', '心態與理解：比較、焦慮與意義', 'Comparison, anxiety and meaning'],
    ['section.44', '职业怎么选：行业、城市与体制内外', '職業怎麼選：產業、城市與公私部門', 'Choosing a career, industry, city and sector'],
    ['section.45', '攒钱与资产配置：普通人的财务规划', '儲蓄與資產配置：一般人的財務規劃', 'Saving and planning your finances'],
    ['section.46', '怎么吃饭：一日三餐的方案', '怎麼吃飯：日常三餐的安排', 'Planning everyday meals'],
    ['section.47', '怎么运动：一份能落地的处方', '怎麼運動：做得到的運動計畫', 'A practical exercise plan'],
    ['section.48', '婚姻怎么经营：领证之后的事', '婚姻怎麼經營：登記結婚之後', 'Looking after your marriage'],
    ['section.49', '自己的老年：退休前后怎么安排', '自己的老年：退休前後怎麼安排', 'Planning for retirement and later life'],
    ['section.50', '死亡的准备：预立医嘱与告别', '面對死亡的準備：預立醫療意願與告別', 'Preparing for death: care preferences and goodbyes'],
    ['section.51', '钱花在哪最值：消费与欲望', '錢花在哪最值得：消費與欲望', 'Spending money well'],
    ['section.52', '数字时代怎么活：注意力、算法与 AI', '數位時代怎麼生活：注意力、演算法與 AI', 'Digital life: attention, algorithms and AI'],
    ['section.53', '性与生育：避孕、备孕与性健康', '性與生育：避孕、備孕與性健康', 'Sexual health, contraception and fertility'],
  ];
  const messages = Object.fromEntries(SUPPORTED.map((lang, index) => {
    const dictionary = Object.create(null);
    for (const row of rows) dictionary[row[0]] = row[index + 1];
    return [lang, Object.freeze(dictionary)];
  }));
  Object.freeze(messages);

  let saved;
  try { saved = global.localStorage.getItem('ui-language'); } catch (_) { /* Private browsing can disable storage. */ }
  let requested;
  try { requested = new URLSearchParams(global.location.search).get('lang'); } catch (_) { /* Offline contexts still use the saved preference. */ }
  let current = SUPPORTED.includes(requested) ? requested : (SUPPORTED.includes(saved) ? saved : 'zh-Hans');

  function t(key, vars = {}) {
    const template = messages[current][key] ?? messages['zh-Hans'][key] ?? String(key);
    return template.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match);
  }
  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return false;
    current = lang;
    try { global.localStorage.setItem('ui-language', lang); } catch (_) { /* The interface still changes when storage is unavailable. */ }
    if (global.document?.documentElement) global.document.documentElement.lang = lang;
    global.dispatchEvent(new global.CustomEvent('ui-language-change', {detail:{lang}}));
    return true;
  }
  function sectionTitle(number, fallback = '') {
    if (current === 'zh-Hans' && fallback) return fallback;
    return messages[current]['section.' + number] || fallback || String(number);
  }
  const partTitle = id => messages[current]['part.' + id + '.title'] ?? String(id);
  const partTag = id => messages[current]['part.' + id + '.tag'] ?? '';
  const partSubtitle = id => messages[current]['part.' + id + '.sub'] ?? '';
  const valueLabel = (dim, value) => messages[current]['value.' + dim + '.' + value] ?? String(value);

  // These are explicit search aliases, not a translation of the book or an automatic translator.
  // Unknown words are preserved. English aliases match whole words so "art" does not alter "cartoon".
  const phrases = Object.freeze({
    'artificial intelligence':'AI', 'generative ai':'生成式 AI', 'mental health':'心理 健康',
    'user experience':'用户体验', 'user interface':'界面', 'social security':'社保',
    'health insurance':'医保', 'job search':'求职', 'job hunting':'求职',
    'career change':'转行', 'graphic design':'平面设计', 'industrial design':'工业设计',
    'student loan':'助学贷款', 'student loans':'助学贷款', 'deep fake':'换脸', 'deep fakes':'换脸'
  });
  const aliases = Object.freeze({
    ai:'AI', ui:'UI', ux:'UX', design:'设计', designer:'设计师', designers:'设计师',
    art:'艺术', arts:'艺术', artist:'艺术', artists:'艺术', animation:'动画', animator:'动画', animators:'动画',
    student:'学生', students:'学生', school:'学校', learning:'学习', education:'教育',
    anxiety:'焦虑', anxious:'焦虑', stress:'压力', depression:'抑郁', wellbeing:'幸福',
    career:'职业', careers:'职业', job:'工作', jobs:'工作', work:'工作', employment:'就业', unemployment:'失业',
    internship:'实习', internships:'实习', portfolio:'作品集', portfolios:'作品集', copyright:'著作权',
    salary:'工资', wages:'工资', interview:'面试', resume:'简历', cv:'简历',
    health:'健康', sleep:'睡眠', exercise:'运动', food:'饮食', diet:'饮食',
    money:'钱', savings:'储蓄', insurance:'保险', pension:'养老金', retirement:'退休',
    rent:'租房', renting:'租房', housing:'住房', marriage:'婚姻', children:'孩子', parents:'父母',
    emergency:'急救', emergencies:'急救', safety:'安全', privacy:'隐私', scam:'诈骗', scams:'诈骗',
    computer:'电脑', programming:'编程', software:'软件', algorithm:'算法', algorithms:'算法'
  });
  const traditional = Object.freeze({
    '人工智慧':'AI', '人工智能':'AI', '生成式人工智慧':'生成式 AI', '程式設計':'编程',
    '使用者體驗':'用户体验', '使用者介面':'界面', '智慧財產權':'知识产权',
    '學習':'学习', '學生':'学生', '學校':'学校', '學歷':'学历', '學費':'学费', '獎學金':'奖学金',
    '專業':'专业', '科系':'专业', '設計師':'设计师', '設計':'设计', '藝術':'艺术', '動畫':'动画',
    '創作':'创作', '創意':'创意', '作品集':'作品集', '著作權':'著作权', '版權':'版权',
    '職業':'职业', '職涯':'职业', '就業':'就业', '失業':'失业', '求職':'求职', '轉職':'转行', '轉行':'转行',
    '實習':'实习', '履歷':'简历', '簡歷':'简历', '面試':'面试', '薪資':'工资', '勞動':'劳动', '職災':'工伤',
    '焦慮':'焦虑', '壓力':'压力', '憂鬱':'抑郁', '抑鬱':'抑郁', '憂慮':'担忧', '心理諮商':'心理咨询',
    '保險':'保险', '醫療':'医疗', '醫保':'医保', '社會保險':'社会保险', '養老金':'养老金', '儲蓄':'储蓄',
    '租屋':'租房', '買房':'买房', '住房':'住房', '詐騙':'诈骗', '隱私':'隐私', '帳號':'账号',
    '資訊':'信息', '數位':'数字', '數字':'数字', '演算法':'算法', '軟體':'软件', '軟件':'软件',
    '電腦':'电脑', '網路':'网络', '網絡':'网络', '手機':'手机', '通知':'通知',
    '運動':'运动', '飲食':'饮食', '營養':'营养', '篩檢':'筛查', '篩查':'筛查', '健檢':'体检', '體檢':'体检',
    '長輩':'老人', '長者':'老人', '養老':'养老', '懷孕':'怀孕', '生產':'生产', '親子':'亲子',
    '結婚':'结婚', '婚姻':'婚姻', '離婚':'离婚', '關係':'关系', '時間':'时间', '精力':'精力',
    '證據':'证据', '來源':'来源', '證件':'证件', '補助':'补贴', '補貼':'补贴', '貸款':'贷款'
  });
  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const phrasePattern = new RegExp('(^|[^A-Za-z0-9_])(' + Object.keys(phrases).sort((a,b) => b.length-a.length).map(escapeRegExp).join('|') + ')(?=$|[^A-Za-z0-9_])', 'gi');
  const traditionalPattern = new RegExp(Object.keys(traditional).sort((a,b) => b.length-a.length).map(escapeRegExp).join('|'), 'g');
  function normalizeQuery(raw) {
    let query = String(raw ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ');
    query = query.replace(traditionalPattern, word => traditional[word]);
    query = query.replace(phrasePattern, (_, prefix, phrase) => prefix + phrases[phrase.toLowerCase()]);
    query = query.replace(/[A-Za-z]+/g, (word, offset, all) => {
      if (/[A-Za-z0-9_]/.test(all[offset - 1] || '') || /[A-Za-z0-9_]/.test(all[offset + word.length] || '')) return word;
      const key = word.toLowerCase();
      return Object.prototype.hasOwnProperty.call(aliases, key) ? aliases[key] : word;
    });
    return query.replace(/\s+/g, ' ').trim();
  }

  if (global.document?.documentElement) global.document.documentElement.lang = current;
  global.UI_I18N = Object.freeze({
    get lang() { return current; },
    SUPPORTED, t, setLanguage, sectionTitle, partTitle, partTag, partSubtitle, valueLabel, normalizeQuery,
    keys:Object.freeze(rows.map(row => row[0]))
  });
})(window);
