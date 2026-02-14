
import type { WorkflowStep } from 'cloudflare:workers';

export const workflowLogger = (step: WorkflowStep, context: string) => {
  let counter = 0;

  const log = async (message: string, level: 'info' | 'error' | 'warn' = 'info') => {
    counter++;
    // Create a unique step name for each log entry to avoid deduplication issues
    // We truncate the message in the step name to keep it readable but distinct
    const stepName = `Log ${counter}: [${context}] ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`;

    // Return the result so it shows up in the Cloudflare Workflow UI output
    return await step.do(stepName, async () => {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;

      if (level === 'error') {
        console.error(formattedMessage);
      } else {
        console.log(formattedMessage);
      }

      return {
        timestamp,
        level,
        context,
        message,
        formatted: formattedMessage
      };
    });
  };

  return {
    info: (msg: string) => log(msg, 'info'),
    error: (msg: string) => log(msg, 'error'),
    warn: (msg: string) => log(msg, 'warn'),
  };
};