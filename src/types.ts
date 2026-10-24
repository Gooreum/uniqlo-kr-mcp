export interface UniqloApiResponse<T> {
  status: "ok" | "nok";
  result: T;
  error?: {
    code: number;
    httpStatusCode: number;
    details: unknown[];
  };
}

export interface ProductSearchResult {
  pagination: { total: number; count: number; offset: number };
  items: ProductItem[];
}

export interface ProductItem {
  productId: string;
  name: string;
  genderCategory: string;
  prices: {
    base: { value: number; currency: string };
    promo?: { value: number; currency: string };
  };
  images: {
    main: Record<string, { image: string }>;
  };
  colors: Array<{
    code: string;
    displayCode: string;
    name: string;
  }>;
}

export interface L2sResult {
  l2s: L2Item[];
  stocks: Record<string, L2Stock>;
  prices: Record<string, L2Price>;
}

export interface L2Stock {
  statusCode: string;
  quantity: number;
  statusLocalized: string;
}

export interface L2Price {
  base: { value: number };
  promo: { value: number } | null;
}

export interface ProductOption {
  code: string;
  displayCode: string;
  name: string;
  display?: { showFlag: boolean };
}

export interface ProductDetailResult {
  productId: string;
  name: string;
  colors: ProductOption[];
  sizes: ProductOption[];
  plds: ProductOption[];
}

export interface L2Item {
  l2Id: string;
  communicationCode: string;
  color: { code: string; displayCode: string };
  size: { code: string; displayCode: string };
  pld: { code: string; displayCode: string };
  sales: boolean;
  salesType: string;
  searchInStoresAvailable: boolean;
}

export interface StoreStockResult {
  pagination: { total: number; count: number; offset: number };
  stores: StoreStockItem[];
}

export interface StoreStockItem {
  storeId: string;
  g1ImsStoreId6: string;
  storeName: string;
  distance: number;
  businessStatus: "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED";
  businessStatusComment: string;
  irregularOpenTimeComment: string;
  storeTypeCode: number;
  orderAndPickFlag: boolean;
  kidsFlag: boolean;
  babyFlag: boolean;
  menFlag: boolean;
  womenFlag: boolean;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface StoreListResult {
  pagination: { total: number; count: number; offset: number };
  items: StoreItem[];
}

export interface StoreItem {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat: string;
  lon: string;
  area1Name: string;
  municipality: string;
  openHours: string;
  businessStatus: string;
  wdOpenAt: string;
  wdCloseAt: string;
  inventoryFlg: number;
}
