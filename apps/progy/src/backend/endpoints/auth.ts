import type { ServerType } from "../types";
import { getGlobalConfig, updateGlobalConfig } from "../helpers";

const getTokenHandler: ServerType<"/api/auth/token"> = async () => {
  const config = await getGlobalConfig();
  return Response.json({ token: config?.token || null });
};

const logoutHandler: ServerType<"/api/auth/token"> = async () => {
  await updateGlobalConfig({ token: null });
  return Response.json({ success: true });
};

export const authRoutes = {
  "/api/auth/token": {
    GET: getTokenHandler,
    POST: logoutHandler
  }
};
