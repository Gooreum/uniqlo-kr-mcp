# 유니클로 한국 매장 재고 확인 MCP 서버

유니클로 한국 웹사이트의 내부 API를 활용한 MCP(Model Context Protocol) 서버. 상품 검색부터 인근 매장 재고 확인까지 자연어로 조회할 수 있다.

Cloudflare Workers에 배포되어 Claude.ai, ChatGPT(Plus 이상) 등 MCP를 지원하는 모든 클라이언트에서 사용 가능하다.

## 제공 도구

| 도구 | 설명 |
|------|------|
| `search_products` | 상품명/키워드로 유니클로 상품 검색 |
| `get_product_detail` | 상품의 사이즈·컬러별 옵션(l2Id) 조회 |
| `check_store_stock` | 위치 기반 인근 매장 재고 확인 |
| `list_stores` | 전국 매장 목록 조회 |

## 사용 플로우

```
1. search_products("에어리즘 반팔") → productId 확인
2. get_product_detail("E465707-000")  → 원하는 사이즈/컬러의 l2Id 확인
3. check_store_stock(l2Id, lat, lon)  → 인근 매장 재고 현황
```

## 시작하기

### 요구사항

- Node.js 18+
- [Cloudflare 계정](https://dash.cloudflare.com/sign-up)
- Wrangler CLI (`npm install -g wrangler`)

### 설치 및 배포

```bash
git clone <repo-url>
cd ShoppingMCP
npm install

# Cloudflare 로그인
npx wrangler login

# 배포
npm run deploy
```

배포 완료 시 `https://uniqlo-kr-mcp.<your-account>.workers.dev` URL이 발급된다.

### 로컬 개발

```bash
npm run dev
# → http://localhost:8787
```

## MCP 클라이언트 연동

### Claude.ai (Max/Pro)

1. [claude.ai](https://claude.ai) → Settings → Integrations
2. **Add custom integration** → URL 입력:
   ```
   https://uniqlo-kr-mcp.<your-account>.workers.dev/mcp
   ```

### Claude Code (로컬)

`~/.claude/mcp.json`에 추가:

```json
{
  "mcpServers": {
    "uniqlo-kr": {
      "type": "http",
      "url": "https://uniqlo-kr-mcp.<your-account>.workers.dev/mcp"
    }
  }
}
```

### ChatGPT (Plus 이상)

Custom GPT 생성 → Actions → MCP server URL 입력

## 아키텍처 다이어그램

MCP 개념(Host/Client/Server, Transport, Lifecycle 등)과 이 서버의 구현 구조를 시각화한 다이어그램.

```bash
open mcp-diagram.html
```

> 브라우저에서 열면 전체 구조도를 볼 수 있다.

## 프로젝트 구조

```
src/
├── index.ts        # Hono 앱 + MCP 도구 정의 (Cloudflare Workers 엔트리포인트)
├── uniqlo-api.ts   # 유니클로 API 호출 레이어
└── types.ts        # TypeScript 타입 정의
wrangler.toml       # Cloudflare Workers 설정
```

## 기술 스택

- [Cloudflare Workers](https://workers.cloudflare.com/) — 엣지 배포
- [Hono](https://hono.dev/) — 웹 프레임워크
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) — MCP 서버
- TypeScript

## 주의사항

유니클로 공식 API가 아닌 웹사이트 내부 API를 사용한다. 유니클로 서버 정책 변경 시 동작하지 않을 수 있다.
