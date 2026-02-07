import type { ServerType } from "../types";
import { getGlobalConfig, updateGlobalConfig } from "../helpers";

const getSettingsHandler: ServerType<"/api/local-settings"> = async () => {
  const config = await getGlobalConfig();
  // Filter out the token to avoid exposing it unnecessarily in settings
  const { token, ...settings } = config || {};
  return Response.json(settings);
};

const updateSettingsHandler: ServerType<"/api/local-settings"> = async (req) => {
  const updates = await req.json();
  await updateGlobalConfig(updates);
  return Response.json({ success: true });
};

export const settingsRoutes = {
  "/api/local-settings": {
    GET: getSettingsHandler,
    POST: updateSettingsHandler
  }
};
