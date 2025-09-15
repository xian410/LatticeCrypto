// 配置管理模块
const path = require("path");

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    host: "localhost",
  },

  // 数据目录配置
  dataDir: path.join(__dirname, "../../data"),

  // 子目录配置
  directories: {
    quantum: "quantum",
    analysis: "analysis",
    keygen: "keyGen",
    shortbasis: "shortBasis",
    signature: "signature",
  },

  // 文件名配置
  files: {
    lpn: {
      input: "input_gen.txt",
      output: "output.txt",
    },
    sdes: {
      input: "input.txt",
      output_1: "output_1.txt",
      output: "output.txt",
      input_2: "input_2.txt",
      output_2: "output_2.txt",
      attack_result: "attack_result.txt",
    },
    sm4: {
      input: (blockSize) => `input_encrypt_${blockSize}.txt`,
      output: (blockSize) => `output_${blockSize}.txt`,
      attack_result: (blockSize) => `attack_result_${blockSize}.txt`,
    },
  },

  // 算法参数配置
  algorithms: {
    sdes: {
      plaintextLength: 8,
      keyLength: 10,
    },
    sm4: {
      allowedBlockSizes: [8, 16],
    },
  },

  // 响应消息配置
  messages: {
    success: {
      lpnGenerate: "LPN问题生成完成",
      lpnSolve: "LPN问题求解完成",
      desEncrypt: "DES加密完成",
      desAttack: "DES攻击成功",
      sm4Encrypt: "SM4加密完成",
      sm4Attack: "SM4攻击成功",
      sdesEncrypt: "SDES加密完成",
      sdesAttack: "SDES攻击成功",
      sdesComparison: "SDES方案对比完成",
    },
    error: {
      missingParams: "缺少必要参数",
      invalidBitString: "必须为01比特串",
      invalidLength: "位数不正确",
      fileNotFound: "文件不存在",
      attackFailed: "攻击失败，请调整参数后重试",
    },
  },
};

/**
 * 获取数据目录路径
 */
function getDataPath(category = "") {
  return category ? path.join(config.dataDir, category) : config.dataDir;
}

/**
 * 获取文件路径
 */
function getFilePath(category, filename) {
  // quantum模块的特殊处理
  if (["lpn", "sdes", "sm4"].includes(category)) {
    return path.join(getDataPath("quantum"), filename);
  }

  // 其他模块使用对应的目录
  const dirMapping = {
    analysis: "analysis",
    keygen: "keyGen",
    shortbasis: "shortBasis",
    signature: "signature",
  };

  const targetDir = dirMapping[category] || category;
  return path.join(getDataPath(targetDir), filename);
}

module.exports = {
  config,
  getDataPath,
  getFilePath,
};
