// signature.js - 数字签名页面相关业务逻辑
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
 * 基于格的数字签名服务
 */
class LatticeSignatureService {
  static async generateSigningKeys(params) {
    const {
      dimension,
      modulus,
      gaussianParameter,
      securityLevel = 128,
    } = params;

    // 参数验证
    if (!dimension || !modulus || !gaussianParameter) {
      throw new Error("缺少必要参数：dimension, modulus, gaussianParameter");
    }

    if (dimension < 256 || dimension > 4096) {
      throw new Error("维度范围应在256-4096之间");
    }

    if (modulus < 2) {
      throw new Error("模数必须大于1");
    }

    if (gaussianParameter <= 0) {
      throw new Error("高斯参数必须为正数");
    }

    await delay(3000);

    // 生成签名密钥对
    const keyPair = this.generateLatticeSigningKeyPair(
      dimension,
      modulus,
      gaussianParameter
    );

    // 写入参数文件
    const paramsContent = [
      `algorithm=LatticeSignature`,
      `dimension=${dimension}`,
      `modulus=${modulus}`,
      `gaussianParameter=${gaussianParameter}`,
      `securityLevel=${securityLevel}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const paramsFile = getFilePath("signature", "signing_params.txt");
    await writeFile(paramsFile, paramsContent);

    // 写入公钥
    const publicKeyContent = [
      `algorithm=LatticeSignature`,
      `keyType=public`,
      `dimension=${dimension}`,
      `modulus=${modulus}`,
      `publicMatrix=${keyPair.publicKey.publicMatrix}`,
      `verificationKey=${keyPair.publicKey.verificationKey}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const publicKeyFile = getFilePath("signature", "signing_public_key.txt");
    await writeFile(publicKeyFile, publicKeyContent);

    // 写入私钥
    const privateKeyContent = [
      `algorithm=LatticeSignature`,
      `keyType=private`,
      `dimension=${dimension}`,
      `shortBasis=${keyPair.privateKey.shortBasis}`,
      `trapdoor=${keyPair.privateKey.trapdoor}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const privateKeyFile = getFilePath("signature", "signing_private_key.txt");
    await writeFile(privateKeyFile, privateKeyContent);

    return {
      paramsFile,
      publicKeyFile,
      privateKeyFile,
      keyPair: {
        publicKey: {
          publicMatrix:
            keyPair.publicKey.publicMatrix.substring(0, 100) + "...",
          verificationKey:
            keyPair.publicKey.verificationKey.substring(0, 50) + "...",
        },
        privateKey: {
          shortBasis: keyPair.privateKey.shortBasis.substring(0, 100) + "...",
        },
      },
      securityMetrics: keyPair.securityMetrics,
    };
  }

  static generateLatticeSigningKeyPair(dimension, modulus, gaussianParameter) {
    // 生成陷门矩阵
    const publicMatrix = this.generateTrapdoorMatrix(dimension, modulus);
    const shortBasis = this.generateShortBasis(dimension, gaussianParameter);
    const trapdoor = this.generateTrapdoor(dimension);
    const verificationKey = this.deriveVerificationKey(
      publicMatrix,
      shortBasis,
      modulus
    );

    const securityMetrics = {
      signatureSize: Math.floor((dimension * Math.log2(modulus)) / 8), // 签名大小（字节）
      verificationTime:
        (dimension * 0.001 + Math.random() * 0.01).toFixed(3) + "ms",
      signingTime: (dimension * 0.005 + Math.random() * 0.02).toFixed(3) + "ms",
      securityLevel: this.estimateSignatureSecurityLevel(
        dimension,
        modulus,
        gaussianParameter
      ),
      forgerySecurity: Math.floor(dimension * Math.log2(modulus) * 0.5), // 抗伪造安全性
      collisionResistance: Math.floor(dimension * Math.log2(modulus) * 0.3), // 抗碰撞安全性
    };

    return {
      publicKey: {
        publicMatrix,
        verificationKey,
      },
      privateKey: {
        shortBasis,
        trapdoor,
      },
      securityMetrics,
    };
  }

  static generateTrapdoorMatrix(dimension, modulus) {
    // 生成带陷门的公开矩阵
    let matrix = "";
    for (let i = 0; i < dimension; i++) {
      const row = [];
      for (let j = 0; j < dimension; j++) {
        if (i === j) {
          // 对角线元素
          row.push(
            Math.floor(Math.random() * (modulus / 2)) + Math.floor(modulus / 4)
          );
        } else {
          // 非对角线元素
          row.push(Math.floor(Math.random() * modulus));
        }
      }
      matrix += row.join(",") + ";";
    }
    return matrix;
  }

  static generateShortBasis(dimension, gaussianParameter) {
    // 生成短格基
    let basis = "";
    for (let i = 0; i < dimension; i++) {
      const row = [];
      for (let j = 0; j < dimension; j++) {
        const value = Math.floor(this.gaussianRandom() * gaussianParameter);
        row.push(value);
      }
      basis += row.join(",") + ";";
    }
    return basis;
  }

  static generateTrapdoor(dimension) {
    // 生成陷门信息
    const trapdoor = [];
    for (let i = 0; i < dimension; i++) {
      trapdoor.push(Math.floor(Math.random() * 1000));
    }
    return trapdoor.join(",");
  }

  static deriveVerificationKey(publicMatrix, shortBasis, modulus) {
    // 派生验证密钥
    const key = [];
    for (let i = 0; i < 32; i++) {
      // 固定长度的验证密钥
      key.push(Math.floor(Math.random() * modulus));
    }
    return key.join(",");
  }

  static gaussianRandom() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  static estimateSignatureSecurityLevel(dimension, modulus, gaussianParameter) {
    const logN = Math.log2(dimension);
    const logQ = Math.log2(modulus);
    const securityBits = Math.floor(logN * logQ * 0.2);

    if (securityBits >= 256) return "非常高 (256位+)";
    if (securityBits >= 128) return "高 (128-256位)";
    if (securityBits >= 80) return "中等 (80-128位)";
    return "低 (<80位)";
  }
}

/**
 * 消息签名服务
 */
class MessageSigningService {
  static async signMessage(params) {
    const { message, privateKeyFile, hashAlgorithm = "SHA-256" } = params;

    // 参数验证
    if (!message || !privateKeyFile) {
      throw new Error("缺少必要参数：message, privateKeyFile");
    }

    // 检查私钥文件是否存在
    if (!(await fs.pathExists(privateKeyFile))) {
      throw new Error("私钥文件不存在");
    }

    const privateKeyContent = await readFile(privateKeyFile);

    await delay(1500);

    // 执行签名
    const signature = this.performSigning(
      message,
      privateKeyContent,
      hashAlgorithm
    );

    // 写入签名文件
    const signatureContent = [
      `algorithm=LatticeSignature`,
      `message=${message}`,
      `hashAlgorithm=${hashAlgorithm}`,
      `messageHash=${signature.messageHash}`,
      `signature=${signature.signatureValue}`,
      `signatureLength=${signature.signatureLength}`,
      `signingTime=${signature.signingTime}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const signatureFile = getFilePath("signature", "message_signature.txt");
    await writeFile(signatureFile, signatureContent);

    return {
      signatureFile,
      signature: {
        messageHash: signature.messageHash,
        signatureValue: signature.signatureValue.substring(0, 100) + "...",
        signatureLength: signature.signatureLength,
        signingTime: signature.signingTime,
      },
    };
  }

  static performSigning(message, privateKeyContent, hashAlgorithm) {
    // 计算消息哈希
    const messageHash = this.computeHash(message, hashAlgorithm);

    // 解析私钥
    const dimension = this.extractDimensionFromKey(privateKeyContent);

    // 生成格签名
    const signatureValue = this.generateLatticeSignature(
      messageHash,
      dimension
    );

    return {
      messageHash,
      signatureValue,
      signatureLength: signatureValue.length,
      signingTime: (Math.random() * 10 + 5).toFixed(2) + "ms",
    };
  }

  static computeHash(message, algorithm) {
    // 简化的哈希计算（实际应使用真实的哈希函数）
    let hash = "";
    for (let i = 0; i < 64; i++) {
      // SHA-256产生64个十六进制字符
      const charCode = message.charCodeAt(i % message.length) || 0;
      hash += ((charCode * (i + 1)) % 16).toString(16);
    }
    return hash;
  }

  static extractDimensionFromKey(privateKeyContent) {
    const lines = privateKeyContent.split("\n");
    const dimensionLine = lines.find((line) => line.includes("dimension="));
    return dimensionLine ? parseInt(dimensionLine.split("=")[1]) : 512;
  }

  static generateLatticeSignature(messageHash, dimension) {
    // 生成格签名
    const signature = [];
    for (let i = 0; i < dimension; i++) {
      // 基于消息哈希和维度生成签名值
      const hashValue = parseInt(
        messageHash.charAt(i % messageHash.length),
        16
      );
      const signatureValue =
        (hashValue * i + Math.floor(Math.random() * 100)) % 1000;
      signature.push(signatureValue);
    }
    return signature.join(",");
  }
}

/**
 * 签名验证服务
 */
class SignatureVerificationService {
  static async verifySignature(params) {
    const { signatureFile, publicKeyFile, expectedMessage } = params;

    // 参数验证
    if (!signatureFile || !publicKeyFile) {
      throw new Error("缺少必要参数：signatureFile, publicKeyFile");
    }

    // 检查文件是否存在
    if (
      !(await fs.pathExists(signatureFile)) ||
      !(await fs.pathExists(publicKeyFile))
    ) {
      throw new Error("签名文件或公钥文件不存在");
    }

    const signatureContent = await readFile(signatureFile);
    const publicKeyContent = await readFile(publicKeyFile);

    await delay(1000);

    // 执行验证
    const verification = this.performVerification(
      signatureContent,
      publicKeyContent,
      expectedMessage
    );

    // 写入验证结果
    const verificationResult = {
      isValid: verification.isValid,
      message: verification.message,
      verificationTime: verification.verificationTime,
      signatureFormat: verification.signatureFormat,
      hashMatch: verification.hashMatch,
      signatureMatch: verification.signatureMatch,
      trustLevel: verification.trustLevel,
      timestamp: Date.now(),
    };

    const verificationFile = getFilePath(
      "signature",
      "verification_result.json"
    );
    await writeFile(verificationFile, verificationResult, "json");

    return {
      verificationFile,
      results: verificationResult,
    };
  }

  static performVerification(
    signatureContent,
    publicKeyContent,
    expectedMessage
  ) {
    const signatureLines = signatureContent.split("\n");
    const publicKeyLines = publicKeyContent.split("\n");

    // 提取签名信息
    const message = this.extractValue(signatureLines, "message");
    const messageHash = this.extractValue(signatureLines, "messageHash");
    const signatureValue = this.extractValue(signatureLines, "signature");
    const hashAlgorithm =
      this.extractValue(signatureLines, "hashAlgorithm") || "SHA-256";

    // 提取公钥信息
    const dimension = this.extractValue(publicKeyLines, "dimension");
    const publicMatrix = this.extractValue(publicKeyLines, "publicMatrix");

    // 执行验证步骤
    const hashMatch = expectedMessage
      ? this.verifyMessageHash(expectedMessage, messageHash, hashAlgorithm)
      : true;

    const signatureFormat = this.verifySignatureFormat(
      signatureValue,
      dimension
    );
    const signatureMatch = this.verifySignatureValue(
      messageHash,
      signatureValue,
      publicMatrix
    );

    const isValid = hashMatch && signatureFormat && signatureMatch;

    return {
      isValid,
      message: message,
      verificationTime: (Math.random() * 5 + 2).toFixed(2) + "ms",
      signatureFormat,
      hashMatch,
      signatureMatch,
      trustLevel: this.calculateTrustLevel(
        isValid,
        hashMatch,
        signatureFormat,
        signatureMatch
      ),
    };
  }

  static extractValue(lines, key) {
    const line = lines.find((l) => l.includes(`${key}=`));
    return line ? line.split("=")[1] : null;
  }

  static verifyMessageHash(message, expectedHash, algorithm) {
    const computedHash =
      MessageSigningService.prototype.constructor.computeHash(
        message,
        algorithm
      );
    return computedHash === expectedHash;
  }

  static verifySignatureFormat(signature, dimension) {
    if (!signature) return false;
    const parts = signature.split(",");
    return parts.length === parseInt(dimension);
  }

  static verifySignatureValue(messageHash, signature, publicMatrix) {
    // 简化的签名验证（实际应使用真实的格验证算法）
    if (!messageHash || !signature || !publicMatrix) return false;

    // 模拟验证过程
    const verificationSuccess = Math.random() > 0.1; // 90%成功率
    return verificationSuccess;
  }

  static calculateTrustLevel(
    isValid,
    hashMatch,
    signatureFormat,
    signatureMatch
  ) {
    if (isValid && hashMatch && signatureFormat && signatureMatch) {
      return "高";
    } else if (signatureFormat && (hashMatch || signatureMatch)) {
      return "中";
    } else {
      return "低";
    }
  }
}

/**
 * 批量签名服务
 */
class BatchSigningService {
  static async signMultipleMessages(params) {
    const { messages, privateKeyFile, hashAlgorithm = "SHA-256" } = params;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("缺少消息列表或消息列表为空");
    }

    if (!privateKeyFile) {
      throw new Error("缺少私钥文件");
    }

    if (!(await fs.pathExists(privateKeyFile))) {
      throw new Error("私钥文件不存在");
    }

    const privateKeyContent = await readFile(privateKeyFile);

    await delay(messages.length * 500);

    // 批量签名
    const signatures = [];
    for (let i = 0; i < messages.length; i++) {
      const signature =
        MessageSigningService.prototype.constructor.performSigning(
          messages[i],
          privateKeyContent,
          hashAlgorithm
        );
      signatures.push({
        messageIndex: i,
        message: messages[i],
        signature: signature,
      });
    }

    // 写入批量签名结果
    const batchResult = {
      totalMessages: messages.length,
      hashAlgorithm,
      signatures: signatures,
      batchProcessingTime:
        (messages.length * Math.random() * 20 + 10).toFixed(2) + "ms",
      timestamp: Date.now(),
    };

    const batchFile = getFilePath("signature", "batch_signatures.json");
    await writeFile(batchFile, batchResult, "json");

    return {
      batchFile,
      results: {
        totalMessages: batchResult.totalMessages,
        batchProcessingTime: batchResult.batchProcessingTime,
        signatures: signatures.map((sig) => ({
          messageIndex: sig.messageIndex,
          message:
            sig.message.substring(0, 50) +
            (sig.message.length > 50 ? "..." : ""),
          signatureLength: sig.signature.signatureLength,
          signingTime: sig.signature.signingTime,
        })),
      },
    };
  }

  static async verifyBatchSignatures(params) {
    const { batchFile, publicKeyFile } = params;

    if (!batchFile || !publicKeyFile) {
      throw new Error("缺少批量签名文件或公钥文件");
    }

    if (
      !(await fs.pathExists(batchFile)) ||
      !(await fs.pathExists(publicKeyFile))
    ) {
      throw new Error("批量签名文件或公钥文件不存在");
    }

    const batchContent = await readFile(batchFile);
    const batchData = JSON.parse(batchContent);
    const publicKeyContent = await readFile(publicKeyFile);

    await delay(batchData.signatures.length * 200);

    // 批量验证
    const verificationResults = [];
    let validCount = 0;

    for (const sigData of batchData.signatures) {
      // 模拟验证过程
      const isValid = Math.random() > 0.05; // 95%成功率
      if (isValid) validCount++;

      verificationResults.push({
        messageIndex: sigData.messageIndex,
        message: sigData.message,
        isValid: isValid,
        verificationTime: (Math.random() * 3 + 1).toFixed(2) + "ms",
      });
    }

    const verificationSummary = {
      totalSignatures: batchData.signatures.length,
      validSignatures: validCount,
      invalidSignatures: batchData.signatures.length - validCount,
      successRate:
        ((validCount / batchData.signatures.length) * 100).toFixed(2) + "%",
      batchVerificationTime:
        (batchData.signatures.length * Math.random() * 10 + 5).toFixed(2) +
        "ms",
      results: verificationResults,
      timestamp: Date.now(),
    };

    const verificationFile = getFilePath(
      "signature",
      "batch_verification.json"
    );
    await writeFile(verificationFile, verificationSummary, "json");

    return {
      verificationFile,
      results: verificationSummary,
    };
  }
}

module.exports = {
  LatticeSignatureService,
  MessageSigningService,
  SignatureVerificationService,
  BatchSigningService,
};
