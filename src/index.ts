import { Hono } from "hono";
import { cors } from "hono/cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  searchProducts,
  getProductDetail,
  getProductL2s,
  getStoreStock,
  getStores,
} from "./uniqlo-api.js";
import type { L2Item, ProductOption } from "./types.js";
import { diagramHtml } from "./diagram.js";

// API 실패를 프로토콜 에러 대신 사용자가 읽을 수 있는 도구 결과로 돌려준다
async function safe(fn: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { isError: true, content: [{ type: "text", text: `⚠️ ${msg}` }] };
  }
}

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "uniqlo-kr",
    version: "1.0.0",
  });

  server.registerTool(
    "search_products",
    {
      title: "상품 검색",
      description: "유니클로 한국 상품 검색. 상품명 또는 키워드로 검색합니다.",
      inputSchema: {
        query: z.string().describe("검색어 (예: '에어리즘', '플리스', 'UT')"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .default(10)
          .describe("결과 수 (최대 30)"),
        offset: z.number().int().min(0).optional().default(0).describe("페이지 오프셋"),
      },
    },
    async ({ query, limit, offset }) =>
      safe(async () => {
        const result = await searchProducts(query, limit, offset);
        if (result.items.length === 0) {
          return {
            content: [{ type: "text", text: `"${query}"에 대한 검색 결과가 없습니다.` }],
          };
        }

        const lines = [
          `🔍 "${query}" 검색 결과 (총 ${result.pagination.total}건, ${result.items.length}개 표시)\n`,
        ];

        for (const item of result.items) {
          const basePrice = item.prices?.base?.value;
          const promoPrice = item.prices?.promo?.value;
          const priceStr = promoPrice
            ? `~~${basePrice?.toLocaleString()}원~~ → ${promoPrice.toLocaleString()}원`
            : `${basePrice?.toLocaleString()}원`;

          const colors = item.colors?.map((c) => c.name).join(", ") ?? "";
          lines.push(
            `• **${item.name}**`,
            `  ID: \`${item.productId}\` | 가격: ${priceStr}`,
            `  성별: ${item.genderCategory} | 색상: ${colors}`,
            ""
          );
        }

        lines.push(
          "💡 상품 ID로 get_product_detail을 호출하면 사이즈/컬러별 l2Id를 확인할 수 있습니다."
        );

        return { content: [{ type: "text", text: lines.join("\n") }] };
      })
  );

  server.registerTool(
    "get_product_detail",
    {
      title: "상품 상세 조회",
      description:
        "유니클로 상품의 사이즈/컬러 옵션과 l2Id 조회. check_store_stock에 필요한 l2Id를 얻을 수 있습니다.",
      inputSchema: {
        productId: z
          .string()
          .describe("상품 ID (예: 'E465707-000'). search_products로 얻은 ID 사용"),
      },
    },
    async ({ productId }) =>
      safe(async () => {
        const [detail, result] = await Promise.all([
          getProductDetail(productId),
          getProductL2s(productId),
        ]);

        if (!result.l2s || result.l2s.length === 0) {
          return {
            content: [{ type: "text", text: `상품 ${productId}의 옵션 정보를 찾을 수 없습니다.` }],
          };
        }

        const byCode = (opts: ProductOption[] = []) => new Map(opts.map((o) => [o.code, o]));
        const colors = byCode(detail.colors);
        const sizes = byCode(detail.sizes);
        const plds = byCode(detail.plds);

        const byColor = new Map<string, L2Item[]>();
        for (const l2 of result.l2s) {
          const key = `${l2.color.displayCode}`;
          if (!byColor.has(key)) byColor.set(key, []);
          byColor.get(key)!.push(l2);
        }

        const lines = [`📦 **${detail.name}** (\`${productId}\`) 옵션 목록\n`];

        for (const [colorCode, items] of byColor) {
          const colorName = colors.get(items[0].color.code)?.name ?? items[0].color.code;
          lines.push(`**색상 ${colorCode} ${colorName}**`);

          for (const item of items) {
            const size = sizes.get(item.size.code)?.name ?? item.size.displayCode;
            const pld = plds.get(item.pld.code);
            const sizeStr = pld?.display?.showFlag ? `${size} / ${pld.name}` : size;

            const stock = result.stocks?.[item.l2Id];
            // quantity는 실제 수량이 아니라 11로 상한이 걸려 있어 상태만 표시한다
            const stockStr = stock ? `온라인 ${stock.statusLocalized}` : "온라인 재고 정보 없음";

            const price = result.prices?.[item.l2Id];
            const priceStr = !price
              ? ""
              : price.promo
                ? ` | ~~${price.base.value.toLocaleString()}원~~ → ${price.promo.value.toLocaleString()}원`
                : ` | ${price.base.value.toLocaleString()}원`;

            const storeStr = item.searchInStoresAvailable ? "매장 재고 조회 가능" : "매장 재고 조회 불가";
            const saleStr = item.sales ? "" : " [판매중지]";
            lines.push(
              `  ${sizeStr}: l2Id = \`${item.l2Id}\` | ${stockStr}${priceStr} | ${storeStr}${saleStr}`
            );
          }
          lines.push("");
        }

        lines.push(
          "💡 l2Id와 위치(위도/경도)로 check_store_stock을 호출하면 인근 매장 재고를 확인할 수 있습니다."
        );

        return { content: [{ type: "text", text: lines.join("\n") }] };
      })
  );

  server.registerTool(
    "check_store_stock",
    {
      title: "매장 재고 확인",
      description:
        "특정 상품 옵션(l2Id)의 인근 매장 재고 확인. 위치 기반으로 가까운 매장부터 재고 상태를 반환합니다.",
      inputSchema: {
        l2Id: z
          .string()
          .describe("상품 옵션 ID (예: '07919089'). get_product_detail로 얻은 l2Id 사용"),
        latitude: z
          .number()
          .describe("기준 위도 (예: 37.5665 = 서울시청, 37.5172 = 강남역)"),
        longitude: z
          .number()
          .describe("기준 경도 (예: 126.9780 = 서울시청, 127.0473 = 강남역)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .default(10)
          .describe("조회할 매장 수 (가까운 순, 최대 50)"),
      },
    },
    async ({ l2Id, latitude, longitude, limit }) =>
      safe(async () => {
        const result = await getStoreStock(l2Id, latitude, longitude, limit);

        if (!result.stores || result.stores.length === 0) {
          return {
            content: [{ type: "text", text: "주변 매장 정보를 찾을 수 없습니다." }],
          };
        }

        const stockEmoji: Record<string, string> = {
          IN_STOCK: "🟢",
          LOW_STOCK: "🟡",
          OUT_OF_STOCK: "🔴",
        };
        const stockLabel: Record<string, string> = {
          IN_STOCK: "재고 있음",
          LOW_STOCK: "품절 임박",
          OUT_OF_STOCK: "재고 없음",
        };

        const lines = [
          `🏪 l2Id \`${l2Id}\` 인근 매장 재고 현황 (기준: ${latitude}, ${longitude})\n`,
          `총 ${result.pagination.total}개 매장 중 ${result.stores.length}개 표시\n`,
        ];

        for (const store of result.stores) {
          const emoji = stockEmoji[store.stockStatus] ?? "⚪";
          const label = stockLabel[store.stockStatus] ?? store.stockStatus;
          const distStr =
            store.distance < 1
              ? `${Math.round(store.distance * 1000)}m`
              : `${store.distance.toFixed(1)}km`;

          const openStr = store.businessStatus === "OPEN" ? "영업중" : "영업종료";
          const pickupStr = store.orderAndPickFlag ? " | 당일픽업 가능" : "";
          const commentStr = store.businessStatusComment
            ? ` (${store.businessStatusComment})`
            : "";

          lines.push(
            `${emoji} **${store.storeName}** — ${label}`,
            `   거리: ${distStr} | ${openStr}${commentStr}${pickupStr}`,
            ""
          );
        }

        const inStock = result.stores.filter((s) => s.stockStatus === "IN_STOCK").length;
        const lowStock = result.stores.filter((s) => s.stockStatus === "LOW_STOCK").length;
        const outOfStock = result.stores.filter(
          (s) => s.stockStatus === "OUT_OF_STOCK"
        ).length;

        lines.push(
          `📊 요약: 🟢 재고있음 ${inStock}개 | 🟡 품절임박 ${lowStock}개 | 🔴 재고없음 ${outOfStock}개`
        );

        return { content: [{ type: "text", text: lines.join("\n") }] };
      })
  );

  server.registerTool(
    "list_stores",
    {
      title: "매장 목록 조회",
      description:
        "유니클로 한국 매장 목록 조회. 매장 이름, 주소, 영업시간, 위치 정보를 반환합니다.",
      inputSchema: {
        limit: z.number().int().min(1).max(50).optional().default(20).describe("조회할 매장 수"),
        offset: z.number().int().min(0).optional().default(0).describe("페이지 오프셋"),
      },
    },
    async ({ limit, offset }) =>
      safe(async () => {
        const result = await getStores(limit, offset);

        if (!result.items || result.items.length === 0) {
          return { content: [{ type: "text", text: "매장 정보를 찾을 수 없습니다." }] };
        }

        const lines = [
          `🏬 유니클로 한국 매장 목록 (총 ${result.pagination.total}개, ${result.items.length}개 표시)\n`,
        ];

        for (const store of result.items) {
          const openStr =
            store.wdOpenAt && store.wdCloseAt
              ? `평일 ${store.wdOpenAt}~${store.wdCloseAt}`
              : store.openHours || "정보 없음";

          lines.push(
            `• **${store.name}**`,
            `  주소: ${store.address}`,
            `  영업: ${openStr} | 전화: ${store.phone || "없음"}`,
            `  위치: ${store.lat}, ${store.lon}`,
            ""
          );
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      })
  );

  return server;
}

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "mcp-session-id", "Last-Event-ID", "mcp-protocol-version"],
    exposeHeaders: ["mcp-session-id", "mcp-protocol-version"],
  })
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/diagram", (c) => c.html(diagramHtml));

app.all("/mcp", async (c) => {
  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = createMcpServer();
  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
});

export default app;
