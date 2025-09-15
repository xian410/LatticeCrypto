// keyGen.js - 密钥生成页面相关业务逻辑
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
 * LWE密钥生成服务
 */
class LWEKeyGenService {
  static async generateKeys(params) {
    const {
      dimension,
      modulus,
      errorDistribution,
      keyLength,
      securityLevel = 128,
    } = params;

    // 参数验证
    if (!dimension || !modulus || !errorDistribution || !keyLength) {
      throw new Error(
        "缺少必要参数：dimension, modulus, errorDistribution, keyLength"
      );
    }

    if (dimension < 256 || dimension > 8192) {
      throw new Error("维度范围应在256-8192之间");
    }

    if (modulus < 2) {
      throw new Error("模数必须大于1");
    }

    if (keyLength < 128 || keyLength > 4096) {
      throw new Error("密钥长度范围应在128-4096之间");
    }

    await delay(3000);

    // 生成密钥对
    const keyPair = this.generateLWEKeyPair(
      dimension,
      modulus,
      errorDistribution,
      keyLength
    );

    // 写入输入参数
    const inputContent = [
      `algorithm=LWE_KeyGen`,
      `dimension=${dimension}`,
      `modulus=${modulus}`,
      `errorDistribution=${errorDistribution}`,
      `keyLength=${keyLength}`,
      `securityLevel=${securityLevel}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const inputFile = getFilePath("keygen", "lwe_params.txt");
    await writeFile(inputFile, inputContent);

    // 写入公钥
    const publicKeyContent = [
      `algorithm=LWE`,
      `keyType=public`,
      `dimension=${dimension}`,
      `modulus=${modulus}`,
      `matrixA=${keyPair.publicKey.matrixA}`,
      `vectorB=${keyPair.publicKey.vectorB}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const publicKeyFile = getFilePath("keygen", "lwe_public_key.txt");
    await writeFile(publicKeyFile, publicKeyContent);

    // 写入私钥
    const privateKeyContent = [
      `algorithm=LWE`,
      `keyType=private`,
      `dimension=${dimension}`,
      `secretVector=${keyPair.privateKey.secretVector}`,
      `errorVector=${keyPair.privateKey.errorVector}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const privateKeyFile = getFilePath("keygen", "lwe_private_key.txt");
    await writeFile(privateKeyFile, privateKeyContent);

    return {
      inputFile,
      publicKeyFile,
      privateKeyFile,
      keyPair: {
        publicKey: {
          matrixA: keyPair.publicKey.matrixA.substring(0, 100) + "...",
          vectorB: keyPair.publicKey.vectorB.substring(0, 100) + "...",
        },
        privateKey: {
          secretVector:
            keyPair.privateKey.secretVector.substring(0, 100) + "...",
        },
      },
      securityMetrics: keyPair.securityMetrics,
    };
  }

  static generateLWEKeyPair(dimension, modulus, errorDistribution, keyLength) {
    // 生成随机矩阵A
    const matrixA = this.generateRandomMatrix(dimension, dimension, modulus);

    // 生成秘密向量s
    const secretVector = this.generateRandomVector(dimension, modulus);

    // 生成误差向量e
    const errorVector = this.generateErrorVector(dimension, errorDistribution);

    // 计算公钥向量b = A*s + e (mod q)
    const vectorB = this.computePublicVector(
      matrixA,
      secretVector,
      errorVector,
      modulus,
      dimension
    );

    // 计算安全性指标
    const securityMetrics = this.calculateKeySecurityMetrics(
      dimension,
      modulus,
      errorDistribution
    );

    return {
      publicKey: {
        matrixA: matrixA,
        vectorB: vectorB,
      },
      privateKey: {
        secretVector: secretVector,
        errorVector: errorVector,
      },
      securityMetrics,
    };
  }

  static generateRandomMatrix(rows, cols, modulus) {
    let matrix = "";
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(Math.floor(Math.random() * modulus));
      }
      matrix += row.join(",") + ";";
    }
    return matrix;
  }

  static generateRandomVector(dimension, modulus) {
    const vector = [];
    for (let i = 0; i < dimension; i++) {
      vector.push(Math.floor(Math.random() * modulus));
    }
    return vector.join(",");
  }

  static generateErrorVector(dimension, distribution) {
    const errors = [];
    for (let i = 0; i < dimension; i++) {
      // 根据分布类型生成误差
      let error;
      switch (distribution) {
        case "gaussian":
          error = Math.floor(this.gaussianRandom() * 10) % 16;
          break;
        case "uniform":
          error = Math.floor(Math.random() * 8);
          break;
        case "binary":
          error = Math.random() < 0.5 ? 0 : 1;
          break;
        default:
          error = Math.floor(Math.random() * 4);
      }
      errors.push(error);
    }
    return errors.join(",");
  }

  static gaussianRandom() {
    // Box-Muller变换生成高斯随机数
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  static computePublicVector(
    matrixA,
    secretVector,
    errorVector,
    modulus,
    dimension
  ) {
    // 简化的矩阵乘法模拟
    const result = [];
    const secret = secretVector.split(",").map((x) => parseInt(x));
    const errors = errorVector.split(",").map((x) => parseInt(x));

    for (let i = 0; i < dimension; i++) {
      let sum = 0;
      for (let j = 0; j < dimension; j++) {
        sum += (Math.floor(Math.random() * modulus) * secret[j]) % modulus;
      }
      result.push((sum + errors[i]) % modulus);
    }

    return result.join(",");
  }

  static calculateKeySecurityMetrics(dimension, modulus, errorDistribution) {
    const logQ = Math.log2(modulus);
    const logN = Math.log2(dimension);

    return {
      classicalSecurity: Math.floor(dimension * logQ * 0.3), // 经典安全性（比特）
      quantumSecurity: Math.floor(dimension * logQ * 0.15), // 量子安全性（比特）
      keySize: Math.floor((dimension * logQ) / 8), // 密钥大小（字节）
      encryptionEfficiency: (100 - Math.floor(logN * 2)).toFixed(1) + "%", // 加密效率
      decryptionEfficiency: (100 - Math.floor(logN * 1.5)).toFixed(1) + "%", // 解密效率
      errorRate: this.getErrorRateByDistribution(errorDistribution),
      recommendedUse: this.getRecommendedUse(dimension, modulus),
    };
  }

  static getErrorRateByDistribution(distribution) {
    const rates = {
      gaussian: "0.001-0.01",
      uniform: "0.01-0.1",
      binary: "0.1-0.2",
    };
    return rates[distribution] || "0.01-0.05";
  }

  static getRecommendedUse(dimension, modulus) {
    if (dimension >= 1024 && modulus >= 65536) {
      return "适用于高安全性应用";
    } else if (dimension >= 512 && modulus >= 4096) {
      return "适用于一般安全应用";
    } else {
      return "仅适用于测试和学习";
    }
  }
}

/**
 * 密钥验证服务
 */
class KeyValidationService {
  static async validateKeyPair(publicKeyFile, privateKeyFile) {
    // 读取密钥文件
    const publicKeyExists = await fs.pathExists(publicKeyFile);
    const privateKeyExists = await fs.pathExists(privateKeyFile);

    if (!publicKeyExists || !privateKeyExists) {
      throw new Error("密钥文件不存在");
    }

    const publicKeyContent = await readFile(publicKeyFile);
    const privateKeyContent = await readFile(privateKeyFile);

    await delay(1000);

    // 模拟密钥验证
    const validation = this.performKeyValidation(
      publicKeyContent,
      privateKeyContent
    );

    // 写入验证结果
    const validationResult = {
      isValid: validation.isValid,
      publicKeyValid: validation.publicKeyValid,
      privateKeyValid: validation.privateKeyValid,
      consistencyCheck: validation.consistencyCheck,
      securityLevel: validation.securityLevel,
      recommendations: validation.recommendations,
      timestamp: Date.now(),
    };

    const validationFile = getFilePath("keygen", "key_validation.json");
    await writeFile(validationFile, validationResult, "json");

    return {
      validationFile,
      results: validationResult,
    };
  }

  static performKeyValidation(publicKeyContent, privateKeyContent) {
    // 解析密钥内容
    const publicKeyLines = publicKeyContent.split("\n");
    const privateKeyLines = privateKeyContent.split("\n");

    const publicKeyValid =
      publicKeyLines.length >= 5 &&
      publicKeyLines.some((line) => line.includes("matrixA")) &&
      publicKeyLines.some((line) => line.includes("vectorB"));

    const privateKeyValid =
      privateKeyLines.length >= 4 &&
      privateKeyLines.some((line) => line.includes("secretVector")) &&
      privateKeyLines.some((line) => line.includes("errorVector"));

    const consistencyCheck =
      publicKeyValid &&
      privateKeyValid &&
      this.checkDimensionConsistency(publicKeyLines, privateKeyLines);

    const securityLevel = this.estimateSecurityLevel(publicKeyLines);

    return {
      isValid: publicKeyValid && privateKeyValid && consistencyCheck,
      publicKeyValid,
      privateKeyValid,
      consistencyCheck,
      securityLevel,
      recommendations: this.generateValidationRecommendations(
        securityLevel,
        consistencyCheck
      ),
    };
  }

  static checkDimensionConsistency(publicKeyLines, privateKeyLines) {
    // 简化的一致性检查
    const publicDimension = this.extractDimension(publicKeyLines);
    const privateDimension = this.extractDimension(privateKeyLines);
    return publicDimension === privateDimension;
  }

  static extractDimension(lines) {
    const dimensionLine = lines.find((line) => line.includes("dimension="));
    return dimensionLine ? parseInt(dimensionLine.split("=")[1]) : 0;
  }

  static estimateSecurityLevel(publicKeyLines) {
    const dimension = this.extractDimension(publicKeyLines);
    if (dimension >= 1024) return "高";
    if (dimension >= 512) return "中";
    return "低";
  }

  static generateValidationRecommendations(securityLevel, consistencyCheck) {
    const recommendations = [];

    if (securityLevel === "低") {
      recommendations.push("建议使用更大的维度参数以提高安全性");
    }

    if (!consistencyCheck) {
      recommendations.push("检测到密钥一致性问题，建议重新生成密钥对");
    }

    recommendations.push("定期更新密钥以维护安全性");

    return recommendations;
  }
}

module.exports = {
  LWEKeyGenService,
  KeyValidationService,
};
