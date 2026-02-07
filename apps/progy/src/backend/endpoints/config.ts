import type { ServerType } from "../types";
import { ensureConfig, currentConfig } from "../helpers";

const configHandler: ServerType<"/api/config"> = async () => {
  await ensureConfig();
  return Response.json({
    ...(currentConfig || {}),
    remoteApiUrl: process.env.PROGY_API_URL || "https://progy.francy.workers.dev"
  });
};

export const configRoutes = {
  "/api/config": { GET: configHandler }
};
