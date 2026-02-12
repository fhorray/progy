import { generateText, streamText } from "ai";
import { getModel, constructSystemPrompt, constructExplanationPrompt, constructGeneratePrompt, type AIConfig, type AIContext } from "../lib/ai";
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema';

export class AIService {
  constructor(private env: CloudflareBindings) { }

  private get db() {
    return drizzle(this.env.DB);
  }

  async getFinalConfig(user: any, clientConfig: AIConfig) {
    let finalConfig: AIConfig = {
      provider: clientConfig?.provider || 'openai',
      model: clientConfig?.model
    };

    const subscription = await this.db.select().from(schema.subscription)
      .where(and(
        eq(schema.subscription.referenceId, user.id),
        eq(schema.subscription.status, 'active')
      )).all();

    const isPro = subscription.some(s => s.plan === 'pro') || (user as any).subscription === 'pro';
    const isLifetime = subscription.some(s => s.plan === 'lifetime') || (user as any).subscription === 'lifetime';

    if (isPro) {
      finalConfig.apiKey = this.env.OPENAI_API_KEY;
      finalConfig.provider = 'openai';
    } else if (isLifetime) {
      if (!clientConfig?.apiKey) throw new Error('Lifetime plan requires your own API Key');
      finalConfig.apiKey = clientConfig.apiKey;
      finalConfig.provider = clientConfig.provider || 'openai';
    } else {
      // Free Tier
      finalConfig.apiKey = this.env.OPENAI_API_KEY;
      finalConfig.provider = 'openai';
    }

    if (!finalConfig.apiKey) throw new Error('Missing AI configuration');
    return finalConfig;
  }

  async checkAndIncrementUsage(user: any) {
    const subscription = await this.db.select().from(schema.subscription)
      .where(and(
        eq(schema.subscription.referenceId, user.id),
        eq(schema.subscription.status, 'active')
      )).all();

    const isPro = subscription.some(s => s.plan === 'pro') || (user as any).subscription === 'pro';
    const isLifetime = subscription.some(s => s.plan === 'lifetime') || (user as any).subscription === 'lifetime';

    if (isPro || isLifetime) return;

    const date = new Date().toISOString().split('T')[0];
    const key = `ai_usage:${user.id}:${date}`;
    const usedStr = await this.env.KV.get(key);
    const used = usedStr ? parseInt(usedStr) : 0;

    if (used >= 3) {
      throw new Error('Daily AI limit reached (3/3). Upgrade to Pro for unlimited access.');
    }

    // Expire in 24 hours (86400 seconds)
    await this.env.KV.put(key, (used + 1).toString(), { expirationTtl: 86400 });
  }

  async getUsage(user: any) {
    const date = new Date().toISOString().split('T')[0];
    const key = `ai_usage:${user.id}:${date}`;
    const usedStr = await this.env.KV.get(key);
    const used = usedStr ? parseInt(usedStr) : 0;

    return {
      used,
      limit: 3,
      remaining: Math.max(0, 3 - used)
    };
  }

  async generate(user: any, prompt: string, difficulty: string, clientConfig: AIConfig) {
    await this.checkAndIncrementUsage(user);
    const config = await this.getFinalConfig(user, clientConfig);
    const model = getModel(config);
    const system = constructGeneratePrompt(prompt, difficulty);

    const { text } = await generateText({
      model,
      system,
      prompt: "Generate the coding challenge JSON now.",
    });

    return JSON.parse(text);
  }

  async hint(user: any, context: AIContext, clientConfig: AIConfig) {
    await this.checkAndIncrementUsage(user);
    const config = await this.getFinalConfig(user, clientConfig);
    const model = getModel(config);
    const system = constructSystemPrompt(context);

    return streamText({
      model,
      system,
      prompt: "Based on the failure above, give me a single helpful hint to fix the code. Do not give the full solution.",
    });
  }

  async explain(user: any, context: AIContext, clientConfig: AIConfig) {
    await this.checkAndIncrementUsage(user);
    const config = await this.getFinalConfig(user, clientConfig);
    const model = getModel(config);
    const system = constructExplanationPrompt(context);

    return streamText({
      model,
      system,
      prompt: "Explain the concepts involved in this exercise comprehensively but concisely.",
    });
  }

  async chat(user: any, messages: any[], context: AIContext, clientConfig: AIConfig) {
    await this.checkAndIncrementUsage(user);
    const config = await this.getFinalConfig(user, clientConfig);
    const model = getModel(config);
    const system = constructSystemPrompt(context);

    const validMessages = messages.filter(m =>
      (typeof m.content === 'string' && m.content.trim().length > 0) ||
      (Array.isArray(m.parts) && m.parts.length > 0)
    );

    return streamText({
      model,
      system,
      messages: validMessages,
    });
  }
}
