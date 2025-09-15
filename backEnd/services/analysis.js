// analysis.js - 密码分析页面相关业务逻辑
const { config, getFilePath } = require("../config");
const {
  generateRandomBits,
  validateBitString,
  generateSimulatedResult,
  delay,
  writeFile,
  readFile,
} = require("../utils/common");
const fs = require("fs-extra");

/**
 * PBLPKE算法安全性评估服务
 */
class PBLPKEAnalysisService {
  static async evaluate(params) {
    const { n, q, norm } = params;

    // 参数验证
    if (!n || !q || !norm) {
      throw new Error("缺少必要参数：n, q, norm");
    }

    if (n < 1 || n > 10000) {
      throw new Error("维度n范围应在1-10000之间");
    }

    if (q < 2) {
      throw new Error("模数q必须大于1");
    }

    if (norm < 1) {
      throw new Error("最大范数必须为正数");
    }

    await delay(2000);

    // 生成模拟的安全性评估结果
    const result = this.generateSecurityMetrics(n, q, norm);

    // 写入输入文件
    const inputContent = [
      `algorithm=PBLPKE`,
      `n=${n}`,
      `q=${q}`,
      `norm=${norm}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const inputFile = getFilePath("analysis", "pblpke_input.txt");
    await writeFile(inputFile, inputContent);

    // 写入输出文件
    const outputContent = [
      `rop=${result.rop}`,
      `red=${result.red}`,
      `svP=${result.svP}`,
      `mem=${result.mem}`,
      `beta=${result.beta}`,
      `d=${result.d}`,
      `eta=${result.eta}`,
      `delta=${result.delta}`,
      `zeta=${result.zeta}`,
      `S=${result.S}`,
      `prob=${result.prob}`,
      `U=${result.U}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const outputFile = getFilePath("analysis", "pblpke_output.txt");
    await writeFile(outputFile, outputContent);

    return {
      inputFile,
      outputFile,
      results: result,
    };
  }

  static generateSecurityMetrics(n, q, norm) {
    // 基于输入参数生成合理的安全性指标
    const logN = Math.log2(n);
    const logQ = Math.log2(q);

    return {
      rop: Math.floor(
        Math.pow(2, logN * 0.8 + logQ * 0.2 + Math.random() * 10)
      ), // 总复杂度
      red: Math.floor(Math.pow(2, logN * 0.7 + Math.random() * 8)), // 约化复杂度
      svP: Math.floor(Math.pow(2, logN * 0.9 + Math.random() * 12)), // 搜索复杂度
      mem: Math.floor(Math.pow(2, logN * 0.5 + Math.random() * 6)), // 总内存
      beta: Math.floor(n * 0.3 + Math.random() * 50), // BKZ块大小
      d: Math.floor(n * 1.2 + Math.random() * 100), // 格维度
      eta: Math.floor(n * 0.8 + Math.random() * 80), // 最终BDD的调用维度
      delta: (1.01 + Math.random() * 0.02).toFixed(6), // 格基约化的根Hermite因子
      zeta: Math.floor(n * 0.1 + Math.random() * 20), // 猜的个数
      S: Math.floor(Math.pow(2, logN * 0.6 + Math.random() * 8)), // 猜测搜索空间
      prob: (0.5 + Math.random() * 0.4).toFixed(4), // 成功概率
      U: Math.floor(10 + Math.random() * 90), // 重复攻击频率
    };
  }
}

/**
 * PBLSign算法安全性评估服务
 */
class PBLSignAnalysisService {
  static async evaluate(params) {
    const { n, q, norm } = params;

    // 参数验证
    if (!n || !q || !norm) {
      throw new Error("缺少必要参数：n, q, norm");
    }

    await delay(2500);

    const result = this.generateSignatureSecurityMetrics(n, q, norm);

    // 写入输入文件
    const inputContent = [
      `algorithm=PBLSign`,
      `n=${n}`,
      `q=${q}`,
      `norm=${norm}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const inputFile = getFilePath("analysis", "pblsign_input.txt");
    await writeFile(inputFile, inputContent);

    // 写入输出文件
    const outputContent = [
      `rop=${result.rop}`,
      `red=${result.red}`,
      `svP=${result.svP}`,
      `mem=${result.mem}`,
      `beta=${result.beta}`,
      `d=${result.d}`,
      `eta=${result.eta}`,
      `delta=${result.delta}`,
      `zeta=${result.zeta}`,
      `S=${result.S}`,
      `prob=${result.prob}`,
      `U=${result.U}`,
      `hl=${result.hl}`,
      `k=${result.k}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const outputFile = getFilePath("analysis", "pblsign_output.txt");
    await writeFile(outputFile, outputContent);

    return {
      inputFile,
      outputFile,
      results: result,
    };
  }

  static generateSignatureSecurityMetrics(n, q, norm) {
    const logN = Math.log2(n);
    const logQ = Math.log2(q);

    return {
      rop: Math.floor(
        Math.pow(2, logN * 0.85 + logQ * 0.25 + Math.random() * 12)
      ),
      red: Math.floor(Math.pow(2, logN * 0.75 + Math.random() * 10)),
      svP: Math.floor(Math.pow(2, logN * 0.95 + Math.random() * 15)),
      mem: Math.floor(Math.pow(2, logN * 0.55 + Math.random() * 8)),
      beta: Math.floor(n * 0.35 + Math.random() * 60),
      d: Math.floor(n * 1.3 + Math.random() * 120),
      eta: Math.floor(n * 0.9 + Math.random() * 100),
      delta: (1.008 + Math.random() * 0.015).toFixed(6),
      zeta: Math.floor(n * 0.12 + Math.random() * 25),
      S: Math.floor(Math.pow(2, logN * 0.65 + Math.random() * 10)),
      prob: (0.4 + Math.random() * 0.5).toFixed(4),
      U: Math.floor(5 + Math.random() * 45),
      hl: Math.floor(n * 0.2 + Math.random() * 30), // 非零分量个数
      k: Math.floor(n * 0.6 + Math.random() * 80), // 拆分维度
    };
  }
}

/**
 * 通用分析工具服务
 */
class AnalysisUtilsService {
  static async generateReport(algorithm, results) {
    const reportContent = {
      algorithm,
      timestamp: Date.now(),
      summary: {
        overallSecurity: this.calculateOverallSecurity(results),
        classicalStrength: this.calculateClassicalStrength(results),
        quantumResistance: this.calculateQuantumResistance(results),
      },
      detailedResults: results,
      recommendations: this.generateRecommendations(results),
    };

    const reportFile = getFilePath(
      "analysis",
      `${algorithm.toLowerCase()}_report.json`
    );
    await writeFile(reportFile, reportContent, "json");

    return {
      reportFile,
      report: reportContent,
    };
  }

  static calculateOverallSecurity(results) {
    // 基于复杂度计算整体安全等级
    const rop =
      typeof results.rop === "number" ? results.rop : parseInt(results.rop);
    if (rop > Math.pow(2, 128)) return "非常高";
    if (rop > Math.pow(2, 80)) return "高";
    if (rop > Math.pow(2, 64)) return "中等";
    return "低";
  }

  static calculateClassicalStrength(results) {
    const red =
      typeof results.red === "number" ? results.red : parseInt(results.red);
    if (red > Math.pow(2, 112)) return "128位等效";
    if (red > Math.pow(2, 80)) return "96位等效";
    if (red > Math.pow(2, 64)) return "80位等效";
    return "64位以下";
  }

  static calculateQuantumResistance(results) {
    const svP =
      typeof results.svP === "number" ? results.svP : parseInt(results.svP);
    if (svP > Math.pow(2, 256)) return "抗量子";
    if (svP > Math.pow(2, 128)) return "部分抗量子";
    return "易受量子攻击";
  }

  static generateRecommendations(results) {
    const recommendations = [];

    if (parseFloat(results.prob) < 0.7) {
      recommendations.push("建议增大参数以提高成功概率");
    }

    if (parseInt(results.beta) < 50) {
      recommendations.push("BKZ块大小较小，可能影响安全性评估准确度");
    }

    if (parseFloat(results.delta) > 1.015) {
      recommendations.push("格基约化因子偏大，建议优化算法参数");
    }

    return recommendations;
  }
}

module.exports = {
  PBLPKEAnalysisService,
  PBLSignAnalysisService,
  AnalysisUtilsService,
};
