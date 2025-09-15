// simplified-quantum.js

const { ipcRenderer } = require("electron");

/**
 * 简化版量子算法处理器
 * 使用 IPC 与主进程通信实现真实文件读写
 */
class QuantumProcessor {
  constructor() {
    this.lpnInput = "src/data/quantum/lpn/input_gen.txt";
    this.lpnOutput = "src/data/quantum/lpn/output.txt";
  }

  /**
   * 验证 LPN 参数
   */
  validateParams(params) {
    const { paramCount, equationCount, errorRate, initialParams } = params;
    if (!paramCount || !equationCount || errorRate == null || !initialParams) {
      throw new Error("缺少必要参数");
    }
    if (paramCount < 1 || paramCount > 10000)
      throw new Error("变量个数范围错误");
    if (equationCount < 1 || equationCount > 10000)
      throw new Error("方程个数范围错误");
    if (errorRate < 0 || errorRate > 1) throw new Error("误差概率范围错误");
    if (initialParams < 1 || initialParams > 10000)
      throw new Error("初始参数次数范围错误");
  }

  /**
   * 生成 LPN 参数并写入文件
   */
  async generateLPNParams(params) {
    this.validateParams(params);

    const content = [
      `paramCount=${params.paramCount}`,
      `equationCount=${equationCount}`,
      `errorRate=${errorRate}`,
      `initialParams=${initialParams}`,
      `timestamp=${Date.now()}`,
      `type=generate_lpn`,
    ].join("\n");

    const result = await ipcRenderer.invoke(
      "fs-write-file",
      this.lpnInput,
      content
    );
    if (!result.success) throw new Error(`写入失败: ${result.error}`);
    console.log("参数已写入:", this.lpnInput);
    return result;
  }

  /**
   * 模拟执行（可替换为调用算法或后端）
   */
  async simulateExecution() {
    // 模拟处理时间
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const content = [
      `execution_time=${(2.45 + Math.random() * 0.5).toFixed(2)}s`,
      `success_rate=${(95.8 + Math.random() * 3).toFixed(1)}%`,
      `solution_type=simulated`,
      `solution_data=x1=123456789...\\nx2=987654321...`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const result = await ipcRenderer.invoke(
      "fs-write-file",
      this.lpnOutput,
      content
    );
    if (!result.success) throw new Error(`输出写入失败: ${result.error}`);
    console.log("执行完成，结果已保存:", this.lpnOutput);
    return result;
  }

  /**
   * 读取输出文件
   */
  async readOutput() {
    const result = await ipcRenderer.invoke("fs-read-file", this.lpnOutput);
    if (!result.success) {
      console.warn("读取失败:", result.error);
      return null;
    }
    console.log("读取结果:", result.data);
    return result.data;
  }

  /**
   * 一键生成并执行
   */
  async runLPN(params) {
    try {
      await this.generateLPNParams(params);
      await this.simulateExecution();
      const output = await this.readOutput();
      return { success: true, output };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 导出实例
const quantumProcessor = new QuantumProcessor();

// 暴露到 window（用于调试）
if (typeof window !== "undefined") {
  window.quantumProcessor = quantumProcessor;
}

module.exports = { quantumProcessor };
