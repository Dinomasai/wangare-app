const API = "/api";

function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson(promise, fallback) {
  try {
    const res = await promise;
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

// Products
export async function fetchProducts(category) {
  const url = category && category !== "all" ? `${API}/products?category=${category}` : `${API}/products`;
  return safeJson(fetch(url), []);
}

export async function fetchProduct(id) {
  return safeJson(fetch(`${API}/products/${id}`), null);
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
  return safeJson(fetch(`${API}/reels`), []);
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
  try {
    const res = await fetch(`${API}/admin/verify`, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
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
  return safeJson(fetch(`${API}/orders`, { headers: authHeaders() }), []);
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
  try {
    const res = await fetch(`${API}/payments/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentDetails),
    });
    return res.json();
  } catch {
    return { success: false, error: "Payment service unreachable" };
  }
}

export async function getPaymentStatus(orderTrackingId) {
  return safeJson(fetch(`${API}/payments/status/${orderTrackingId}`), { success: false });
}
