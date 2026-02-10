import { getGlobalConfig, updateGlobalConfig } from "@progy/core";
import type { ServerType } from "@progy/core";

const getTokenHandler: ServerType<"/auth/token"> = async () => {
  const config = await getGlobalConfig();
  return Response.json({ token: config?.token || null });
};

const logoutHandler: ServerType<"/auth/token"> = async () => {
  await updateGlobalConfig({ token: "" });
  return Response.json({ success: true });
};

export const authRoutes = {
  "/auth/token": {
    GET: getTokenHandler,
    POST: logoutHandler
  }
};
