// 路由模块
const express = require("express");
const {
  LPNService,
  SDESService,
  SM4Service,
} = require("../services/algorithms");
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

router.post(
  "/sm4/attack",
  validateParams(["plaintext", "ciphertext", "blockSize"]),
  async (req, res) => {
    try {
      const data = await SM4Service.attack(req.body);
      const message = data.success
        ? `${config.messages.success.sm4Attack}，分组长度: ${data.blockSize}`
        : "SM4攻击失败";
      handleResponse(res, "SM4攻击", data, message);
    } catch (error) {
      handleError(res, error, "SM4攻击");
    }
  }
);

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
