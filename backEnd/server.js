const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { config, getDataPath } = require("./config");
const { ensureDir } = require("./utils/common");
const routes = require("./routes");

const app = express();
const { port } = config.server;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由配置
app.use("/api/quantum", routes);

// 初始化数据目录
async function initializeDirectories() {
  const directories = Object.values(config.directories).map((dir) =>
    getDataPath(dir)
  );

  for (const dir of directories) {
    await ensureDir(dir);
  }
  console.log("数据目录已初始化");
}

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).json({
    success: false,
    error: "服务器内部错误",
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "接口不存在",
  });
});

// 启动服务器
async function startServer() {
  try {
    await initializeDirectories();

    app.listen(port, () => {
      console.log(`\n🚀 LatticeCrypto后端服务已启动`);
      console.log(`📡 服务地址: http://localhost:${port}`);
      console.log(`📁 数据目录: ${getDataPath()}`);
      console.log(`🔍 健康检查: http://localhost:${port}/api/quantum/health`);
      console.log(`\n可用的API接口:`);
      console.log(`  POST /api/quantum/lpn/generate - LPN问题生成`);
      console.log(`  POST /api/quantum/lpn/solve - LPN问题求解`);
      console.log(`  POST /api/quantum/sdes/encrypt - SDES加密`);
      console.log(`  POST /api/quantum/sdes/attack - SDES攻击`);
      console.log(`  POST /api/quantum/sdes/comparison - SDES方案对比`);
      console.log(`  POST /api/quantum/sm4/encrypt - SM4加密`);
      console.log(`  POST /api/quantum/sm4/attack - SM4攻击`);
      console.log(`  GET  /api/quantum/files/:category/:filename - 读取文件`);
      console.log(`\n按 Ctrl+C 停止服务器\n`);
    });
  } catch (error) {
    console.error("启动服务器失败:", error);
    process.exit(1);
  }
}

// 优雅关闭
process.on("SIGINT", () => {
  console.log("\n正在关闭服务器...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n正在关闭服务器...");
  process.exit(0);
});

startServer();
