// 路由模块
const express = require("express");
const { LPNService, SDESService, SM4Service } = require("../services/quantum");
const {
  PBLPKEAnalysisService,
  PBLSignAnalysisService,
  AnalysisUtilsService,
} = require("../services/analysis");
const {
  LWEKeyGenService,
  KeyValidationService,
} = require("../services/keyGen");
const {
  LLLAlgorithmService,
  BKZAlgorithmService,
  LatticeQualityService,
  MatrixGeneratorService,
} = require("../services/shortBasis");
const {
  LatticeSignatureService,
  MessageSigningService,
  SignatureVerificationService,
  BatchSigningService,
} = require("../services/signature");
const { config, getFilePath } = require("../config");
const { readFile } = require("../utils/common");
const fs = require("fs-extra");

const router = express.Router();

/**
 * 统一的响应处理函数
 */
function handleResponse(res, operation, data, successMessage) {
  res.json({
    success: true,
    message: successMessage,
    data,
  });
}

/**
 * 统一的错误处理函数
 */
function handleError(res, error, operation) {
  console.error(`${operation}失败:`, error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message,
  });
}

/**
 * 参数验证中间件
 */
function validateParams(requiredParams) {
  return (req, res, next) => {
    const missing = requiredParams.filter((param) => !req.body[param]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `${config.messages.error.missingParams}: ${missing.join(", ")}`,
      });
    }
    next();
  };
}

// LPN相关路由
router.post(
  "/lpn/generate",
  validateParams(["paramCount", "equationCount", "errorRate", "initialParams"]),
  async (req, res) => {
    try {
      const data = await LPNService.generate(req.body);
      handleResponse(res, "LPN生成", data, config.messages.success.lpnGenerate);
    } catch (error) {
      handleError(res, error, "LPN生成");
    }
  }
);

router.post("/lpn/solve", async (req, res) => {
  try {
    const data = await LPNService.solve();
    handleResponse(res, "LPN求解", data, config.messages.success.lpnSolve);
  } catch (error) {
    handleError(res, error, "LPN求解");
  }
});

// SDES相关路由
router.post(
  "/sdes/encrypt",
  validateParams(["plaintext1", "plaintext2", "key"]),
  async (req, res) => {
    try {
      const data = await SDESService.encrypt(req.body);
      handleResponse(
        res,
        "SDES加密",
        data,
        config.messages.success.sdesEncrypt
      );
    } catch (error) {
      handleError(res, error, "SDES加密");
    }
  }
);

router.post("/sdes/attack", async (req, res) => {
  try {
    const data = await SDESService.attack();
    handleResponse(
      res,
      "SDES攻击",
      data,
      data.attackSuccess ? config.messages.success.sdesAttack : "SDES攻击失败"
    );
  } catch (error) {
    handleError(res, error, "SDES攻击");
  }
});

router.post(
  "/sdes/comparison",
  validateParams(["experimentCount"]),
  async (req, res) => {
    try {
      const data = await SDESService.comparison(req.body.experimentCount);
      handleResponse(
        res,
        "SDES方案对比",
        data,
        config.messages.success.sdesComparison
      );
    } catch (error) {
      handleError(res, error, "SDES方案对比");
    }
  }
);

router.post("/sdes/generate", validateParams(["type"]), async (req, res) => {
  try {
    const data = SDESService.generateRandom(req.body.type);
    handleResponse(
      res,
      "SDES随机生成",
      data,
      `随机生成${data.length}位${data.name}`
    );
  } catch (error) {
    handleError(res, error, "SDES随机生成");
  }
});

// SM4相关路由
router.post(
  "/sm4/encrypt",
  validateParams(["plaintext", "key", "blockSize"]),
  async (req, res) => {
    try {
      const data = await SM4Service.encrypt(req.body);
      handleResponse(
        res,
        "SM4加密",
        data,
        `${config.messages.success.sm4Encrypt}，分组长度: ${data.blockSize}`
      );
    } catch (error) {
      handleError(res, error, "SM4加密");
    }
  }
);

router.post("/sm4/attack", async (req, res) => {
  try {
    const data = await SM4Service.attack(req.body);
    const message = data.success
      ? `${config.messages.success.sm4Attack}，分组长度: ${data.blockSize}`
      : "SM4攻击失败";
    handleResponse(res, "SM4攻击", data, message);
  } catch (error) {
    handleError(res, error, "SM4攻击");
  }
});

router.post(
  "/sm4/generate",
  validateParams(["blockSize"]),
  async (req, res) => {
    try {
      const data = SM4Service.generateRandom(req.body.blockSize);
      handleResponse(
        res,
        "SM4随机生成",
        data,
        `随机生成${data.blockSize}位01比特串`
      );
    } catch (error) {
      handleError(res, error, "SM4随机生成");
    }
  }
);

// DES相关路由（保持兼容性）
router.post(
  "/des/encrypt",
  validateParams(["plaintext1", "plaintext2", "key"]),
  async (req, res) => {
    try {
      const data = await SDESService.encrypt(req.body);
      handleResponse(res, "DES加密", data, "DES加密完成");
    } catch (error) {
      handleError(res, error, "DES加密");
    }
  }
);

router.post("/des/attack", async (req, res) => {
  try {
    const data = await SDESService.attack();
    handleResponse(
      res,
      "DES攻击",
      data,
      data.attackSuccess ? "DES攻击成功" : "DES攻击失败"
    );
  } catch (error) {
    handleError(res, error, "DES攻击");
  }
});

// 文件读取路由
router.get("/files/:category/:filename", async (req, res) => {
  try {
    const { category, filename } = req.params;
    const filePath = getFilePath(category, filename);

    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({
        success: false,
        error: config.messages.error.fileNotFound,
      });
    }

    const content = await readFile(filePath);
    handleResponse(
      res,
      "文件读取",
      { filename, content, path: filePath },
      "文件读取成功"
    );
  } catch (error) {
    handleError(res, error, "文件读取");
  }
});

// ===== 密码分析页面路由 =====
// PBLPKE算法安全性评估
router.post(
  "/analysis/pblpke/evaluate",
  validateParams(["n", "q", "norm"]),
  async (req, res) => {
    try {
      const data = await PBLPKEAnalysisService.evaluate(req.body);
      handleResponse(res, "PBLPKE安全性评估", data, "PBLPKE安全性评估完成");
    } catch (error) {
      handleError(res, error, "PBLPKE安全性评估");
    }
  }
);

// PBLSign算法安全性评估
router.post(
  "/analysis/pblsign/evaluate",
  validateParams(["n", "q", "norm"]),
  async (req, res) => {
    try {
      const data = await PBLSignAnalysisService.evaluate(req.body);
      handleResponse(res, "PBLSign安全性评估", data, "PBLSign安全性评估完成");
    } catch (error) {
      handleError(res, error, "PBLSign安全性评估");
    }
  }
);

// 生成分析报告
router.post(
  "/analysis/report",
  validateParams(["algorithm", "results"]),
  async (req, res) => {
    try {
      const data = await AnalysisUtilsService.generateReport(
        req.body.algorithm,
        req.body.results
      );
      handleResponse(res, "生成分析报告", data, "分析报告生成完成");
    } catch (error) {
      handleError(res, error, "生成分析报告");
    }
  }
);

// ===== 密钥生成页面路由 =====
// LWE密钥生成
router.post(
  "/keygen/lwe/generate",
  validateParams(["dimension", "modulus", "errorDistribution", "keyLength"]),
  async (req, res) => {
    try {
      const data = await LWEKeyGenService.generateKeys(req.body);
      handleResponse(res, "LWE密钥生成", data, "LWE密钥对生成完成");
    } catch (error) {
      handleError(res, error, "LWE密钥生成");
    }
  }
);

// 密钥验证
router.post(
  "/keygen/validate",
  validateParams(["publicKeyFile", "privateKeyFile"]),
  async (req, res) => {
    try {
      const data = await KeyValidationService.validateKeyPair(
        req.body.publicKeyFile,
        req.body.privateKeyFile
      );
      handleResponse(res, "密钥验证", data, "密钥验证完成");
    } catch (error) {
      handleError(res, error, "密钥验证");
    }
  }
);

// ===== 短基算法页面路由 =====
// LLL算法约化
router.post(
  "/shortbasis/lll/reduce",
  validateParams(["dimension", "latticeMatrix"]),
  async (req, res) => {
    try {
      const data = await LLLAlgorithmService.reduceBasis(req.body);
      handleResponse(res, "LLL约化", data, "LLL格基约化完成");
    } catch (error) {
      handleError(res, error, "LLL约化");
    }
  }
);

// BKZ算法约化
router.post(
  "/shortbasis/bkz/reduce",
  validateParams(["dimension", "latticeMatrix"]),
  async (req, res) => {
    try {
      const data = await BKZAlgorithmService.reduceBasis(req.body);
      handleResponse(res, "BKZ约化", data, "BKZ格基约化完成");
    } catch (error) {
      handleError(res, error, "BKZ约化");
    }
  }
);

// 格基质量评估
router.post(
  "/shortbasis/evaluate",
  validateParams(["dimension", "latticeMatrix"]),
  async (req, res) => {
    try {
      const data = await LatticeQualityService.evaluateBasis(req.body);
      handleResponse(res, "格基质量评估", data, "格基质量评估完成");
    } catch (error) {
      handleError(res, error, "格基质量评估");
    }
  }
);

// 随机格矩阵生成
router.post(
  "/shortbasis/generate",
  validateParams(["dimension"]),
  async (req, res) => {
    try {
      const data = await MatrixGeneratorService.generateRandomLattice(req.body);
      handleResponse(res, "随机格生成", data, "随机格矩阵生成完成");
    } catch (error) {
      handleError(res, error, "随机格生成");
    }
  }
);

// ===== 数字签名页面路由 =====
// 生成签名密钥对
router.post(
  "/signature/keygen",
  validateParams(["dimension", "modulus", "gaussianParameter"]),
  async (req, res) => {
    try {
      const data = await LatticeSignatureService.generateSigningKeys(req.body);
      handleResponse(res, "签名密钥生成", data, "签名密钥对生成完成");
    } catch (error) {
      handleError(res, error, "签名密钥生成");
    }
  }
);

// 消息签名
router.post(
  "/signature/sign",
  validateParams(["message", "privateKeyFile"]),
  async (req, res) => {
    try {
      const data = await MessageSigningService.signMessage(req.body);
      handleResponse(res, "消息签名", data, "消息签名完成");
    } catch (error) {
      handleError(res, error, "消息签名");
    }
  }
);

// 签名验证
router.post(
  "/signature/verify",
  validateParams(["signatureFile", "publicKeyFile"]),
  async (req, res) => {
    try {
      const data = await SignatureVerificationService.verifySignature(req.body);
      handleResponse(
        res,
        "签名验证",
        data,
        data.results.isValid ? "签名验证通过" : "签名验证失败"
      );
    } catch (error) {
      handleError(res, error, "签名验证");
    }
  }
);

// 批量签名
router.post(
  "/signature/batch/sign",
  validateParams(["messages", "privateKeyFile"]),
  async (req, res) => {
    try {
      const data = await BatchSigningService.signMultipleMessages(req.body);
      handleResponse(
        res,
        "批量签名",
        data,
        `批量签名完成，共处理${data.results.totalMessages}条消息`
      );
    } catch (error) {
      handleError(res, error, "批量签名");
    }
  }
);

// 批量验证
router.post(
  "/signature/batch/verify",
  validateParams(["batchFile", "publicKeyFile"]),
  async (req, res) => {
    try {
      const data = await BatchSigningService.verifyBatchSignatures(req.body);
      handleResponse(
        res,
        "批量验证",
        data,
        `批量验证完成，成功率: ${data.results.successRate}`
      );
    } catch (error) {
      handleError(res, error, "批量验证");
    }
  }
);

// 健康检查
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "LatticeCrypto后端服务运行正常",
    timestamp: Date.now(),
    version: "2.0.0",
  });
});

module.exports = router;
