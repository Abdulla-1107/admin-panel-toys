const API_BASE = "https://api.mahinadolls.uz";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  // DELETE yoki bo'sh body kelsa xato bermasin
  const text = await res.text();
  if (!text) return undefined as unknown as T;

  const json = JSON.parse(text);

  // { success, data } wrapper bo'lsa data ni qaytaradi
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }

  // wrapper bo'lmasa to'g'ridan qaytaradi
  return json as T;
}

// Products
export interface Product {
  id: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
  description_uz: string;
  description_en: string;
  description_ru: string;
  price: number;
  image: string;
  categoryId: string;
}

export type ProductInput = Omit<Product, "id">;

export const getProducts = (params?: {
  limit?: number;
}) => {
  const query = params
    ? "?" + new URLSearchParams(params as any).toString()
    : "";

  return request<Product[]>(`/product${query}`);
};
export const createProduct = (data: ProductInput) =>
  request<Product>("/product", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id: string, data: ProductInput) =>
  request<Product>(`/product/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteProduct = (id: string) =>
  request(`/product/${id}`, { method: "DELETE" });

// Categories
export interface Category {
  id: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
}

export type CategoryInput = Omit<Category, "id">;

export const getCategories = () => request<Category[]>("/category");
export const createCategory = (data: CategoryInput) =>
  request<Category>("/category", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateCategory = (id: string, data: CategoryInput) =>
  request<Category>(`/category/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteCategory = (id: string) =>
  request(`/category/${id}`, { method: "DELETE" });

// Orders
export interface Order {
  id: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

export const getOrders = () => request<Order[]>("/order");
export const deleteOrder = (id: string) =>
  request(`/order/${id}`, { method: "DELETE" });
