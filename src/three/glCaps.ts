let cachedSoftwareGl: boolean | null = null;

/**
 * Detect software WebGL renderers (SwiftShader, llvmpipe, WARP) from the
 * WebGL2 renderer string so rendering cost (pixel ratio, shadows, multi-pass
 * postprocessing, frame pacing) scales gracefully without altering scene geometry.
 */
export function detectSoftwareGl(): boolean {
  if (cachedSoftwareGl !== null) return cachedSoftwareGl;
  if (typeof document === "undefined") {
    cachedSoftwareGl = false;
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const rendererStr = String(gl.getParameter(param) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    cachedSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software|Basic Render|Mesa OffScreen/i.test(
        rendererStr,
      );
  } catch {
    cachedSoftwareGl = true;
  }
  return cachedSoftwareGl;
}

export function applyGpuSurfaceClass(): boolean {
  const software = detectSoftwareGl();
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("gpu-blur", !software);
  }
  return software;
}
