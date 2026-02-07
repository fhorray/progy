import type { ServerType } from "../types";

const aiHintHandler: ServerType<"/api/ai/hint"> = async () => {
  return Response.json({ hint: "Thinking..." });
};

export const aiRoutes = {
  "/api/ai/hint": { POST: aiHintHandler }
};
