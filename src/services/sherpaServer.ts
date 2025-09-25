// filepath: /Users/liupeiqiang/Work/0.yuanze/electron-sherpa-onnx-demo/src/services/sherpaServer.ts
import { spawn, ChildProcess } from "child_process";
import { app } from "electron";
import path from "path";
import fs from "fs";

class SherpaServer {
  private serverProcess: ChildProcess | null = null;
  private isRunning = false;

  private getResourcePath(): string {
    if (app.isPackaged) {
      // electron-forge 打包后的资源路径
      return path.join(process.resourcesPath, "resources");
    } else {
      // 开发环境路径
      return path.join(process.cwd(), "resources");
    }
  }

  private getBinaryPath(): string {
    const resourcePath = this.getResourcePath();
    const platform = process.platform;
    const arch = process.arch;

    let binaryName = "sherpa-onnx-online-websocket-server";
    if (platform === "win32") {
      binaryName += ".exe";
      return path.join(resourcePath, "binaries", platform, arch, binaryName);
    }

    return path.join(resourcePath, "binaries", platform, binaryName);
  }

  private getModelPaths() {
    const resourcePath = this.getResourcePath();
    const modelsPath = path.join(resourcePath, "models");

    return {
      tokens: path.join(modelsPath, "tokens.txt"),
      encoder: path.join(modelsPath, "encoder-epoch-99-avg-1.onnx"),
      decoder: path.join(modelsPath, "decoder-epoch-99-avg-1.onnx"),
      joiner: path.join(modelsPath, "joiner-epoch-99-avg-1.onnx"),
      logFile: path.join(modelsPath, "log.txt"),
    };
  }

  private async checkFiles(): Promise<boolean> {
    const binaryPath = this.getBinaryPath();
    const modelPaths = this.getModelPaths();

    console.log("Checking binary at:", binaryPath);
    console.log("Checking models at:", modelPaths);

    // 检查二进制文件
    if (!fs.existsSync(binaryPath)) {
      console.error(`Binary not found: ${binaryPath}`);
      return false;
    }

    // 检查模型文件
    const requiredFiles = [
      modelPaths.tokens,
      modelPaths.encoder,
      modelPaths.decoder,
      modelPaths.joiner,
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.error(`Model file not found: ${file}`);
        return false;
      }
    }

    return true;
  }

  public async start(port = 6006): Promise<boolean> {
    if (this.isRunning) {
      console.log("Sherpa server is already running");
      return true;
    }

    // 检查必要文件
    const filesExist = await this.checkFiles();
    if (!filesExist) {
      console.error("Required files not found");
      return false;
    }

    const binaryPath = this.getBinaryPath();
    const modelPaths = this.getModelPaths();

    // 设置执行权限 (Unix系统)
    if (process.platform !== "win32") {
      try {
        fs.chmodSync(binaryPath, "755");
      } catch (error) {
        console.error("Failed to set executable permission:", error);
      }
    }

    const args = [
      `--port=${port}`,
      "--num-work-threads=8",
      `--tokens=${modelPaths.tokens}`,
      `--encoder=${modelPaths.encoder}`,
      `--decoder=${modelPaths.decoder}`,
      `--joiner=${modelPaths.joiner}`,
      `--log-file=${modelPaths.logFile}`,
      "--max-batch-size=1",
      "--loop-interval-ms=50",
      "--sample-rate=16000",
    ];

    try {
      console.log(`Starting Sherpa server: ${binaryPath}`);
      console.log("Args:", args);

      this.serverProcess = spawn(binaryPath, args, {
        stdio: ["pipe", "pipe", "pipe"],
        detached: false,
      });

      this.serverProcess.stdout?.on("data", (data) => {
        console.log(`Sherpa stdout: ${data}`);
      });

      this.serverProcess.stderr?.on("data", (data) => {
        console.error(`Sherpa stderr: ${data}`);
      });

      this.serverProcess.on("close", (code) => {
        console.log(`Sherpa server exited with code ${code}`);
        this.isRunning = false;
        this.serverProcess = null;
      });

      this.serverProcess.on("error", (error) => {
        console.error("Failed to start Sherpa server:", error);
        this.isRunning = false;
        this.serverProcess = null;
      });

      // 等待服务器启动
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (this.serverProcess && !this.serverProcess.killed) {
        this.isRunning = true;
        console.log("Sherpa server started successfully");
        return true;
      } else {
        console.error("Sherpa server failed to start");
        return false;
      }
    } catch (error) {
      console.error("Error starting Sherpa server:", error);
      return false;
    }
  }

  public stop(): void {
    if (this.serverProcess && this.isRunning) {
      console.log("Stopping Sherpa server...");
      this.serverProcess.kill("SIGTERM");
      this.serverProcess = null;
      this.isRunning = false;
    }
  }

  public getStatus(): { isRunning: boolean; pid?: number } {
    return {
      isRunning: this.isRunning,
      pid: this.serverProcess?.pid,
    };
  }
}

// 单例实例
export const sherpaServer = new SherpaServer();
