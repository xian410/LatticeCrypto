// quantum.js - 量子算法页面相关业务逻辑
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

    // 构建输入内容 - 按需求格式每行一个值
    const inputContent = [
      paramCount.toString(),
      equationCount.toString(),
      errorRate.toString(),
      initialParams.toString(),
    ].join("\n");

    // 写入输入文件到 /lpn/input_gen.txt
    const inputFile = getFilePath("lpn", config.files.lpn.input);
    await writeFile(inputFile, inputContent);

    // 模拟LPN执行
    await delay(2000);

    // 生成结果 - 按需求格式写入 /lpn/output.txt
    const solution = generateLPNSolution(paramCount); // 生成01比特串
    const probability = (0.7 + Math.random() * 0.25).toFixed(4); // 相应概率（浮点数）
    const executionTime = (1.5 + Math.random() * 3).toFixed(2); // 运行时间（浮点数）

    const outputContent = [
      solution, // 第一行：所得的解（01比特串）
      probability, // 第二行：相应概率（浮点数）
      executionTime, // 第三行：运行时间（浮点数）
    ].join("\n");

    // 写入输出文件
    const outputFile = getFilePath("lpn", config.files.lpn.output);
    await writeFile(outputFile, outputContent);

    return {
      inputFile,
      outputFile,
      solution,
      probability,
      executionTime: executionTime + "s",
      solutionPreview: solution.substring(0, 100) + "...",
    };
  }

  static async solve() {
    // 读取LPN输出文件
    const outputFile = getFilePath("lpn", config.files.lpn.output);

    if (!(await fs.pathExists(outputFile))) {
      throw new Error("未找到LPN问题生成结果文件，请先执行生成操作");
    }

    await delay(3000);

    try {
      const content = await readFile(outputFile);
      const lines = content.trim().split("\n");

      if (lines.length < 3) {
        throw new Error("LPN结果文件格式错误");
      }

      const [solution, probability, executionTime] = lines;

      return {
        outputFile,
        solution,
        probability: parseFloat(probability),
        executionTime: parseFloat(executionTime) + "s",
        solutionPreview: solution,
      };
    } catch (error) {
      console.error("读取LPN结果文件失败:", error);
      // 如果读取失败，返回默认结果
      const solution = generateLPNSolution(100);
      const probability = (0.7 + Math.random() * 0.25).toFixed(4);
      const executionTime = (2.5 + Math.random() * 2).toFixed(2);

      return {
        outputFile,
        solution,
        probability: parseFloat(probability),
        executionTime: executionTime + "s",
        solutionPreview: solution,
      };
    }
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

    // 验证分组长度
    if (
      !config.algorithms.sm4.allowedBlockSizes.includes(parseInt(blockSize))
    ) {
      throw new Error("分组长度必须为8或16");
    }

    // 验证位数是否正确
    if (plaintext.length !== blockSize || key.length !== blockSize) {
      throw new Error(`明文和密钥长度必须都为${blockSize}位`);
    }

    // 验证是否为01比特串
    const bitPattern = /^[01]+$/;
    if (!bitPattern.test(plaintext) || !bitPattern.test(key)) {
      throw new Error("明文和密钥必须为01比特串");
    }

    // 写入输入文件 - 明文第一行，密钥第二行
    const inputContent = `${plaintext}\n${key}`;
    const inputFile = getFilePath("sm4", config.files.sm4.input(blockSize));
    await writeFile(inputFile, inputContent);

    await delay(1000);

    // 生成密文（简单异或加密）
    let ciphertext = "";
    for (let i = 0; i < blockSize; i++) {
      ciphertext += (parseInt(plaintext[i]) ^ parseInt(key[i])).toString();
    }

    // 写入输出文件 - 第一行明文，第二行密文
    const outputContent = `${plaintext}\n${ciphertext}`;
    const outputFile = getFilePath("sm4", config.files.sm4.output(blockSize));
    await writeFile(outputFile, outputContent);

    return {
      plaintext,
      ciphertext,
      blockSize,
      inputFile,
      outputFile,
    };
  }

  static async attack(params) {
    const { blockSize } = params;

    // 验证分组长度
    if (
      !config.algorithms.sm4.allowedBlockSizes.includes(parseInt(blockSize))
    ) {
      throw new Error("分组长度必须为8或16");
    }

    // 读取对应的输出文件
    const outputFile = getFilePath("sm4", config.files.sm4.output(blockSize));

    if (!(await fs.pathExists(outputFile))) {
      throw new Error(`未找到SM4加密结果文件，请先执行加密操作`);
    }

    try {
      const content = await readFile(outputFile);
      const lines = content.trim().split("\n");

      if (lines.length < 2) {
        throw new Error("SM4加密结果文件格式错误");
      }

      const [plaintext, ciphertext] = lines;

      await delay(4000);

      // 模拟攻击过程 - 使用异或恢复密钥
      let recoveredKey = "";
      for (let i = 0; i < blockSize; i++) {
        recoveredKey += (
          parseInt(plaintext[i]) ^ parseInt(ciphertext[i])
        ).toString();
      }

      const probability = (0.75 + Math.random() * 0.2).toFixed(4);
      const averageCalls = Math.floor(Math.random() * 1000 + 500);

      // 写入攻击结果到 /sm4/output.txt
      const attackResultContent = [
        recoveredKey, // 第一行：密钥（01比特串）
        probability, // 第二行：相应概率
        averageCalls.toString(), // 第三行：平均调用次数
      ].join("\n");

      const attackOutputFile = getFilePath("sm4", "output.txt");
      await writeFile(attackOutputFile, attackResultContent);

      return {
        success: true,
        plaintext,
        ciphertext,
        secretKey: recoveredKey,
        probability: parseFloat(probability),
        averageCalls,
        blockSize,
        outputFile: attackOutputFile,
      };
    } catch (error) {
      console.error("读取SM4结果文件失败:", error);
      throw new Error("读取SM4加密结果失败: " + error.message);
    }
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
