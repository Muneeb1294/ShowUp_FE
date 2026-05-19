import api, { getErrorMessage } from "./axios.js";

export async function fetchCategories() {
  const { data } = await api.get("/api/v1/categories");
  if (!data.success) throw new Error(data.message || "Failed to load categories");
  return data.categories;
}

export { getErrorMessage };
