const API = "/api";

function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Products
export async function fetchProducts(category) {
  const url = category && category !== "all" ? `${API}/products?category=${category}` : `${API}/products`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API}/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createProduct(formData) {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function updateProduct(id, formData) {
  const res = await fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API}/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return res.json();
}

export async function deleteProductImage(id, imagePath) {
  const res = await fetch(`${API}/products/${id}/image`, {
    method: "DELETE",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ imagePath }),
  });
  return res.json();
}

// Reels
export async function fetchReels() {
  const res = await fetch(`${API}/reels`);
  return res.json();
}

export async function createReel(formData) {
  const res = await fetch(`${API}/reels`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function updateReel(id, formData) {
  const res = await fetch(`${API}/reels/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function deleteReel(id) {
  const res = await fetch(`${API}/reels/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return res.json();
}

// Admin Auth
export async function adminLogin(username, password) {
  const res = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export async function verifyAdmin() {
  const res = await fetch(`${API}/admin/verify`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return res.ok;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${API}/admin/password`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error("Failed to change password");
  return res.json();
}

// Orders
export async function createOrder(order) {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API}/orders`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${API}/orders/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`${API}/orders/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });
  return res.json();
}

// Pesapal
export async function initiatePayment(paymentDetails) {
  const res = await fetch(`${API}/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentDetails),
  });
  return res.json();
}

export async function getPaymentStatus(orderTrackingId) {
  const res = await fetch(`${API}/payments/status/${orderTrackingId}`);
  return res.json();
}
