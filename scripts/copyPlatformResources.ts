import path from "node:path";
import fs from "node:fs";

/**
 * Copy only the resources needed for the target platform into the packaged app's Resources folder.
 * - Always copies resources/models/*
 * - For darwin: copies resources/binaries/darwin/sherpa-onnx-online-websocket-server (chmod 755)
 * - For win32: copies resources/binaries/win32/<arch>/sherpa-onnx-online-websocket-server.exe
 *
 * buildPath points to the app dir that Electron Forge created for your code (e.g., .../Contents/Resources/app on macOS).
 */
export function copyPlatformResources(
  buildPath: string,
  platform: string,
  arch: string,
  projectRoot: string
) {
  // Compute destination Resources dir (sibling of "app") and source resources dir
  const resourcesOutDir = path.resolve(buildPath, ".."); // .../Contents/Resources (mac) or resources (win)
  const resourcesSrcDir = path.join(projectRoot, "resources");
  const destResourcesRoot = path.join(resourcesOutDir, "resources");

  console.log(`Project root: ${projectRoot}`);
  console.log(`Build path: ${buildPath}`);
  console.log(`Resources source dir: ${resourcesSrcDir}`);
  console.log(`Resources output dir: ${resourcesOutDir}`);
  console.log(`Copying platform-specific resources to ${destResourcesRoot}`);

  // Helper to copy a directory recursively
  const copyDirSync = (src: string, dest: string) => {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (!stat.isDirectory()) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      return;
    }
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      const s = path.join(src, entry);
      const d = path.join(dest, entry);
      const st = fs.statSync(s);
      if (st.isDirectory()) {
        copyDirSync(s, d);
      } else {
        fs.mkdirSync(path.dirname(d), { recursive: true });
        fs.copyFileSync(s, d);
      }
    }
  };

  // Ensure destination root exists
  fs.mkdirSync(destResourcesRoot, { recursive: true });

  // Always include models
  copyDirSync(
    path.join(resourcesSrcDir, "models"),
    path.join(destResourcesRoot, "models")
  );

  // Include only the platform-specific binary
  if (platform === "darwin") {
    const binName = "sherpa-onnx-online-websocket-server";
    const binSrc = path.join(resourcesSrcDir, "binaries", "darwin", binName);
    const binDest = path.join(destResourcesRoot, "binaries", "darwin", binName);
    if (fs.existsSync(binSrc)) {
      fs.mkdirSync(path.dirname(binDest), { recursive: true });
      fs.copyFileSync(binSrc, binDest);
      // Ensure executable bit on macOS binary
      try {
        fs.chmodSync(binDest, 0o755);
      } catch {
        // ignore chmod errors on non-unix filesystems or CI environments
      }
    }
  } else if (platform === "win32") {
    const binName = "sherpa-onnx-online-websocket-server.exe";
    const binSrc = path.join(
      resourcesSrcDir,
      "binaries",
      "win32",
      arch,
      binName
    );
    const binDest = path.join(
      destResourcesRoot,
      "binaries",
      "win32",
      arch,
      binName
    );
    if (fs.existsSync(binSrc)) {
      fs.mkdirSync(path.dirname(binDest), { recursive: true });
      fs.copyFileSync(binSrc, binDest);
    }
  }
}
