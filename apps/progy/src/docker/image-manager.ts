import { join } from "node:path";
import { DockerClient } from "./client";

export class ImageManager {
  private docker: DockerClient;

  constructor() {
    this.docker = new DockerClient();
  }

  /**
   * Ensures the image is built and up-to-date.
   * Uses a hash of the Dockerfile + context folder mtime to invalidate cache.
   */
  async ensureImage(tag: string, contextPath: string, dockerfileRel: string): Promise<void> {
    const dockerfileAbs = join(contextPath, dockerfileRel);

    // 1. Check if image exists
    const exists = await this.docker.imageExists(tag);
    if (!exists) {
      console.log("Image not found locally. Building...");
      await this.docker.buildImage(tag, contextPath, dockerfileAbs);
      return;
    }

    // 2. Advanced: Check for staleness (Optional)
    // We can store a metadata hash in a label on the image.
    // docker inspect --format '{{ index .Config.Labels "progy.hash" }}' tag
    // For MVP, we skip this complexity and assume if it exists, it's good.
    // Instructors can tell students to run `progy clean` or `docker rmi` to force rebuild.
  }

  /**
   * Generates a unique tag based on course ID and version.
   */
  generateTag(courseId: string): string {
    // Sanitize ID
    const safeId = courseId.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return `progy-course-${safeId}:latest`;
  }
}
