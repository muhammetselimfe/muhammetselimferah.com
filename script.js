// "Ask Selim": a chat-style homepage with scripted answers. No AI, no backend.
// Each intent has keywords and an answer made of parts: paragraphs (with
// [label](url) links) and cards. Paragraphs stream in word by word.

const AVATAR = "https://github.com/muhammetselimfe.png?size=64";
const EMAIL = "selim@l1beat.io";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const START = ["Who are you?", "What is L1Beat?", "Show me your projects", "How can I reach you?"];

const INTENTS = [
  {
    id: "greeting",
    keys: ["hi", "hello", "hey", "merhaba", "selam", "yo", "sup"],
    answer: [
      { p: "Hey! Thanks for stopping by. I'm Selim, I build developer tooling and data products for the Avalanche ecosystem." },
      { p: "Ask me about L1Beat, the things I've built, or how to get in touch." },
    ],
    follow: ["What is L1Beat?", "What have you built?", "How can I reach you?"],
  },
  {
    id: "about",
    keys: ["who", "who are you", "about you", "yourself", "introduce", "kimsin", "summary", "selim"],
    answer: [
      { p: "I'm Selim Ferah, a developer advocate and full-stack engineer based in Malta. I've spent five years in DeFi and Web3, mostly in the Avalanche ecosystem." },
      { p: "Today I run [L1Beat](https://l1beat.io), an analytics platform and public data API for Avalanche L1s that I build and operate end to end. I'm also an official Avalanche Ambassador: I write guides, run university workshops and mentor builders." },
    ],
    follow: ["What is L1Beat?", "Tell me about your work history", "What's your tech stack?"],
  },
  {
    id: "l1beat",
    keys: ["l1beat", "analytics", "dashboard", "api", "data", "tvl", "l1s", "indexer", "registry"],
    answer: [
      { p: "L1Beat is a public analytics platform and data API for Avalanche L1s: TVL, DeFi activity and validator metrics that other apps and developers integrate against." },
      { card: "l1beat" },
      { p: "I ship the whole stack: Solidity and EVM integrations, a Go on-chain indexer, a Node.js REST API and a TypeScript + React frontend. I also maintain the open-source [L1 Registry](https://github.com/L1Beat/l1-registry) as a shared reference for the ecosystem." },
      { p: "It started as a hackathon prototype in Bangkok and went on to receive the largest Avalanche Retro9000 grant." },
    ],
    follow: ["Tell me about the grant", "Is it open source?", "Show me the live chain"],
  },
  {
    id: "opensource",
    keys: ["open source", "opensource", "source code", "code", "repo", "repos", "github"],
    answer: [
      { p: "Yes. L1Beat's [frontend](https://github.com/L1Beat/L1Beat-frontend), [backend](https://github.com/L1Beat/L1Beat-backend) and [indexer](https://github.com/L1Beat/L1BEAT-INDEXER) are all public, along with the L1 Registry." },
      { card: "socials" },
    ],
    follow: ["Show me your projects", "What's your tech stack?"],
  },
  {
    id: "projects",
    keys: ["project", "projects", "built", "build", "portfolio", "made", "side"],
    answer: [
      { p: "Here's what I've been building:" },
      { card: "projects" },
      { p: "I've also contributed to the Avalanche Builders Hub, Avalanche Academy and avalanche-cli. There's more on my [GitHub](https://github.com/muhammetselimfe)." },
    ],
    follow: ["What is L1Beat?", "What's your tech stack?", "How can I reach you?"],
  },
  {
    id: "defi",
    keys: ["defi", "aave", "benqi", "liquidation", "liquidations", "lending", "bad debt", "rwa", "tokenization"],
    answer: [
      { p: "On the data side, I indexed every on-chain position and liquidation across Aave and Benqi on Avalanche and built an internal dashboard to monitor bad debt." },
      { p: "Before that, as product manager at Shipex, I worked on staking and governance design for tokenizing regulated real-world assets." },
    ],
    follow: ["What is L1Beat?", "What's your tech stack?"],
  },
  {
    id: "work",
    keys: ["work", "experience", "job", "career", "cv", "resume", "shipex", "background", "history", "worked"],
    answer: [
      { p: "Here's the short version:" },
      { card: "timeline" },
      { p: "I studied Computer Programming at Karadeniz Technical University (2018 to 2021)." },
    ],
    follow: ["What do you do as an ambassador?", "What's your tech stack?", "How can I reach you?"],
  },
  {
    id: "avalanche",
    keys: ["avalanche", "ambassador", "team1", "workshop", "workshops", "teach", "teaching", "mentor", "community", "university", "talk", "talks", "speaker"],
    answer: [
      { p: "I've been an official Avalanche Ambassador with Team1 since 2020. I run university workshops across Malta and Turkey and mentor builders at events. I mentored at Avalanche Summit London and joined Avalanche Innovation House in Bangkok and the UK." },
      { p: "A lot of it is hands-on help: getting someone's first node running, debugging a contract deployment, or smoothing out a launch." },
    ],
    follow: ["Do you write?", "What is L1Beat?", "Can you speak at my event?"],
  },
  {
    id: "writing",
    keys: ["write", "writing", "medium", "blog", "article", "articles", "guide", "guides", "docs", "documentation"],
    answer: [
      { p: "Since 2020 I've written technical guides for the Avalanche community on [Medium](https://medium.com/@avax): node setup, smart-contract deployment and token creation." },
    ],
    follow: ["What do you do as an ambassador?", "What is L1Beat?"],
  },
  {
    id: "achievements",
    keys: ["grant", "retro9000", "hackathon", "bangkok", "award", "win", "won", "achievement", "achievements", "funding", "proud"],
    answer: [
      { p: "Two I'm proud of:" },
      { card: "achievements" },
      { p: "L1Beat began as a prototype at an Avalanche hackathon in Bangkok, won a bounty there, and grew into a live product." },
    ],
    follow: ["What is L1Beat?", "Show me your projects"],
  },
  {
    id: "skills",
    keys: ["skill", "skills", "stack", "tech", "technologies", "programming", "solidity", "typescript", "go", "golang", "rust", "react", "vue", "node"],
    answer: [
      { p: "Day to day I work across the stack:" },
      { card: "stack" },
      { p: "On the blockchain side: EVM smart contracts, Avalanche L1s, lending protocols, liquidations, DEXs and DeFi analytics." },
    ],
    follow: ["Show me your projects", "Tell me about DeFi work"],
  },
  {
    id: "contact",
    keys: ["contact", "email", "mail", "reach", "hire", "hiring", "collaborate", "dm", "message", "speak at", "event", "available", "freelance", "job offer"],
    answer: [
      { p: "Easiest is email. I'm happy to talk about Avalanche, on-chain data, developer tooling or speaking at your event." },
      { card: "contact" },
      { p: "You can also reach me on [LinkedIn](https://www.linkedin.com/in/muhammetselimfe/) or [X](https://x.com/muhammetselimfe)." },
    ],
    follow: ["Who are you?", "What is L1Beat?"],
  },
  {
    id: "social",
    keys: ["twitter", "x", "linkedin", "social", "socials", "follow", "links"],
    answer: [
      { p: "Here's where to find me:" },
      { card: "socials" },
    ],
    follow: ["How can I reach you?", "Show me your projects"],
  },
  {
    id: "live",
    keys: ["block", "blocks", "live", "chain", "c-chain", "cchain", "height", "network"],
    answer: [
      { p: "This is the Avalanche C-Chain right now. Each square is a block, straight from the public RPC:" },
      { card: "chain" },
      { p: "Watching data like this is basically my job at L1Beat, across every Avalanche L1." },
    ],
    follow: ["What is L1Beat?", "Who are you?"],
  },
  {
    id: "location",
    keys: ["where", "where do you live", "malta", "based", "location", "country", "turkey", "time"],
    answer: [
      { p: "I'm based in Malta. It's {time} here right now. I'm originally from Turkey, so I spend time in both." },
    ],
    follow: ["What languages do you speak?", "How can I reach you?"],
  },
  {
    id: "languages",
    keys: ["speak", "turkish", "english", "türkçe", "turkce", "languages"],
    answer: [
      { p: "Turkish is my native language and I work in English every day. I run workshops in both." },
    ],
    follow: ["Where are you based?", "How can I reach you?"],
  },
];

const FALLBACK = {
  answer: [
    { p: "I don't have an answer written for that one. I'm a scripted version of Selim, so I only know about my work, projects and how to reach me." },
    { p: "For anything else, email me and the real me will reply." },
    { card: "contact" },
  ],
  follow: START,
};

// Matching

function normalize(s) {
  return s.toLowerCase().replace(/[’']/g, "").replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const intent of INTENTS) {
  intent.res = intent.keys.map((k) => new RegExp(`(^|\\s)${escapeRe(k)}(?=\\s|$)`, "u"));
}

function match(text) {
  const q = ` ${normalize(text)} `;
  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = intent.res.reduce((n, re) => n + (re.test(q) ? 1 : 0), 0);
    if (score > bestScore) { best = intent; bestScore = score; }
  }
  return best || FALLBACK;
}

// Small DOM helper

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else el.setAttribute(k, v);
  }
  // External links open in a new tab so the conversation isn't lost.
  if (tag === "a" && /^https?:/.test(attrs.href || "")) {
    el.target = "_blank";
    el.rel = "noopener";
  }
  for (const c of children) if (c != null) el.append(c);
  return el;
}

// Live data shared by cards

const live = { height: null, l1s: null, repos: null };
const liveEls = { height: new Set(), l1s: new Set(), repos: new Set(), strips: new Set() };

function setLive(key, value) {
  live[key] = value;
  for (const el of liveEls[key]) el.textContent = value;
}

let pollTimer = null;
let lastHeight = null;

function addBlock(strip, isNew) {
  const el = h("span", { class: isNew ? "block is-new" : "block" });
  strip.append(el);
  if (isNew) setTimeout(() => el.classList.remove("is-new"), 1500);
  while (strip.children.length > 40) strip.firstElementChild.remove();
}

async function pollChain() {
  try {
    const res = await fetch("https://api.avax.network/ext/bc/C/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    });
    const height = parseInt((await res.json()).result, 16);
    if (!Number.isFinite(height)) return;
    if (lastHeight !== null && height > lastHeight) {
      const fresh = Math.min(height - lastHeight, 5);
      for (const strip of liveEls.strips) for (let i = 0; i < fresh; i++) addBlock(strip, true);
    }
    lastHeight = height;
    setLive("height", `#${height.toLocaleString("en-US")}`);
  } catch {}
}

function startChain() {
  if (pollTimer) return;
  pollChain();
  pollTimer = setInterval(pollChain, 2000);
}

document.addEventListener("visibilitychange", () => {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = document.hidden ? 0 : setInterval(pollChain, 2000);
});

let countsLoaded = false;
async function loadCounts() {
  if (countsLoaded) return;
  countsLoaded = true;
  try {
    const l1s = await (await fetch("https://api.github.com/repos/L1Beat/l1-registry/contents/data")).json();
    if (Array.isArray(l1s)) setLive("l1s", l1s.length);
  } catch {}
  try {
    const user = await (await fetch("https://api.github.com/users/muhammetselimfe")).json();
    if (user.public_repos) setLive("repos", user.public_repos);
  } catch {}
}

function liveSpan(key, fallback, attrs = {}) {
  const el = h("span", { ...attrs, text: live[key] ?? fallback });
  liveEls[key].add(el);
  return el;
}

function maltaTime() {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Malta", hour: "2-digit", minute: "2-digit" }).format(new Date());
}

// Cards

function linkCard(href, title, sub) {
  return h("a", { class: "card", href }, h("span", { class: "card-title", text: title }), h("span", { class: "card-sub", text: sub }));
}

const CARDS = {
  l1beat() {
    loadCounts();
    return h("a", { class: "card l1beat", href: "https://l1beat.io" },
      h("span", { class: "mark", text: "L1Beat" }),
      h("span", { class: "card-sub", text: "Analytics and a public data API for every Avalanche L1" }),
      h("span", { class: "stat" }, h("strong", {}, liveSpan("l1s", 143)), "L1s in the open registry"),
      h("span", { class: "pill", text: "Open l1beat.io" }));
  },

  chain() {
    const strip = h("div", { class: "blocks", "aria-hidden": "true" });
    for (let i = 0; i < 40; i++) addBlock(strip, false);
    liveEls.strips.add(strip);
    startChain();
    return h("figure", { class: "card chain", "aria-label": "Live Avalanche C-Chain blocks" },
      strip,
      liveSpan("height", "Loading…", { class: "height" }),
      h("span", { class: "card-sub", text: "Avalanche C-Chain, live" }));
  },

  projects() {
    return h("div", { class: "list" },
      linkCard("https://l1beat.io", "L1Beat", "Analytics for every Avalanche L1"),
      linkCard("https://github.com/L1Beat/L1Beat-frontend", "L1Beat Frontend", "TypeScript and React app behind l1beat.io"),
      linkCard("https://github.com/L1Beat/L1Beat-backend", "L1Beat Backend", "Node.js REST API serving L1 data"),
      linkCard("https://github.com/L1Beat/Icicle-Indexer", "Icicle Indexer", "Fast Avalanche P-Chain and L1 indexer in Go"),
      linkCard("https://github.com/muhammetselimfe/Icicle-Markets", "Icicle Markets", "Avalanche explorer, swaps and prediction markets"));
  },

  timeline() {
    const item = (when, title, sub) =>
      h("li", {}, h("span", { class: "card-sub", text: when }), h("span", { class: "card-title", text: title }), h("span", { class: "card-sub", text: sub }));
    return h("div", { class: "card timeline" }, h("ol", {},
      item("2025 to now", "Founder & full-stack engineer, L1Beat", "Building and running Avalanche L1 analytics and its public API"),
      item("2024 to 2025", "Product manager, Shipex", "Protocol design for tokenizing real-world assets"),
      item("2020 to now", "Avalanche Ambassador, Team1", "Guides, university workshops and mentoring")));
  },

  stack() {
    return h("div", { class: "chips-row" },
      ...["Solidity", "TypeScript", "Go", "Rust", "React", "Vue", "Node.js", "MongoDB", "REST APIs"].map((t) => h("span", { text: t })));
  },

  achievements() {
    return h("div", { class: "list" },
      h("div", { class: "card" }, h("span", { class: "card-title", text: "Six-figure Retro9000 grant" }), h("span", { class: "card-sub", text: "The largest Avalanche Retro9000 grant, for L1Beat" })),
      h("div", { class: "card" }, h("span", { class: "card-title", text: "Hackathon bounty" }), h("span", { class: "card-sub", text: "Avalanche hackathon in Bangkok" })));
  },

  socials() {
    loadCounts();
    const gh = h("a", { class: "card", href: "https://github.com/muhammetselimfe" },
      h("span", { class: "card-title", text: "GitHub" }),
      h("span", { class: "card-sub" }, liveSpan("repos", 51), " public repos"));
    return h("div", { class: "list" },
      linkCard("https://www.linkedin.com/in/muhammetselimfe/", "LinkedIn", "muhammetselimfe"),
      linkCard("https://x.com/muhammetselimfe", "X", "@muhammetselimfe"),
      gh,
      linkCard("https://medium.com/@avax", "Medium", "Guides since 2020"),
      linkCard("https://github.com/L1Beat", "L1Beat on GitHub", "Frontend, backend and indexer"));
  },

  contact() {
    const copy = h("button", { type: "button", text: "Copy address" });
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        copy.textContent = "Copied";
      } catch {
        copy.textContent = "Copy failed";
      }
      setTimeout(() => { copy.textContent = "Copy address"; }, 2000);
    });
    return h("div", { class: "card contact" },
      h("span", { class: "card-sub", text: "Email" }),
      h("span", { class: "address", text: EMAIL }),
      h("div", { class: "actions" }, h("a", { href: `mailto:${EMAIL}`, text: "Write an email" }), copy));
  },
};

// Chat UI

const body = document.body;
const log = document.getElementById("log");
const form = document.getElementById("composer");
const input = document.getElementById("prompt");
const send = document.getElementById("send");
const suggestions = document.getElementById("suggestions");
let busy = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

function nearBottom() {
  return log.scrollHeight - log.scrollTop - log.clientHeight < 120;
}

function scrollDown(force) {
  if (force || nearBottom()) log.scrollTop = log.scrollHeight;
}

function setSuggestions(list) {
  suggestions.replaceChildren(...list.map((q) => {
    const chip = h("button", { type: "button", class: "chip", text: q });
    chip.addEventListener("click", () => ask(q));
    return chip;
  }));
}

function updateControls() {
  send.disabled = busy || !input.value.trim();
  for (const chip of suggestions.children) chip.disabled = busy;
}

// Split "text [label](url) more" into text and link segments.
function segments(text) {
  const out = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ label: m[1], href: m[2] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

async function streamParagraph(container, text) {
  const p = h("p");
  container.append(p);
  for (const seg of segments(text.replace("{time}", maltaTime()))) {
    if (seg.href) {
      p.append(h("a", { href: seg.href, text: seg.label }));
      scrollDown();
      await sleep(22);
      continue;
    }
    for (const word of seg.text.split(/(\s+)/)) {
      if (!word) continue;
      p.append(word);
      if (word.trim()) { scrollDown(); await sleep(22); }
    }
  }
}

async function ask(question) {
  question = question.trim();
  if (!question || busy) return;
  busy = true;
  input.value = "";
  autosize();
  updateControls();

  body.classList.replace("is-empty", "is-chatting");
  log.append(h("div", { class: "msg user" }, h("p", { text: question })));
  scrollDown(true);

  const reply = h("div", { class: "body" });
  const typing = h("span", { class: "typing", "aria-label": "Selim is typing" }, h("span"), h("span"), h("span"));
  reply.append(typing);
  log.append(h("div", { class: "msg bot" }, h("img", { src: AVATAR, alt: "", width: 32, height: 32 }), reply));
  log.setAttribute("aria-busy", "true");
  scrollDown(true);

  const intent = match(question);
  await sleep(450);
  typing.remove();

  for (const part of intent.answer) {
    if (part.p) await streamParagraph(reply, part.p);
    else { reply.append(CARDS[part.card]()); scrollDown(); await sleep(150); }
  }

  log.removeAttribute("aria-busy");
  setSuggestions(intent.follow);
  busy = false;
  updateControls();
  input.focus({ preventScroll: true });
}

function autosize() {
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight}px`;
}

function reset() {
  if (busy) return;
  log.replaceChildren();
  liveEls.strips.clear();
  for (const key of ["height", "l1s", "repos"]) liveEls[key].clear();
  body.classList.replace("is-chatting", "is-empty");
  setSuggestions(START);
  input.value = "";
  autosize();
  updateControls();
  input.focus();
}

form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
input.addEventListener("input", () => { autosize(); updateControls(); });
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); }
});
document.getElementById("new-chat").addEventListener("click", reset);
document.getElementById("new-chat-2").addEventListener("click", reset);

setSuggestions(START);
updateControls();

// Deep link: muhammetselimferah.com/?q=What+is+L1Beat
const q = new URLSearchParams(location.search).get("q");
if (q) ask(q);
