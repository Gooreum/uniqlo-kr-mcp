export const diagramHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>유니클로 MCP 서버 구조도</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; background: #0f1117; color: #e2e8f0; padding: 40px 20px; }
  h1 { text-align: center; font-size: 22px; color: #a78bfa; margin-bottom: 8px; }
  .subtitle { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 48px; }

  .section { margin-bottom: 56px; }
  .section-title { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }

  /* ── 1. 전체 흐름 ── */
  .flow { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
  .flow-box {
    background: #1e293b; border: 1.5px solid #334155; border-radius: 12px;
    padding: 16px 20px; text-align: center; min-width: 130px;
  }
  .flow-box .icon { font-size: 28px; margin-bottom: 6px; }
  .flow-box .label { font-size: 13px; font-weight: 700; color: #e2e8f0; }
  .flow-box .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
  .flow-box.highlight { border-color: #7c3aed; background: #1e1333; }
  .flow-box.highlight .label { color: #a78bfa; }
  .arrow { font-size: 22px; color: #475569; padding: 0 6px; }
  .arrow-label { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .arrow-label .tag { font-size: 10px; color: #7c3aed; background: #1e1333; border: 1px solid #7c3aed; border-radius: 4px; padding: 2px 6px; white-space: nowrap; }

  /* ── 2. 아키텍처 ── */
  .arch { display: flex; flex-direction: column; gap: 12px; max-width: 640px; margin: 0 auto; }
  .arch-row { display: flex; align-items: stretch; gap: 12px; }
  .arch-box {
    flex: 1; background: #1e293b; border: 1.5px solid #334155; border-radius: 12px;
    padding: 16px; display: flex; flex-direction: column; gap: 4px;
  }
  .arch-box .role { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .arch-box .name { font-size: 15px; font-weight: 700; color: #e2e8f0; }
  .arch-box .desc { font-size: 12px; color: #64748b; }
  .arch-box.host { border-color: #0ea5e9; } .arch-box.host .role { color: #0ea5e9; }
  .arch-box.client { border-color: #10b981; } .arch-box.client .role { color: #10b981; }
  .arch-box.server { border-color: #a78bfa; } .arch-box.server .role { color: #a78bfa; }
  .arch-box.api { border-color: #f59e0b; } .arch-box.api .role { color: #f59e0b; }
  .arch-connector { text-align: center; font-size: 11px; color: #475569; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .arch-connector span { font-size: 18px; }
  .arch-connector .msg { color: #64748b; font-size: 11px; }

  /* ── 3. Primitives ── */
  .primitives { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 760px; margin: 0 auto; }
  .prim-box { background: #1e293b; border: 1.5px solid #334155; border-radius: 12px; padding: 20px; }
  .prim-box.active { border-color: #7c3aed; background: #1e1333; }
  .prim-box .prim-icon { font-size: 32px; margin-bottom: 8px; }
  .prim-box .prim-name { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .prim-box.active .prim-name { color: #a78bfa; }
  .prim-box .prim-desc { font-size: 12px; color: #64748b; line-height: 1.6; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; margin-bottom: 8px; }
  .badge.used { background: #7c3aed22; color: #a78bfa; border: 1px solid #7c3aed; }
  .badge.unused { background: #1e293b; color: #475569; border: 1px solid #334155; }

  /* ── 4. Tools ── */
  .tools { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-width: 760px; margin: 0 auto; }
  .tool-box { background: #1e293b; border: 1.5px solid #334155; border-radius: 12px; padding: 16px; }
  .tool-box .tool-name { font-size: 13px; font-weight: 700; color: #a78bfa; font-family: monospace; margin-bottom: 4px; }
  .tool-box .tool-desc { font-size: 12px; color: #64748b; margin-bottom: 10px; }
  .tool-box .tool-params { display: flex; flex-wrap: wrap; gap: 6px; }
  .param { font-size: 11px; background: #0f172a; border: 1px solid #334155; color: #94a3b8; border-radius: 4px; padding: 2px 8px; font-family: monospace; }
  .param.required { border-color: #7c3aed; color: #a78bfa; }

  /* ── 5. Transport ── */
  .transport { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 760px; margin: 0 auto; }
  .trans-box { background: #1e293b; border: 1.5px solid #334155; border-radius: 12px; padding: 20px; }
  .trans-box.active { border-color: #7c3aed; background: #1e1333; }
  .trans-box .trans-name { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
  .trans-box.active .trans-name { color: #a78bfa; }
  .trans-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 12px; }
  .trans-row:last-child { border-bottom: none; }
  .trans-row .key { color: #64748b; }
  .trans-row .val { color: #e2e8f0; text-align: right; }
  .trans-row .val.good { color: #a78bfa; }

  /* ── 6. Lifecycle ── */
  .lifecycle { display: flex; flex-direction: column; gap: 0; max-width: 600px; margin: 0 auto; }
  .lc-step { display: flex; gap: 16px; align-items: flex-start; }
  .lc-line { display: flex; flex-direction: column; align-items: center; }
  .lc-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .lc-dot.init { background: #0ea5e9; color: white; }
  .lc-dot.op { background: #10b981; color: white; }
  .lc-dot.term { background: #64748b; color: white; }
  .lc-vline { width: 2px; flex: 1; background: #334155; min-height: 20px; }
  .lc-content { padding-bottom: 28px; flex: 1; }
  .lc-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .lc-title.init { color: #0ea5e9; }
  .lc-title.op { color: #10b981; }
  .lc-title.term { color: #94a3b8; }
  .lc-msg { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; font-size: 12px; font-family: monospace; color: #94a3b8; margin-top: 8px; line-height: 1.8; }
  .lc-msg .c { color: #0ea5e9; }
  .lc-msg .s { color: #a78bfa; }
  .lc-msg .arrow { color: #475569; }

  /* ── 7. Code ── */
  .code-block { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; max-width: 760px; margin: 0 auto; font-family: monospace; font-size: 12px; line-height: 1.9; overflow-x: auto; }
  .code-block .kw { color: #7c3aed; }
  .code-block .fn { color: #0ea5e9; }
  .code-block .str { color: #10b981; }
  .code-block .comment { color: #475569; }
  .code-block .num { color: #f59e0b; }

  .divider { border: none; border-top: 1px solid #1e293b; margin: 48px 0; }
</style>
</head>
<body>

<h1>유니클로 MCP 서버 구조도</h1>
<p class="subtitle">knowledge_wiki/concepts 기반 · Cloudflare Workers 배포 버전</p>

<!-- 1. 전체 요청 흐름 -->
<div class="section">
  <div class="section-title">1. 전체 요청 흐름</div>
  <div class="flow">
    <div class="flow-box">
      <div class="icon">🧑‍💻</div>
      <div class="label">너</div>
      <div class="sub">"에어리즘 재고 찾아줘"</div>
    </div>
    <div class="arrow-label">
      <span class="arrow">→</span>
    </div>
    <div class="flow-box">
      <div class="icon">🖥️</div>
      <div class="label">Claude.ai</div>
      <div class="sub">Host + Client</div>
    </div>
    <div class="arrow-label">
      <span class="arrow">→</span>
      <span class="tag">HTTP POST /mcp</span>
    </div>
    <div class="flow-box highlight">
      <div class="icon">⚙️</div>
      <div class="label">유니클로 MCP 서버</div>
      <div class="sub">Cloudflare Workers</div>
    </div>
    <div class="arrow-label">
      <span class="arrow">→</span>
      <span class="tag">fetch()</span>
    </div>
    <div class="flow-box">
      <div class="icon">🏪</div>
      <div class="label">유니클로 API</div>
      <div class="sub">www.uniqlo.com</div>
    </div>
  </div>
</div>

<hr class="divider">

<!-- 2. 아키텍처 -->
<div class="section">
  <div class="section-title">2. Host · Client · Server 아키텍처</div>
  <div class="arch">
    <div class="arch-row">
      <div class="arch-box host">
        <div class="role">Host</div>
        <div class="name">Claude.ai 웹앱</div>
        <div class="desc">사용자가 직접 보는 채팅 화면. LLM을 실행하고, 도구 호출 결과를 화면에 표시</div>
      </div>
    </div>
    <div class="arch-connector"><span>↕</span> <span class="msg">Host가 Client를 포함함</span></div>
    <div class="arch-row">
      <div class="arch-box client">
        <div class="role">Client</div>
        <div class="name">Claude.ai 내부 MCP 클라이언트</div>
        <div class="desc">MCP 규격에 맞게 서버와 통신하는 "연결 담당자". 사용자 눈에는 안 보임</div>
      </div>
    </div>
    <div class="arch-connector"><span>↕</span> <span class="msg">JSON-RPC 2.0 over Streamable HTTP</span></div>
    <div class="arch-row">
      <div class="arch-box server">
        <div class="role">Server (우리가 만든 것)</div>
        <div class="name">uniqlo-kr MCP 서버</div>
        <div class="desc">Tools 4개 제공. Hono + WebStandardStreamableHTTPServerTransport로 구현됨</div>
      </div>
    </div>
    <div class="arch-connector"><span>↕</span> <span class="msg">일반 HTTP fetch (MCP 무관)</span></div>
    <div class="arch-row">
      <div class="arch-box api">
        <div class="role">External API</div>
        <div class="name">유니클로 웹사이트 내부 API</div>
        <div class="desc">www.uniqlo.com/kr/api/commerce/v5/ko/ — 공식 API 아님, 웹사이트가 내부적으로 사용하는 API</div>
      </div>
    </div>
  </div>
</div>

<hr class="divider">

<!-- 3. Server Primitives -->
<div class="section">
  <div class="section-title">3. Server Primitives — 우리 서버는 Tools만 사용</div>
  <div class="primitives">
    <div class="prim-box active">
      <div class="badge used">✅ 우리가 씀</div>
      <div class="prim-icon">🔧</div>
      <div class="prim-name">Tools (도구)</div>
      <div class="prim-desc">LLM이 스스로 판단해서 실행하는 기능. 외부 API 호출 등 부작용 허용. 우리 서버의 핵심.</div>
    </div>
    <div class="prim-box">
      <div class="badge unused">— 안 씀</div>
      <div class="prim-icon">📄</div>
      <div class="prim-name">Resources (리소스)</div>
      <div class="prim-desc">URI로 접근하는 읽기 전용 데이터. 정적 데이터에 적합. 우리는 동적 검색이 필요해서 Tools를 선택.</div>
    </div>
    <div class="prim-box">
      <div class="badge unused">— 안 씀</div>
      <div class="prim-icon">💬</div>
      <div class="prim-name">Prompts (프롬프트)</div>
      <div class="prim-desc">사용자가 직접 선택하는 대화 템플릿. 슬래시 명령어 형태. Claude가 자연어로 처리하므로 불필요.</div>
    </div>
  </div>
</div>

<hr class="divider">

<!-- 4. Tools 목록 -->
<div class="section">
  <div class="section-title">4. 등록된 Tools 4개</div>
  <div class="tools">
    <div class="tool-box">
      <div class="tool-name">search_products</div>
      <div class="tool-desc">유니클로 상품 키워드 검색 → 상품 목록 + ID 반환</div>
      <div class="tool-params">
        <span class="param required">query*</span>
        <span class="param">limit=10</span>
        <span class="param">offset=0</span>
      </div>
    </div>
    <div class="tool-box">
      <div class="tool-name">get_product_detail</div>
      <div class="tool-desc">상품 ID로 사이즈·컬러별 l2Id 조회 → 재고 확인에 필요한 l2Id 반환</div>
      <div class="tool-params">
        <span class="param required">productId*</span>
      </div>
    </div>
    <div class="tool-box">
      <div class="tool-name">check_store_stock</div>
      <div class="tool-desc">위치 기반 인근 매장 재고 확인 → 거리순으로 🟢🟡🔴 재고 상태 반환</div>
      <div class="tool-params">
        <span class="param required">l2Id*</span>
        <span class="param required">latitude*</span>
        <span class="param required">longitude*</span>
        <span class="param">limit=10</span>
      </div>
    </div>
    <div class="tool-box">
      <div class="tool-name">list_stores</div>
      <div class="tool-desc">전국 유니클로 매장 목록 → 주소·영업시간·위치 반환</div>
      <div class="tool-params">
        <span class="param">limit=20</span>
        <span class="param">offset=0</span>
      </div>
    </div>
  </div>
</div>

<hr class="divider">

<!-- 5. Transport Layer -->
<div class="section">
  <div class="section-title">5. Transport Layer — 처음엔 Stdio, 지금은 Streamable HTTP</div>
  <div class="transport">
    <div class="trans-box">
      <div class="trans-name">Stdio Transport (처음 버전)</div>
      <div class="trans-row"><span class="key">실행 위치</span><span class="val">내 맥북</span></div>
      <div class="trans-row"><span class="key">통신 방식</span><span class="val">stdin / stdout</span></div>
      <div class="trans-row"><span class="key">네트워크</span><span class="val">없음 (로컬 전용)</span></div>
      <div class="trans-row"><span class="key">동시 접속</span><span class="val">1개</span></div>
      <div class="trans-row"><span class="key">사용 가능 앱</span><span class="val">Claude Code만</span></div>
      <div class="trans-row"><span class="key">등록 방법</span><span class="val">.mcp.json</span></div>
    </div>
    <div class="trans-box active">
      <div class="trans-name">Streamable HTTP Transport (지금)</div>
      <div class="trans-row"><span class="key">실행 위치</span><span class="val good">Cloudflare Workers</span></div>
      <div class="trans-row"><span class="key">통신 방식</span><span class="val good">HTTP POST + SSE</span></div>
      <div class="trans-row"><span class="key">네트워크</span><span class="val good">인터넷 (원격)</span></div>
      <div class="trans-row"><span class="key">동시 접속</span><span class="val good">여러 명 동시</span></div>
      <div class="trans-row"><span class="key">사용 가능 앱</span><span class="val good">Claude.ai, ChatGPT 등</span></div>
      <div class="trans-row"><span class="key">등록 방법</span><span class="val good">URL 입력</span></div>
    </div>
  </div>
</div>

<hr class="divider">

<!-- 6. Lifecycle -->
<div class="section">
  <div class="section-title">6. MCP Lifecycle — 연결부터 종료까지</div>
  <div class="lifecycle">
    <div class="lc-step">
      <div class="lc-line">
        <div class="lc-dot init">1</div>
        <div class="lc-vline"></div>
      </div>
      <div class="lc-content">
        <div class="lc-title init">Initialize (초기화)</div>
        <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Claude.ai가 우리 서버에 처음 연결할 때 한 번 일어나는 핸드셰이크</div>
        <div class="lc-msg">
          <span class="c">Client</span> <span class="arrow">→</span> <span class="s">Server</span>: initialize { protocolVersion: "2025-03-26" }<br>
          <span class="s">Server</span> <span class="arrow">→</span> <span class="c">Client</span>: { capabilities: { tools: { listChanged: true } } }<br>
          <span class="c">Client</span> <span class="arrow">→</span> <span class="s">Server</span>: notifications/initialized
        </div>
      </div>
    </div>
    <div class="lc-step">
      <div class="lc-line">
        <div class="lc-dot op">2</div>
        <div class="lc-vline"></div>
      </div>
      <div class="lc-content">
        <div class="lc-title op">Operate (사용)</div>
        <div style="font-size:12px;color:#64748b;margin-bottom:6px;">실제 도구 호출이 일어나는 단계. 대화하는 동안 계속 반복됨.</div>
        <div class="lc-msg">
          <span class="c">Client</span> <span class="arrow">→</span> <span class="s">Server</span>: tools/list<br>
          <span class="s">Server</span> <span class="arrow">→</span> <span class="c">Client</span>: [search_products, get_product_detail, ...]<br><br>
          <span class="c">Client</span> <span class="arrow">→</span> <span class="s">Server</span>: tools/call "search_products" { query: "에어리즘" }<br>
          <span class="s">Server</span> <span class="arrow">→</span> <span class="c">Client</span>: { content: [{ type: "text", text: "검색결과..." }] }
        </div>
      </div>
    </div>
    <div class="lc-step">
      <div class="lc-line">
        <div class="lc-dot term">3</div>
      </div>
      <div class="lc-content">
        <div class="lc-title term">Terminate (종료)</div>
        <div style="font-size:12px;color:#64748b;">연결 종료. 우리 서버는 stateless(매 요청마다 새 인스턴스)라 자동으로 정리됨.</div>
      </div>
    </div>
  </div>
</div>

<hr class="divider">

<!-- 7. 코드 구조 -->
<div class="section">
  <div class="section-title">7. src/index.ts 핵심 구조</div>
  <div class="code-block">
<span class="comment">// ── MCP 서버 팩토리 ────────────────────────────────────────</span>
<span class="kw">function</span> <span class="fn">createMcpServer</span>() {
  <span class="kw">const</span> server = <span class="kw">new</span> <span class="fn">McpServer</span>({ name: <span class="str">"uniqlo-kr"</span>, version: <span class="str">"1.0.0"</span> });

  server.<span class="fn">registerTool</span>(<span class="str">"search_products"</span>, {
    description: <span class="str">"..."</span>,   <span class="comment">// ← LLM이 이걸 읽고 언제 쓸지 판단함</span>
    inputSchema: { query: z.<span class="fn">string</span>(), limit: z.<span class="fn">number</span>().<span class="fn">default</span>(<span class="num">10</span>) }
  }, <span class="kw">async</span> ({ query, limit }) => {
    <span class="kw">const</span> result = <span class="kw">await</span> <span class="fn">searchProducts</span>(query, limit);  <span class="comment">// uniqlo-api.ts 호출</span>
    <span class="kw">return</span> { content: [{ type: <span class="str">"text"</span>, text: <span class="str">"결과..."</span> }] };
  });
  <span class="comment">// ... 나머지 3개 도구도 같은 패턴</span>
  <span class="kw">return</span> server;
}

<span class="comment">// ── Hono 웹 서버 (Streamable HTTP Transport) ───────────────</span>
<span class="kw">const</span> app = <span class="kw">new</span> <span class="fn">Hono</span>();

app.<span class="fn">use</span>(<span class="str">"*"</span>, <span class="fn">cors</span>({ origin: <span class="str">"*"</span>, allowHeaders: [<span class="str">"mcp-session-id"</span>, ...] }));

app.<span class="fn">all</span>(<span class="str">"/mcp"</span>, <span class="kw">async</span> (c) => {
  <span class="kw">const</span> transport = <span class="kw">new</span> <span class="fn">WebStandardStreamableHTTPServerTransport</span>();
  <span class="kw">const</span> server = <span class="fn">createMcpServer</span>();
  <span class="kw">await</span> server.<span class="fn">connect</span>(transport);
  <span class="kw">return</span> transport.<span class="fn">handleRequest</span>(c.req.raw);  <span class="comment">// JSON-RPC 처리는 SDK가 자동으로</span>
});

<span class="kw">export default</span> app;  <span class="comment">// Cloudflare Workers에 등록</span>
  </div>
</div>

<div style="text-align:center;margin-top:40px;font-size:12px;color:#334155;">
  Uniqlo KR MCP Server · Cloudflare Workers · @modelcontextprotocol/sdk
</div>

</body>
</html>`;
