// 公共工具函数
const fs = require("fs-extra");
const path = require("path");

/**
 * 生成指定长度的随机01比特串
 */
function generateRandomBits(length) {
  return Array.from({ length }, () => (Math.random() < 0.5 ? "0" : "1")).join(
    ""
  );
}

/**
 * 验证01比特串
 */
function validateBitString(str, expectedLength = null) {
  const bitPattern = /^[01]+$/;
  if (!bitPattern.test(str)) {
    return { valid: false, error: "必须为01比特串" };
  }
  if (expectedLength && str.length !== expectedLength) {
    return { valid: false, error: `长度必须为${expectedLength}比特` };
  }
  return { valid: true };
}

/**
 * 生成模拟执行结果
 */
function generateSimulatedResult(type, params = {}) {
  const baseTime = { lpn: 3000, des: 1500, sm4: 1000, sdes: 1500 };
  const successRate = 0.8 + Math.random() * 0.15;

  return {
    executionTime:
      ((baseTime[type] || 2000) / 1000 + Math.random() * 0.5).toFixed(2) + "s",
    successRate: (successRate * 100).toFixed(1) + "%",
    success: Math.random() > 0.2,
    timestamp: Date.now(),
    ...params,
  };
}

/**
 * 生成模拟的LPN解
 */
function generateLPNSolution(paramCount = 100) {
  const variableCount = parseInt(paramCount);
  const solutionLines = ["求解结果："];

  for (let i = 1; i <= Math.min(variableCount, 100); i++) {
    const digits = 15 + Math.floor(Math.random() * 25);
    let number = "";
    for (let j = 0; j < digits; j++) {
      number += Math.floor(Math.random() * 10);
    }
    solutionLines.push(`x${i} = ${number}`);
  }

  if (variableCount > 100) {
    solutionLines.push("...");
    for (let i = variableCount - 2; i <= variableCount; i++) {
      const digits = 15 + Math.random() * 25;
      let number = "";
      for (let j = 0; j < digits; j++) {
        number += Math.floor(Math.random() * 10);
      }
      solutionLines.push(`x${i} = ${number}`);
    }
  }

  return solutionLines.join("\\n");
}

/**
 * 生成模拟密钥
 */
function generateSimulatedKey(length = 128) {
  let key = "0x";
  for (let i = 0; i < length; i++) {
    key += Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
  }
  return key;
}

/**
 * 异步延迟函数
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 确保目录存在
 */
async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
}

/**
 * 写入文件
 */
async function writeFile(filePath, content, format = "string") {
  const data = format === "json" ? JSON.stringify(content, null, 2) : content;
  await fs.writeFile(filePath, data, "utf8");
  return filePath;
}

/**
 * 读取文件
 */
async function readFile(filePath, format = "string") {
  const content = await fs.readFile(filePath, "utf8");
  return format === "json" ? JSON.parse(content) : content;
}

module.exports = {
  generateRandomBits,
  validateBitString,
  generateSimulatedResult,
  generateLPNSolution,
  generateSimulatedKey,
  delay,
  ensureDir,
  writeFile,
  readFile,
};
