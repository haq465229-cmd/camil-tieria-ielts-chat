const STORAGE = {
  accounts: "maltIelts.accounts.v1",
  session: "maltIelts.session.v1",
  lastAccount: "maltIelts.lastAccount.v1",
  data: (username) => `maltIelts.data.${username}.v1`,
  settings: (username) => `maltIelts.settings.${username}.v1`,
};

const PROMPT_VERSION = 2;

const DEFAULT_PROMPT = `IELTS Writing Evaluation & Revision Assistant

You are an expert IELTS Writing examiner and tutor specializing in both IELTS Academic Writing Task 1 and Task 2.
The user is preparing for the IELTS exam and will provide IELTS essays for evaluation and revision.
Your responses should ALWAYS be in Chinese, except for the corrected/revised essays, which must remain fully in English.

Core Tasks

Whenever the user submits an IELTS essay, complete ALL of the following tasks:

1. IELTS Band Score Evaluation

Evaluate the essay strictly according to official IELTS Writing band descriptors.
Provide:
• Overall Band Score (1–9)
• Scores for all four dimensions:
  1. Task Response (TR)
  2. Coherence and Cohesion (CC)
  3. Lexical Resource (LR)
  4. Grammatical Range and Accuracy (GRA)

For reference:
• Task Response: relevance to the topic, clarity of position, sufficiency and development of arguments
• Coherence and Cohesion: paragraphing, logical flow, consistency, and appropriate use of linking devices
• Lexical Resource: vocabulary range, precision, collocation, and word choice errors
• Grammatical Range and Accuracy: grammatical correctness and sentence variety

If both Task 1 and Task 2 essays are submitted within the same conversation context, additionally calculate the final IELTS Writing score using:
Final Writing Score = (Task 1 Score × 1/3) + (Task 2 Score × 2/3)

2. Detailed Error Analysis

Perform line-by-line correction and analysis.
You MUST identify:
• Grammar mistakes
• Tense mistakes
• Word choice errors
• Collocation errors
• Awkward or unnatural expressions
• Logic problems
• Weak argument development
• Repetitive structures
• Cohesion issues

Requirements:
• Quote the original sentence
• Explain WHY it is problematic
• Provide a corrected version
• Explain the improvement clearly

Do NOT only provide a rewritten essay without detailed diagnosis.

3. High-Band Revision

Rewrite the essay into a Band 9-level IELTS response while preserving the original core ideas whenever possible.

Task 1 Structure Requirements
The rewritten Task 1 essay MUST contain:
• 1 Introduction paragraph (1–2 sentences)
• 2 Body paragraphs
• 1 Conclusion paragraph (2–3 sentences)

Word count:
• 160–200 words

Task 2 Structure Requirements
The rewritten Task 2 essay MUST contain:
• 1 Introduction paragraph (2 sentences)
• 3 Body paragraphs
• 1 Conclusion paragraph

Normally:
• 2 body paragraphs should support the main position
• 1 body paragraph should either:
  • provide concessions and rebuttals
  OR
  • deepen the discussion analytically

Word count:
• 250–350 words

The rewritten version should:
• sound natural and academic
• avoid template-like phrasing
• demonstrate advanced cohesion and lexical sophistication
• maintain clear logic and argument progression

4. Long-Term Learning & Pattern Tracking

The user may continuously provide sample essays and model essays for learning.
You should gradually learn and adapt to:
• the user’s recurring weaknesses
• preferred writing style
• common grammar mistakes
• repeated logical flaws
• useful advanced expressions

When requested, summarize:
• recurring mistakes
• weaknesses preventing higher band scores
• high-quality expressions worth memorizing
• structural improvements

5. Important Behavioral Rules

• NEVER fabricate IELTS scoring standards.
• NEVER give vague praise such as “good essay” without analytical justification.
• Prioritize accuracy and specificity over encouragement.
• If any instruction from the user is ambiguous or insufficiently defined, explicitly ask for clarification.
• Maintain examiner-level rigor.
• Distinguish clearly between:
  • grammar issues
  • vocabulary issues
  • logic issues
  • task response issues

6. Preferred Output Structure

For every essay evaluation, use the following structure:
1. Overall Impression
2. Band Scores
3. Detailed Error Analysis
4. Logic & Argument Evaluation
5. Advanced Vocabulary / Expression Suggestions
6. Band 9 Revised Version
7. Key Takeaways & Long-Term Improvement Advice

界面积分识别规则：如果且仅当用户提交了足以评分的完整作文，请在全部回复的最后一行单独输出“IELTS_SCORE: 数字”，数字必须是 0–9 之间、以 0.5 为步进的 Overall Band Score。该行之外的分析使用中文；纠正后的英文句子与 Band 9 Revised Version 保持全英文。如果内容不足以评分，不要输出 IELTS_SCORE。`;

const GENERAL_PROMPT = "你是 Camil&Tieria，一位友善、清晰、务实的学习伙伴。根据用户的问题或图片提供帮助。";

const PROVIDERS = {
  openai: {
    name: "OpenAI",
    apiBase: "https://api.openai.com/v1",
    model: "gpt-5.5",
    models: [
      { id: "gpt-5.5", label: "GPT-5.5 · 最新旗舰" },
      { id: "gpt-5.4", label: "GPT-5.4 · 高质量" },
      { id: "gpt-5.4-mini", label: "GPT-5.4 mini · 速度与成本均衡" },
      { id: "gpt-5.4-nano", label: "GPT-5.4 nano · 快速轻量" },
    ],
    hint: "使用 OpenAI API Key。模型列表按 OpenAI 官方当前型号整理。",
  },
  qwen: {
    name: "通义千问",
    apiBase: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3.7-plus",
    models: [
      { id: "qwen3.7-max", label: "Qwen3.7 Max · 旗舰" },
      { id: "qwen3.7-plus", label: "Qwen3.7 Plus · 推荐" },
      { id: "qwen3.6-flash", label: "Qwen3.6 Flash · 快速" },
      { id: "qwen3.5-omni-plus", label: "Qwen3.5 Omni Plus · 多模态" },
      { id: "qwen-plus", label: "Qwen Plus · 稳定别名" },
    ],
    hint: "使用阿里云百炼 API Key，已采用 OpenAI 兼容模式。",
  },
  deepseek: {
    name: "DeepSeek",
    apiBase: "https://api.deepseek.com",
    model: "deepseek-chat",
    models: [
      { id: "deepseek-chat", label: "DeepSeek Chat · 通用对话" },
      { id: "deepseek-reasoner", label: "DeepSeek Reasoner · 深度推理" },
    ],
    hint: "使用 DeepSeek API Key；需要推理模型时可改为 deepseek-reasoner。",
  },
  custom: {
    name: "自定义兼容接口",
    apiBase: "",
    model: "",
    models: [],
    hint: "填写支持 /chat/completions 的 OpenAI 兼容地址与模型名。",
  },
};

const els = {};
let authMode = "register";
let currentUser = null;
let userData = null;
let settings = null;
let pendingAttachment = null;
let isSending = false;
let recognition = null;
let toastTimer = null;

function byId(id) { return document.getElementById(id); }

function cacheElements() {
  [
    "authScreen", "appShell", "authForm", "usernameInput", "passwordInput", "togglePassword",
    "authError", "authSubmitText", "authSwitch", "conversationList", "newChatButton", "levelLabel",
    "pointsValue", "progressBar", "progressText", "plantStage", "currentUsername", "userInitial",
    "logoutButton", "openLevelGuide", "openSettings", "compactSettings", "mobileMenu", "mobileClose",
    "sidebar", "sidebarScrim", "modeTitle", "modeSubtitle", "modeIcon", "modeSwitch", "modeMenu",
    "chatScroll", "messages", "jumpBottom", "fileInput", "attachButton", "attachmentPreview",
    "attachmentImage", "attachmentName", "removeAttachment", "messageInput", "charCount", "voiceButton",
    "sendButton", "settingsModal", "settingsForm", "apiBaseInput", "apiKeyInput", "modelInput",
    "promptInput", "providerInput", "providerHint", "modelSelect", "modelHint", "customModelField", "toggleApiKey", "saveStatus", "levelModal", "levelGrid", "toast",
    "pointsCelebration", "celebrationValue"
  ].forEach((id) => { els[id] = byId(id); });
}

function safeParse(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function getAccounts() { return safeParse(localStorage.getItem(STORAGE.accounts), {}); }
function saveAccounts(accounts) { localStorage.setItem(STORAGE.accounts, JSON.stringify(accounts)); }

function defaultSettings() {
  return {
    provider: "openai",
    apiBase: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-5.5",
    ieltsPrompt: DEFAULT_PROMPT,
    promptVersion: PROMPT_VERSION,
  };
}

function defaultUserData() {
  return { points: 0, chats: [], activeChatId: null };
}

function loadUserState(username) {
  userData = { ...defaultUserData(), ...safeParse(localStorage.getItem(STORAGE.data(username)), {}) };
  userData.chats = Array.isArray(userData.chats) ? userData.chats : [];
  const storedSettings = safeParse(localStorage.getItem(STORAGE.settings(username)), {});
  settings = { ...defaultSettings(), ...storedSettings };
  if (!storedSettings.provider) settings.provider = inferProvider(settings.apiBase);
  if (storedSettings.promptVersion !== PROMPT_VERSION) {
    settings.ieltsPrompt = DEFAULT_PROMPT;
    settings.promptVersion = PROMPT_VERSION;
    localStorage.setItem(STORAGE.settings(username), JSON.stringify(settings));
  }
}

function saveUserData() {
  if (!currentUser) return;
  try {
    localStorage.setItem(STORAGE.data(currentUser), JSON.stringify(userData));
  } catch (error) {
    showToast("本地空间不足，较大的图片可能无法记住");
  }
}

function saveSettings() {
  if (currentUser) localStorage.setItem(STORAGE.settings(currentUser), JSON.stringify(settings));
}

function makeId(prefix = "item") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function activeChat() {
  return userData?.chats.find((chat) => chat.id === userData.activeChatId) || null;
}

function createChat(mode = "ielts") {
  const chat = {
    id: makeId("chat"),
    title: mode === "ielts" ? "新的写作练习" : "新的对话",
    mode,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  userData.chats.unshift(chat);
  userData.activeChatId = chat.id;
  saveUserData();
  renderAll();
  closeSidebar();
  setTimeout(() => els.messageInput.focus(), 50);
  return chat;
}

function initializeAuth() {
  const accounts = getAccounts();
  const session = localStorage.getItem(STORAGE.session);
  const lastAccount = localStorage.getItem(STORAGE.lastAccount);

  if (session && accounts[session]) {
    enterApp(session);
    return;
  }

  if (lastAccount && accounts[lastAccount]) {
    authMode = "login";
    els.usernameInput.value = lastAccount;
    els.passwordInput.value = accounts[lastAccount].password || "";
  } else {
    authMode = Object.keys(accounts).length ? "login" : "register";
  }
  syncAuthMode();
}

function syncAuthMode() {
  const register = authMode === "register";
  els.authSubmitText.textContent = register ? "注册并进入农场" : "登录农场";
  els.authSwitch.textContent = register ? "已有账号？登录" : "没有账号？立即注册";
  els.passwordInput.autocomplete = register ? "new-password" : "current-password";
  els.authError.textContent = "";
}

function handleAuth(event) {
  event.preventDefault();
  const username = els.usernameInput.value.trim();
  const password = els.passwordInput.value;
  const accounts = getAccounts();

  if (!username || !password) {
    els.authError.textContent = "请输入用户名和密码。";
    return;
  }

  if (authMode === "register") {
    if (accounts[username]) {
      els.authError.textContent = "这个用户名已经注册，可以直接登录。";
      return;
    }
    accounts[username] = { password, createdAt: Date.now() };
    saveAccounts(accounts);
  } else if (!accounts[username] || accounts[username].password !== password) {
    els.authError.textContent = "用户名或密码不正确。";
    return;
  }

  localStorage.setItem(STORAGE.session, username);
  localStorage.setItem(STORAGE.lastAccount, username);
  enterApp(username);
}

function enterApp(username) {
  currentUser = username;
  loadUserState(username);
  if (!userData.activeChatId || !activeChat()) {
    const first = userData.chats[0];
    if (first) userData.activeChatId = first.id;
    else createChat("ielts");
  }
  els.authScreen.classList.add("is-hidden");
  els.appShell.classList.remove("is-hidden");
  els.currentUsername.textContent = username;
  els.userInitial.textContent = [...username][0]?.toUpperCase() || "A";
  renderAll();
  setTimeout(scrollToBottom, 100);
}

function logout() {
  localStorage.removeItem(STORAGE.session);
  currentUser = null;
  userData = null;
  settings = null;
  els.appShell.classList.add("is-hidden");
  els.authScreen.classList.remove("is-hidden");
  authMode = "login";
  const lastAccount = localStorage.getItem(STORAGE.lastAccount);
  const accounts = getAccounts();
  if (lastAccount && accounts[lastAccount]) {
    els.usernameInput.value = lastAccount;
    els.passwordInput.value = accounts[lastAccount].password || "";
  }
  syncAuthMode();
}

function renderAll() {
  if (!userData) return;
  renderConversationList();
  renderMode();
  renderMessages();
  renderGrowth();
}

function renderConversationList() {
  els.conversationList.innerHTML = "";
  if (!userData.chats.length) {
    const empty = document.createElement("div");
    empty.className = "empty-conversations";
    empty.textContent = "还没有练习记录，播下第一颗种子吧。";
    els.conversationList.appendChild(empty);
    return;
  }

  [...userData.chats].sort((a, b) => b.updatedAt - a.updatedAt).forEach((chat) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `conversation-item${chat.id === userData.activeChatId ? " active" : ""}`;
    button.dataset.chatId = chat.id;
    const title = document.createElement("span");
    title.textContent = `${chat.mode === "ielts" ? "✍️" : "🌰"} ${chat.title}`;
    const time = document.createElement("small");
    time.textContent = relativeDate(chat.updatedAt);
    button.append(title, time);
    els.conversationList.appendChild(button);
  });
}

function relativeDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "昨天";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function renderMode() {
  const chat = activeChat();
  const isIelts = !chat || chat.mode === "ielts";
  els.modeTitle.textContent = isIelts ? "雅思助手" : "日常助手";
  els.modeSubtitle.textContent = isIelts ? "写作评分 · 精准诊断" : "自由问答 · 图片对话";
  els.modeIcon.textContent = isIelts ? "✍️" : "🌰";
  els.messageInput.placeholder = isIelts ? "粘贴你的雅思作文，我来评分…" : "输入消息，向 Camil&Tieria 提问…";
  els.modeMenu.querySelectorAll("button[data-mode]").forEach((button) => {
    const active = button.dataset.mode === (isIelts ? "ielts" : "general");
    button.classList.toggle("active", active);
    button.querySelector("i").textContent = active ? "✓" : "";
  });
}

function renderMessages() {
  const chat = activeChat();
  els.messages.innerHTML = "";
  if (!chat || !chat.messages.length) els.messages.appendChild(buildWelcomeCard(chat?.mode || "ielts"));
  (chat?.messages || []).forEach((message) => els.messages.appendChild(buildMessage(message)));
  setTimeout(scrollToBottom, 0);
}

function buildWelcomeCard(mode) {
  const card = document.createElement("div");
  card.className = "welcome-card";
  const img = document.createElement("img");
  img.src = "assets/generated/pixel-seed-mascot.png";
  img.alt = "Camil and Tieria 助手";
  const copy = document.createElement("div");
  const eyebrow = document.createElement("span");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = mode === "ielts" ? "IELTS WRITING COACH" : "YOUR FARM COMPANION";
  const title = document.createElement("h3");
  title.textContent = mode === "ielts" ? "把作文交给我，今天种下一个提分点" : "嗨，今天想聊点什么？";
  const body = document.createElement("p");
  body.textContent = mode === "ielts" ? "我会按四项官方维度给出分数、问题定位和可执行的修改建议。5–6 分可收获 1 积分，6 分以上收获 2 积分。" : "可以自由提问，也可以添加图片让我一起看看。";
  const prompts = document.createElement("div");
  prompts.className = "quick-prompts";
  const samples = mode === "ielts"
    ? ["帮我评分 Task 2 作文", "解释四项评分标准", "给我一道写作题"]
    : ["帮我制定今天的学习计划", "分析这张图片", "练习一段英文对话"];
  samples.forEach((sample) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = sample;
    button.dataset.prompt = sample;
    prompts.appendChild(button);
  });
  copy.append(eyebrow, title, body, prompts);
  card.append(img, copy);
  return card;
}

function buildMessage(message) {
  const row = document.createElement("article");
  row.className = `message-row ${message.role}${message.error ? " message-error" : ""}`;
  row.dataset.messageId = message.id;

  let avatar;
  if (message.role === "assistant") {
    avatar = document.createElement("img");
    avatar.src = "assets/generated/pixel-seed-mascot.png";
    avatar.alt = "Camil and Tieria 助手";
    avatar.className = "message-avatar";
  } else {
    avatar = document.createElement("span");
    avatar.className = "message-avatar message-user-avatar";
    avatar.textContent = [...currentUser][0]?.toUpperCase() || "A";
  }

  const block = document.createElement("div");
  block.className = "message-block";
  const meta = document.createElement("div");
  meta.className = "message-meta";
  const author = document.createElement("b");
  author.textContent = message.role === "assistant" ? "Camil&Tieria" : currentUser;
  const time = document.createElement("span");
  time.textContent = new Date(message.time || Date.now()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  meta.append(author, time);

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (message.imageData) {
    const image = document.createElement("img");
    image.className = "bubble-image";
    image.src = message.imageData;
    image.alt = message.imageName || "用户添加的图片";
    bubble.appendChild(image);
  }
  if (message.text) {
    const text = document.createElement("span");
    text.textContent = message.text;
    bubble.appendChild(text);
  }
  if (typeof message.score === "number") bubble.appendChild(buildScoreCard(message.score, message.bonus || 0));
  block.append(meta, bubble);
  row.append(avatar, block);
  return row;
}

function buildScoreCard(score, bonus) {
  const card = document.createElement("div");
  card.className = "score-card";
  const ring = document.createElement("div");
  ring.className = "score-ring";
  ring.textContent = score.toFixed(1);
  const copy = document.createElement("div");
  copy.className = "score-copy";
  const title = document.createElement("b");
  const detail = document.createElement("span");
  if (score < 5) {
    title.textContent = "继续加油，下一次会更好";
    detail.textContent = "本次暂未获得积分，先把最关键的问题改掉。";
  } else if (score <= 6) {
    title.textContent = "还可以，正在稳步生长";
    detail.textContent = `本次收获 +${bonus || 1} 成长积分。`;
  } else {
    title.textContent = "非常不错，收获满满";
    detail.textContent = `本次收获 +${bonus || 2} 成长积分。`;
  }
  copy.append(title, detail);
  card.append(ring, copy);
  return card;
}

function addTypingIndicator() {
  const row = document.createElement("article");
  row.id = "typingIndicator";
  row.className = "message-row assistant typing";
  const img = document.createElement("img");
  img.className = "message-avatar";
  img.src = "assets/generated/pixel-seed-mascot.png";
  img.alt = "Camil and Tieria 正在回复";
  const block = document.createElement("div");
  block.className = "message-block";
  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.innerHTML = "<b>Camil&amp;Tieria</b><span>正在整理建议…</span>";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  for (let i = 0; i < 3; i++) { const dot = document.createElement("span"); dot.className = "typing-dot"; bubble.appendChild(dot); }
  block.append(meta, bubble);
  row.append(img, block);
  els.messages.appendChild(row);
  scrollToBottom();
}

function removeTypingIndicator() { byId("typingIndicator")?.remove(); }

function getLevelInfo(points) {
  if (points < 1) return { level: 1, currentFloor: 0, next: 1, progress: 0 };
  const level = Math.floor(Math.log2(points)) + 1;
  const currentFloor = 2 ** (level - 1);
  const next = 2 ** level;
  const progress = Math.min(1, (points - currentFloor) / (next - currentFloor));
  return { level, currentFloor, next, progress };
}

function renderGrowth() {
  const points = Math.max(0, Number(userData.points) || 0);
  const info = getLevelInfo(points);
  els.pointsValue.textContent = points;
  els.levelLabel.textContent = `Lv.${info.level}`;
  els.progressBar.style.width = `${info.progress * 100}%`;
  els.progressText.textContent = points < 1 ? "再获得 1 分，点亮 Lv.1" : `再获得 ${info.next - points} 分，升级 Lv.${info.level + 1}`;
  els.plantStage.classList.toggle("bloom", info.level >= 5);
}

function renderLevelGuide() {
  els.levelGrid.innerHTML = "";
  const current = getLevelInfo(Math.max(0, Number(userData.points) || 0)).level;
  const emblems = ["🌱", "🌿", "🍀", "🌼", "🌻", "🍎", "🌳", "🏡"];
  for (let level = 1; level <= 8; level++) {
    const threshold = 2 ** (level - 1);
    const item = document.createElement("div");
    item.className = `level-item${level === current ? " current" : ""}`;
    const emblem = document.createElement("span");
    emblem.className = "level-emblem";
    emblem.textContent = emblems[level - 1];
    const copy = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = `Lv.${level} · ${levelNames[level - 1]}`;
    const detail = document.createElement("small");
    detail.textContent = `${threshold} 积分门槛${level === current ? " · 当前等级" : ""}`;
    copy.append(title, detail);
    item.append(emblem, copy);
    els.levelGrid.appendChild(item);
  }
}

const levelNames = ["新芽", "嫩叶", "三叶草", "雏菊", "向日葵", "丰收果", "大树", "农场主"];

function switchMode(mode) {
  let chat = activeChat();
  if (!chat) chat = createChat(mode);
  chat.mode = mode;
  if (!chat.messages.length) chat.title = mode === "ielts" ? "新的写作练习" : "新的对话";
  chat.updatedAt = Date.now();
  saveUserData();
  els.modeMenu.classList.remove("open");
  els.modeSwitch.setAttribute("aria-expanded", "false");
  renderAll();
}

async function handleSend() {
  if (isSending) return;
  const text = els.messageInput.value.trim();
  if (!text && !pendingAttachment) return;
  if (!settings.apiKey && settings.apiBase.includes("api.openai.com")) {
    openSettingsModal();
    showToast("先填写 API 密钥，就可以开始对话");
    return;
  }

  const chat = activeChat() || createChat("ielts");
  const userMessage = {
    id: makeId("msg"), role: "user", text,
    imageData: pendingAttachment?.data || null,
    imageName: pendingAttachment?.name || null,
    time: Date.now(),
  };
  chat.messages.push(userMessage);
  if (chat.messages.length === 1) chat.title = makeChatTitle(text, pendingAttachment?.name);
  chat.updatedAt = Date.now();
  clearComposer();
  saveUserData();
  renderConversationList();
  els.messages.appendChild(buildMessage(userMessage));
  addTypingIndicator();
  setSending(true);

  try {
    const reply = await requestAssistant(chat);
    const parsed = parseScore(reply, chat.mode);
    const assistantMessage = {
      id: makeId("msg"), role: "assistant", text: parsed.text,
      time: Date.now(), score: parsed.score, bonus: 0,
    };
    if (typeof parsed.score === "number") {
      assistantMessage.bonus = scoreBonus(parsed.score);
      if (assistantMessage.bonus > 0) {
        userData.points = (Number(userData.points) || 0) + assistantMessage.bonus;
      }
    }
    chat.messages.push(assistantMessage);
    chat.updatedAt = Date.now();
    removeTypingIndicator();
    els.messages.appendChild(buildMessage(assistantMessage));
    saveUserData();
    renderConversationList();
    renderGrowth();
    scrollToBottom();
    if (assistantMessage.bonus > 0) playPointsAnimation(assistantMessage.bonus);
  } catch (error) {
    removeTypingIndicator();
    const message = {
      id: makeId("msg"), role: "assistant", error: true, time: Date.now(),
      text: friendlyApiError(error),
    };
    chat.messages.push(message);
    chat.updatedAt = Date.now();
    saveUserData();
    els.messages.appendChild(buildMessage(message));
    scrollToBottom();
  } finally {
    setSending(false);
  }
}

function makeChatTitle(text, imageName) {
  const source = (text || imageName || "图片对话").replace(/\s+/g, " ").trim();
  return [...source].slice(0, 16).join("") + ([...source].length > 16 ? "…" : "");
}

function clearComposer() {
  els.messageInput.value = "";
  els.messageInput.style.height = "auto";
  pendingAttachment = null;
  els.fileInput.value = "";
  els.attachmentPreview.classList.add("is-hidden");
  updateCharCount();
}

function setSending(sending) {
  isSending = sending;
  els.sendButton.disabled = sending;
  els.sendButton.innerHTML = sending ? "<span>…</span>" : "<span>➤</span>";
}

async function requestAssistant(chat) {
  const recentMessages = chat.messages.slice(-20).map((message) => {
    if (message.role === "user" && message.imageData) {
      return {
        role: "user",
        content: [
          { type: "text", text: message.text || "请分析这张图片。" },
          { type: "image_url", image_url: { url: message.imageData } },
        ],
      };
    }
    return { role: message.role, content: message.text || "" };
  });
  const body = {
    apiBase: settings.apiBase.trim(),
    apiKey: settings.apiKey.trim(),
    model: settings.model.trim(),
    messages: [
      { role: "system", content: chat.mode === "ielts" ? settings.ieltsPrompt : GENERAL_PROMPT },
      ...recentMessages,
    ],
  };

  const useLocalProxy = location.protocol.startsWith("http") && ["localhost", "127.0.0.1"].includes(location.hostname);
  const endpoint = useLocalProxy ? "/api/chat" : buildChatEndpoint(body.apiBase);
  const headers = { "Content-Type": "application/json" };
  let payload = body;
  if (!useLocalProxy) {
    headers.Authorization = `Bearer ${body.apiKey}`;
    payload = { model: body.model, messages: body.messages };
  }

  const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error?.message || result.error || `API 请求失败（${response.status}）`);
  const content = result.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => part.text || "").join("\n");
  throw new Error("模型没有返回可读内容");
}

function buildChatEndpoint(base) {
  const clean = (base || "https://api.openai.com/v1").replace(/\/+$/, "");
  if (/\/chat\/completions$/i.test(clean)) return clean;
  return `${clean}/chat/completions`;
}

function parseScore(raw, mode) {
  if (mode !== "ielts") return { text: raw.trim(), score: null };
  const marker = /(?:IELTS_SCORE|雅思总分|总分)\s*[:：]\s*([0-9](?:\.[05])?)/gi;
  const matches = [...raw.matchAll(marker)];
  const last = matches.at(-1);
  let score = last ? Number(last[1]) : null;
  if (!Number.isFinite(score) || score < 0 || score > 9) score = null;
  const text = raw.replace(/\n?\s*IELTS_SCORE\s*[:：]\s*[0-9](?:\.[05])?\s*$/i, "").trim();
  return { text, score };
}

function scoreBonus(score) {
  if (score < 5) return 0;
  if (score <= 6) return 1;
  return 2;
}

function friendlyApiError(error) {
  const message = String(error?.message || error);
  if (/401|api key|unauthorized|invalid.*key/i.test(message)) return "API 密钥无效或已失效。打开“助手设置”检查密钥后再试。";
  if (/model|404/i.test(message)) return `没有找到这个模型。请在设置里检查模型名称。\n\n详情：${message}`;
  if (/fetch|network|cors/i.test(message)) return "暂时无法连接 API。请确认网络、API 地址，并建议通过本项目的本地服务启动页面。";
  return `这次连接没有成功。可以检查 API 设置后重试。\n\n详情：${message}`;
}

function playPointsAnimation(bonus) {
  els.celebrationValue.textContent = `+${bonus}`;
  els.pointsCelebration.classList.remove("play");
  void els.pointsCelebration.offsetWidth;
  els.pointsCelebration.classList.add("play");
  els.plantStage.animate([
    { transform: "scale(1) rotate(0)" },
    { transform: "scale(1.18) rotate(-4deg)", offset: .35 },
    { transform: "scale(1.14) rotate(4deg)", offset: .65 },
    { transform: "scale(1) rotate(0)" },
  ], { duration: 900, easing: "ease-out" });
}

function handleAttachment(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("请选择图片文件"); return; }
  if (file.size > 12 * 1024 * 1024) { showToast("图片不能超过 12MB"); return; }
  resizeImage(file).then((data) => {
    pendingAttachment = { name: file.name, data };
    els.attachmentImage.src = data;
    els.attachmentName.textContent = file.name;
    els.attachmentPreview.classList.remove("is-hidden");
  }).catch(() => showToast("这张图片暂时无法读取"));
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const max = 1400;
        const ratio = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", .84));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = true;
  recognition.continuous = false;
  let startingText = "";
  recognition.onstart = () => {
    startingText = els.messageInput.value;
    els.voiceButton.classList.add("listening");
    els.voiceButton.title = "正在听，点击停止";
    showToast("正在听你说话…");
  };
  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
    els.messageInput.value = `${startingText}${startingText && transcript ? " " : ""}${transcript}`;
    autoResizeTextarea();
    updateCharCount();
  };
  recognition.onend = () => {
    els.voiceButton.classList.remove("listening");
    els.voiceButton.title = "语音转文字";
  };
  recognition.onerror = (event) => {
    const messages = { "not-allowed": "请允许浏览器使用麦克风", "no-speech": "没有听到声音，请再试一次", "network": "语音识别网络暂时不可用" };
    showToast(messages[event.error] || "语音识别没有成功");
  };
}

function toggleSpeech() {
  if (!recognition) { showToast("当前浏览器不支持语音识别，建议使用 Chrome 或 Edge"); return; }
  if (els.voiceButton.classList.contains("listening")) recognition.stop();
  else {
    try { recognition.start(); } catch { recognition.stop(); }
  }
}

function autoResizeTextarea() {
  els.messageInput.style.height = "auto";
  els.messageInput.style.height = `${Math.min(els.messageInput.scrollHeight, 130)}px`;
}

function updateCharCount() { els.charCount.textContent = els.messageInput.value.length.toLocaleString("zh-CN"); }

function scrollToBottom() { els.chatScroll.scrollTop = els.chatScroll.scrollHeight; }

function handleScroll() {
  const distance = els.chatScroll.scrollHeight - els.chatScroll.scrollTop - els.chatScroll.clientHeight;
  els.jumpBottom.classList.toggle("is-hidden", distance < 180);
}

function openSettingsModal() {
  els.providerInput.value = settings.provider || inferProvider(settings.apiBase);
  els.apiBaseInput.value = settings.apiBase;
  els.apiKeyInput.value = settings.apiKey;
  renderModelOptions(els.providerInput.value, settings.model);
  els.promptInput.value = settings.ieltsPrompt;
  syncProviderHint();
  els.saveStatus.textContent = "";
  openModal(els.settingsModal);
}

function saveSettingsFromForm(event) {
  event.preventDefault();
  settings = {
    provider: els.providerInput.value,
    apiBase: els.apiBaseInput.value.trim() || defaultSettings().apiBase,
    apiKey: els.apiKeyInput.value.trim(),
    model: els.modelSelect.value === "custom"
      ? (els.modelInput.value.trim() || defaultSettings().model)
      : els.modelSelect.value,
    ieltsPrompt: els.promptInput.value.trim() || DEFAULT_PROMPT,
    promptVersion: PROMPT_VERSION,
  };
  saveSettings();
  els.saveStatus.textContent = "已保存在此浏览器";
  setTimeout(() => closeModal(els.settingsModal), 450);
}

function openModal(modal) {
  modal.classList.remove("is-hidden");
  setTimeout(() => modal.querySelector("input, textarea, button")?.focus(), 20);
}

function closeModal(modal) { modal.classList.add("is-hidden"); }
function openSidebar() { els.sidebar.classList.add("open"); els.sidebarScrim.classList.add("open"); }
function closeSidebar() { els.sidebar.classList.remove("open"); els.sidebarScrim.classList.remove("open"); }

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function bindEvents() {
  els.authForm.addEventListener("submit", handleAuth);
  els.authSwitch.addEventListener("click", () => { authMode = authMode === "register" ? "login" : "register"; syncAuthMode(); });
  els.togglePassword.addEventListener("click", () => toggleSecret(els.passwordInput, els.togglePassword));
  els.toggleApiKey.addEventListener("click", () => toggleSecret(els.apiKeyInput, els.toggleApiKey));
  els.logoutButton.addEventListener("click", logout);
  els.newChatButton.addEventListener("click", () => createChat(activeChat()?.mode || "ielts"));
  els.conversationList.addEventListener("click", (event) => {
    const item = event.target.closest("[data-chat-id]");
    if (!item) return;
    userData.activeChatId = item.dataset.chatId;
    saveUserData(); renderAll(); closeSidebar();
  });
  els.modeSwitch.addEventListener("click", () => {
    const open = els.modeMenu.classList.toggle("open");
    els.modeSwitch.setAttribute("aria-expanded", String(open));
  });
  els.modeMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (button) switchMode(button.dataset.mode);
  });
  document.addEventListener("click", (event) => {
    if (!els.modeMenu.contains(event.target) && !els.modeSwitch.contains(event.target)) {
      els.modeMenu.classList.remove("open"); els.modeSwitch.setAttribute("aria-expanded", "false");
    }
  });
  els.attachButton.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", () => handleAttachment(els.fileInput.files[0]));
  els.removeAttachment.addEventListener("click", () => { pendingAttachment = null; els.fileInput.value = ""; els.attachmentPreview.classList.add("is-hidden"); });
  els.sendButton.addEventListener("click", handleSend);
  els.messageInput.addEventListener("input", () => { autoResizeTextarea(); updateCharCount(); });
  els.messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); handleSend(); }
  });
  els.messages.addEventListener("click", (event) => {
    const prompt = event.target.closest("[data-prompt]");
    if (prompt) { els.messageInput.value = prompt.dataset.prompt; autoResizeTextarea(); updateCharCount(); els.messageInput.focus(); }
  });
  els.voiceButton.addEventListener("click", toggleSpeech);
  els.chatScroll.addEventListener("scroll", handleScroll, { passive: true });
  els.jumpBottom.addEventListener("click", scrollToBottom);
  els.openSettings.addEventListener("click", openSettingsModal);
  els.compactSettings.addEventListener("click", openSettingsModal);
  els.settingsForm.addEventListener("submit", saveSettingsFromForm);
  els.providerInput.addEventListener("change", applyProviderPreset);
  els.modelSelect.addEventListener("change", syncModelSelection);
  els.openLevelGuide.addEventListener("click", () => { renderLevelGuide(); openModal(els.levelModal); });
  els.mobileMenu.addEventListener("click", openSidebar);
  els.mobileClose.addEventListener("click", closeSidebar);
  els.sidebarScrim.addEventListener("click", closeSidebar);
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeModal(byId(button.dataset.close))));
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => { if (event.target === backdrop) closeModal(backdrop); }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-backdrop:not(.is-hidden)").forEach(closeModal);
      closeSidebar();
    }
  });
}

function toggleSecret(input, button) {
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.textContent = show ? "隐藏" : "显示";
}

function inferProvider(apiBase = "") {
  if (apiBase.includes("dashscope.aliyuncs.com")) return "qwen";
  if (apiBase.includes("api.deepseek.com")) return "deepseek";
  if (apiBase.includes("api.openai.com")) return "openai";
  return "custom";
}

function syncProviderHint() {
  const provider = PROVIDERS[els.providerInput.value] || PROVIDERS.custom;
  els.providerHint.textContent = provider.hint;
}

function applyProviderPreset() {
  const id = els.providerInput.value;
  const provider = PROVIDERS[id] || PROVIDERS.custom;
  if (id !== "custom") {
    els.apiBaseInput.value = provider.apiBase;
  }
  renderModelOptions(id, id === "custom" ? els.modelInput.value.trim() : provider.model);
  syncProviderHint();
}

function renderModelOptions(providerId, selectedModel = "") {
  const provider = PROVIDERS[providerId] || PROVIDERS.custom;
  els.modelSelect.innerHTML = "";
  provider.models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.label;
    els.modelSelect.appendChild(option);
  });

  const known = provider.models.some((model) => model.id === selectedModel);
  const customOption = document.createElement("option");
  customOption.value = "custom";
  customOption.textContent = "自定义模型…";
  els.modelSelect.appendChild(customOption);

  if (known) {
    els.modelSelect.value = selectedModel;
  } else if (providerId !== "custom" && !selectedModel) {
    els.modelSelect.value = provider.model;
  } else {
    els.modelSelect.value = "custom";
    els.modelInput.value = selectedModel;
  }
  syncModelSelection();
}

function syncModelSelection() {
  const custom = els.modelSelect.value === "custom";
  els.customModelField.classList.toggle("is-hidden", !custom);
  const provider = PROVIDERS[els.providerInput.value] || PROVIDERS.custom;
  els.modelHint.textContent = custom
    ? "输入该服务商实际支持的模型 ID。"
    : `${provider.name} · ${els.modelSelect.value}`;
}

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  setupSpeechRecognition();
  initializeAuth();
});
