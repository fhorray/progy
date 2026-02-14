
import { loadToken, BACKEND_URL } from "@progy/core";

const getNotifications = async () => {
  const token = await loadToken();
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

const markAsRead = async (req: Request) => {
  const token = await loadToken();
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/notifications/read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

const markAllAsRead = async () => {
  const token = await loadToken();
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND_URL}/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const notificationRoutes = {
  "/notifications": getNotifications,
  "/notifications/read": markAsRead,
  "/notifications/read-all": markAllAsRead,
};
