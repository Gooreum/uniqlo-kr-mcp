import type {
  UniqloApiResponse,
  ProductSearchResult,
  L2sResult,
  ProductDetailResult,
  StoreStockResult,
  StoreListResult,
} from "./types.js";

const BASE_URL = "https://www.uniqlo.com";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

export class UniqloApiError extends Error {}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new UniqloApiError(`유니클로 서버 응답 오류 (HTTP ${res.status})`);
  }
  const data = (await res.json()) as UniqloApiResponse<T>;
  if (data.status !== "ok") {
    const notFound = data.error?.httpStatusCode === 404;
    throw new UniqloApiError(
      notFound
        ? "요청한 상품/옵션을 찾을 수 없습니다. ID를 다시 확인해 주세요."
        : `유니클로 API 오류 (code ${data.error?.code ?? "?"})`
    );
  }
  return data.result;
}

export async function searchProducts(query: string, limit = 10, offset = 0) {
  const params = new URLSearchParams({
    q: query,
    offset: String(offset),
    limit: String(limit),
  });
  return apiFetch<ProductSearchResult>(
    `/kr/api/commerce/v5/ko/products?${params}`
  );
}

export async function getProductDetail(productId: string) {
  return apiFetch<ProductDetailResult>(
    `/kr/api/commerce/v5/ko/products/${productId}/price-groups/00/details`
  );
}

export async function getProductL2s(productId: string) {
  return apiFetch<L2sResult>(
    `/kr/api/commerce/v5/ko/products/${productId}/price-groups/00/l2s?withPrices=true&withStocks=true`
  );
}

export async function getStoreStock(
  l2Id: string,
  lat: number,
  lon: number,
  limit = 10
) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    unit: "km",
    priceGroup: "00",
    limit: String(limit),
  });
  return apiFetch<StoreStockResult>(
    `/kr/api/commerce/v5/ko/l2s/${l2Id}/stores?${params}`
  );
}

export async function getStores(limit = 20, offset = 0, keyword?: string) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (keyword) params.set("keyword", keyword);
  return apiFetch<StoreListResult>(
    `/kr/api/commerce/v5/ko/stores?${params}`
  );
}
