import { WorkflowEntrypoint } from 'cloudflare:workers';
import type { WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateText } from 'ai';
import { getModel } from '../lib/ai';
import { unzipSync } from 'fflate';

type CourseGuardParams = {
  versionId: string;
  packageName: string;
  version: string;
};

export class CourseGuardWorkflow extends WorkflowEntrypoint<CloudflareBindings, CourseGuardParams> {
  async run(event: WorkflowEvent<CourseGuardParams>, step: WorkflowStep): Promise<void> {
    const { versionId, packageName, version } = event.payload;
    const db = drizzle(this.env.DB);

    // 0. Fetch Artifact from R2 and Unzip
    const unzippedFiles = await step.do('Unzip Artifact', async () => {
      // Get storage key from DB first
      const versionData = await db.select({
        storageKey: schema.registryVersions.storageKey
      })
        .from(schema.registryVersions)
        .where(eq(schema.registryVersions.id, versionId))
        .get();

      if (!versionData?.storageKey) throw new Error('Artifact storage key not found');

      console.log(`[CourseGuard] Fetching artifact: ${versionData.storageKey}`);
      const obj = await this.env.R2.get(versionData.storageKey);
      if (!obj) throw new Error('Artifact not found in R2');

      const buffer = await obj.arrayBuffer();
      const files = unzipSync(new Uint8Array(buffer));

      console.log(`[CourseGuard] Unzipped ${Object.keys(files).length} files`);

      // Convert to a plain object with hex or text representation if needed, 
      // but here we just need to know which ones are scripts and course.json
      return Object.keys(files).reduce((acc: Record<string, string>, key) => {
        // We only care about text files for validation
        const content = new TextDecoder().decode(files[key]);
        acc[key] = content;
        return acc;
      }, {});
    });

    // 1. Static Analysis (Security Scan)
    const securityResult = await step.do('Security Scan', async () => {
      const scriptExtensions = ['.py', '.sh', '.js', 'Dockerfile'];
      const filesToScan = Object.keys(unzippedFiles).filter(key =>
        scriptExtensions.some(ext => key.endsWith(ext))
      );

      console.log(`[CourseGuard-Security] Files matched for scanning: ${filesToScan.join(', ')}`);

      if (filesToScan.length === 0) {
        console.log(`[CourseGuard-Security] No scripts found to scan. Skipping.`);
        return { passed: true, reason: 'No scripts to scan' };
      }

      // Sample a few files for AI review
      const sample = filesToScan.slice(0, 5);
      let contextFiles = "";

      for (const key of sample) {
        contextFiles += `\n--- FILE: ${key} ---\n${unzippedFiles[key]}\n`;
      }

      console.log(`[CourseGuard-Security] Sending sample to AI for review...`);
      const model = getModel({ provider: 'openai', apiKey: this.env.OPENAI_API_KEY });

      const { text } = await generateText({
        model,
        system: `You are a security auditor for an educational coding platform. 
        Your goal is to detect MALICIOUS intent or CRITICAL risks that could harm a STUDENT'S local machine or Docker environment.
        
        ALLOWED (Educational Context):
        - Hardcoded database credentials (e.g., DB_USER, DB_PASS) for local exercises.
        - Simplified SQL interactions for learning purposes.
        - Local network calls expected for the course.

        FORBIDDEN (Actual Risks):
        - Remote Code Execution (RCE) on the student's host machine (outside Docker).
        - Malicious data exfiltration (sending user files to external servers).
        - Exploits that target the student's personal files or system settings.
        - Intentional malware or clear backdoor attempts.

        Respond with 'SAFE' if the code is acceptable for a student to run.
        Respond with 'DANGEROUS: <reason>' ONLY if there is a real threat to the student.`,
        prompt: contextFiles,
      });

      console.log(`[CourseGuard-Security] AI detection result: ${text}`);

      return {
        passed: text.startsWith('SAFE'),
        reason: text
      };
    });

    if (!securityResult.passed) {
      console.error(`[CourseGuard] Failed Security Scan: ${securityResult.reason}`);
      await db.update(schema.registryVersions)
        .set({ status: 'rejected', statusMessage: `Security: ${securityResult.reason}` })
        .where(eq(schema.registryVersions.id, versionId));
      return;
    }

    // 2. Schema Validation
    const schemaResult = await step.do('Schema Validation', async () => {
      const courseJsonContent = unzippedFiles['course.json'];

      if (!courseJsonContent) {
        console.error(`[CourseGuard-Schema] course.json not found in ZIP`);
        return { passed: false, reason: 'Missing course.json' };
      }

      try {
        const content = JSON.parse(courseJsonContent);
        console.log(`[CourseGuard-Schema] Successfully parsed course.json. Title: ${content.title}`);
        if (!content.title || !content.lessons) {
          console.error(`[CourseGuard-Schema] Invalid structure: title or lessons missing`);
          return { passed: false, reason: 'Invalid course.json structure' };
        }
        return { passed: true };
      } catch (e: any) {
        console.error(`[CourseGuard-Schema] Parse error: ${e.message}`);
        return { passed: false, reason: 'Malformed course.json' };
      }
    });

    if (!schemaResult.passed) {
      await db.update(schema.registryVersions)
        .set({ status: 'rejected', statusMessage: `Schema: ${schemaResult.reason}` })
        .where(eq(schema.registryVersions.id, versionId));
      return;
    }

    // 3. Final Approval
    await step.do('Finalize Approval', async () => {
      await db.update(schema.registryVersions)
        .set({ status: 'active', statusMessage: 'All checks passed' })
        .where(eq(schema.registryVersions.id, versionId));

      console.log(`[CourseGuard] Successfully approved ${packageName}@${version}`);
    });
  }
}
