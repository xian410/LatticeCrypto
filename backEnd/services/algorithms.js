// 业务逻辑处理模块
const { config, getFilePath } = require("../config");
const {
  generateRandomBits,
  validateBitString,
  generateSimulatedResult,
  generateLPNSolution,
  generateSimulatedKey,
  delay,
  writeFile,
  readFile,
} = require("../utils/common");
const fs = require("fs-extra");

/**
 * LPN相关业务逻辑
 */
class LPNService {
  static async generate(params) {
    const { paramCount, equationCount, errorRate, initialParams } = params;

    // 构建输入内容
    const inputContent = [
      `paramCount=${paramCount}`,
      `equationCount=${equationCount}`,
      `errorRate=${errorRate}`,
      `initialParams=${initialParams}`,
      `timestamp=${Date.now()}`,
      `type=generate_lpn`,
    ].join("\n");

    // 写入输入文件
    const inputFile = getFilePath("lpn", config.files.lpn.input);
    await writeFile(inputFile, inputContent);

    // 模拟执行
    await delay(2000);

    // 生成结果
    const solution = generateLPNSolution(paramCount);
    const result = generateSimulatedResult("lpn");

    const outputContent = [
      `execution_time=${result.executionTime}`,
      `success_rate=${result.successRate}`,
      `solution_type=generated`,
      `variable_count=${paramCount}`,
      `equation_count=${equationCount}`,
      `error_rate=${errorRate}`,
      `solution_data=${solution}`,
      `timestamp=${result.timestamp}`,
    ].join("\n");

    // 写入输出文件
    const outputFile = getFilePath("lpn", config.files.lpn.output);
    await writeFile(outputFile, outputContent);

    return {
      inputFile,
      outputFile,
      executionTime: result.executionTime,
      successRate: result.successRate,
      solutionPreview: solution.substring(0, 200) + "...",
    };
  }

  static async solve() {
    await delay(3000);

    const solution = generateLPNSolution(100);
    const result = generateSimulatedResult("lpn");

    const outputContent = [
      `execution_time=${result.executionTime}`,
      `success_rate=${result.successRate}`,
      `solution_type=solved`,
      `variable_count=100`,
      `equation_count=150`,
      `error_rate=0.1`,
      `solution_data=${solution}`,
      `timestamp=${result.timestamp}`,
    ].join("\n");

    const outputFile = getFilePath("lpn", config.files.lpn.output);
    await writeFile(outputFile, outputContent);

    return {
      outputFile,
      executionTime: result.executionTime,
      successRate: result.successRate,
      solutionPreview: solution.substring(0, 200) + "...",
    };
  }
}

/**
 * SDES相关业务逻辑
 */
class SDESService {
  static async encrypt(params) {
    const { plaintext1, plaintext2, key } = params;

    // 参数验证
    const validation = this.validateParams(plaintext1, plaintext2, key);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 写入输入文件
    const inputContent = `${plaintext1}\n${plaintext2}\n${key}`;
    const inputFile = getFilePath("sdes", config.files.sdes.input);
    await writeFile(inputFile, inputContent);

    await delay(1500);

    // 生成密文（简单异或加密）
    const key8 = key.substring(0, 8);
    let ciphertext1 = "";
    let ciphertext2 = "";

    for (let i = 0; i < 8; i++) {
      ciphertext1 += (parseInt(plaintext1[i]) ^ parseInt(key8[i])).toString();
      ciphertext2 += (parseInt(plaintext2[i]) ^ parseInt(key8[i])).toString();
    }

    // 写入输出文件
    const outputContent = `${plaintext1}\n${plaintext2}\n${ciphertext1}\n${ciphertext2}`;
    const outputFile = getFilePath("sdes", config.files.sdes.output_1);
    await writeFile(outputFile, outputContent);

    return {
      plaintext1,
      plaintext2,
      ciphertext1,
      ciphertext2,
      inputFile,
      outputFile,
    };
  }

  static async attack() {
    const outputFile = getFilePath("sdes", config.files.sdes.output_1);

    if (!(await fs.pathExists(outputFile))) {
      throw new Error("未找到SDES加密结果文件");
    }

    const content = await readFile(outputFile);
    const lines = content.trim().split("\n");

    if (lines.length < 4) {
      throw new Error("SDES加密结果文件格式错误");
    }

    const [plaintext1, plaintext2, ciphertext1, ciphertext2] = lines;

    await delay(3500);

    // 模拟攻击
    const result = generateSimulatedResult("sdes");
    let recoveredKey, probability, averageCalls;

    if (result.success) {
      // 通过异或恢复密钥
      let key8 = "";
      for (let i = 0; i < 8; i++) {
        key8 += (parseInt(plaintext1[i]) ^ parseInt(ciphertext1[i])).toString();
      }
      recoveredKey = key8 + "00";
      probability = (0.8 + Math.random() * 0.15).toFixed(4);
      averageCalls = Math.floor(Math.random() * 800 + 400);
    } else {
      recoveredKey = Array(10).fill("0").join("");
      probability = "0.0000";
      averageCalls = Math.floor(Math.random() * 2000 + 1200);
    }

    // 写入攻击结果
    const attackResultContent = [
      recoveredKey,
      probability,
      averageCalls.toString(),
    ].join("\n");
    const attackOutputFile = getFilePath("sdes", config.files.sdes.output);
    await writeFile(attackOutputFile, attackResultContent);

    return {
      plaintext1,
      plaintext2,
      ciphertext1,
      ciphertext2,
      recoveredKey,
      probability,
      averageCalls,
      attackSuccess: result.success,
    };
  }

  static async comparison(experimentCount) {
    if (!experimentCount || experimentCount < 1) {
      throw new Error("实验次数必须为正整数");
    }

    // 写入输入文件
    const inputFile = getFilePath("sdes", config.files.sdes.input_2);
    await writeFile(inputFile, experimentCount.toString());

    await delay(2000 + experimentCount * 10);

    // 生成三个方案的结果
    const scheme1Prob = (0.7 + Math.random() * 0.2).toFixed(4);
    const scheme2Prob = (0.6 + Math.random() * 0.25).toFixed(4);
    const scheme3Prob = (0.75 + Math.random() * 0.15).toFixed(4);

    const outputContent = [scheme1Prob, scheme2Prob, scheme3Prob].join("\n");
    const outputFile = getFilePath("sdes", config.files.sdes.output_2);
    await writeFile(outputFile, outputContent);

    return {
      experimentCount,
      scheme1Probability: scheme1Prob,
      scheme2Probability: scheme2Prob,
      scheme3Probability: scheme3Prob,
      inputFile,
      outputFile,
    };
  }

  static validateParams(plaintext1, plaintext2, key) {
    const p1Validation = validateBitString(
      plaintext1,
      config.algorithms.sdes.plaintextLength
    );
    if (!p1Validation.valid)
      return { valid: false, error: `plaintext1: ${p1Validation.error}` };

    const p2Validation = validateBitString(
      plaintext2,
      config.algorithms.sdes.plaintextLength
    );
    if (!p2Validation.valid)
      return { valid: false, error: `plaintext2: ${p2Validation.error}` };

    const keyValidation = validateBitString(
      key,
      config.algorithms.sdes.keyLength
    );
    if (!keyValidation.valid)
      return { valid: false, error: `key: ${keyValidation.error}` };

    return { valid: true };
  }

  static generateRandom(type) {
    const length =
      type === "key"
        ? config.algorithms.sdes.keyLength
        : config.algorithms.sdes.plaintextLength;
    const name = type === "key" ? "密钥" : "明文";

    return {
      randomBits: generateRandomBits(length),
      type,
      length,
      name,
    };
  }
}

/**
 * SM4相关业务逻辑
 */
class SM4Service {
  static async encrypt(params) {
    const { plaintext, key, blockSize } = params;

    if (
      !config.algorithms.sm4.allowedBlockSizes.includes(parseInt(blockSize))
    ) {
      throw new Error("分组长度必须为8或16");
    }

    await delay(1000);

    // 生成密文
    const ciphertext = `[SM4加密-分组${blockSize}] ${Buffer.from(
      plaintext + "|" + key + "|" + blockSize
    )
      .toString("base64")
      .replace(/=/g, "")}`;

    // 写入文件
    const inputData = { plaintext, key, blockSize, timestamp: Date.now() };
    const outputData = {
      ciphertext,
      algorithm: "SM4",
      blockSize,
      timestamp: Date.now(),
    };

    const inputFile = getFilePath("sm4", config.files.sm4.input(blockSize));
    const outputFile = getFilePath("sm4", config.files.sm4.output(blockSize));

    await writeFile(inputFile, inputData, "json");
    await writeFile(outputFile, outputData, "json");

    return {
      ciphertext,
      blockSize,
      inputFile,
      outputFile,
    };
  }

  static async attack(params) {
    const { plaintext, ciphertext, blockSize } = params;

    await delay(4000);

    const result = generateSimulatedResult("sm4");
    let attackResult;

    if (result.success) {
      attackResult = {
        success: true,
        secretKey: generateSimulatedKey(Math.floor(Math.random() * 200 + 100)),
        executionTime: result.executionTime,
        successRate: result.successRate,
        averageCalls: Math.floor(Math.random() * 1000 + 500) + "次",
        recoveredPlaintext: plaintext,
        blockSize,
      };
    } else {
      attackResult = {
        success: false,
        executionTime: result.executionTime,
        successRate: "0%",
        averageCalls: Math.floor(Math.random() * 2000 + 1000) + "次",
        error: config.messages.error.attackFailed,
        blockSize,
      };
    }

    const outputFile = getFilePath(
      "sm4",
      config.files.sm4.attack_result(blockSize)
    );
    await writeFile(outputFile, attackResult, "json");

    return attackResult;
  }

  static generateRandom(blockSize) {
    if (
      !config.algorithms.sm4.allowedBlockSizes.includes(parseInt(blockSize))
    ) {
      throw new Error("分组长度必须为8或16");
    }

    return {
      randomBits: generateRandomBits(blockSize),
      blockSize,
    };
  }
}

module.exports = {
  LPNService,
  SDESService,
  SM4Service,
};
