/**
 * ajax请求数据
 * apiUrl:为接口
 * data:请求参数
 * type:请求类型
 * callback:回调函数
 * */
function getPostData(apiUrl, data, type, callback) {
  $.ajax({
    type: type,
    url: apiUrl,
    //data: JSON.stringify(data),
    data: data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    success: callback,
    error: function (e) {
      alert(e.msg);
    },
  });
}

// Node.js 环境检测
if (typeof module !== "undefined" && module.exports) {
  // Node.js 环境下的依赖引入
  const fs = require("fs");
  const path = require("path");
  const { spawn, exec } = require("child_process");

  /**
   * 将参数写入到文件中
   * @param {string} filePath - 文件路径
   * @param {Object|string} data - 要写入的数据
   * @param {Object} options - 可选参数
   * @param {string} options.encoding - 文件编码，默认为'utf8'
   * @param {boolean} options.append - 是否追加写入，默认为false（覆盖写入）
   * @param {string} options.format - 数据格式，'json'或'text'，默认为'json'
   * @returns {Promise} - 返回Promise对象
   */
  function writeParamsToFile(filePath, data, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const { encoding = "utf8", append = false, format = "json" } = options;

        // 确保目录存在
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // 根据格式处理数据
        let content;
        if (format === "json") {
          content =
            typeof data === "string" ? data : JSON.stringify(data, null, 2);
        } else {
          content = String(data);
        }

        // 写入文件
        const writeMethod = append ? fs.appendFile : fs.writeFile;
        writeMethod(filePath, content, encoding, (err) => {
          if (err) {
            console.error("写入文件失败:", err);
            reject(err);
          } else {
            console.log(`参数已成功写入文件: ${filePath}`);
            resolve({
              success: true,
              filePath: filePath,
              dataLength: content.length,
            });
          }
        });
      } catch (error) {
        console.error("写入参数时发生错误:", error);
        reject(error);
      }
    });
  }

  /**
   * 从文件中读取参数
   * @param {string} filePath - 文件路径
   * @param {Object} options - 可选参数
   * @param {string} options.encoding - 文件编码，默认为'utf8'
   * @param {string} options.format - 数据格式，'json'或'text'，默认为'json'
   * @param {*} options.defaultValue - 文件不存在时返回的默认值
   * @returns {Promise} - 返回Promise对象，包含读取的数据
   */
  function readParamsFromFile(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const {
          encoding = "utf8",
          format = "json",
          defaultValue = null,
        } = options;

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          if (defaultValue !== null) {
            console.log(`文件不存在，返回默认值: ${filePath}`);
            resolve(defaultValue);
            return;
          } else {
            const error = new Error(`文件不存在: ${filePath}`);
            reject(error);
            return;
          }
        }

        // 读取文件
        fs.readFile(filePath, encoding, (err, data) => {
          if (err) {
            console.error("读取文件失败:", err);
            reject(err);
          } else {
            try {
              let result;
              if (format === "json") {
                result = JSON.parse(data);
              } else {
                result = data;
              }
              console.log(`参数已成功从文件读取: ${filePath}`);
              resolve(result);
            } catch (parseError) {
              console.error("解析文件内容失败:", parseError);
              reject(parseError);
            }
          }
        });
      } catch (error) {
        console.error("读取参数时发生错误:", error);
        reject(error);
      }
    });
  }

  /**
   * 调用可执行文件
   * @param {string} executablePath - 可执行文件路径
   * @param {Array} args - 命令行参数数组
   * @param {Object} options - 可选参数
   * @param {string} options.cwd - 工作目录
   * @param {Object} options.env - 环境变量
   * @param {number} options.timeout - 超时时间（毫秒），默认30秒
   * @param {string} options.encoding - 输出编码，默认为'utf8'
   * @param {boolean} options.shell - 是否在shell中执行，默认为false
   * @returns {Promise} - 返回Promise对象，包含执行结果
   */
  function executeFile(executablePath, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const {
          cwd = process.cwd(),
          env = process.env,
          timeout = 30000,
          encoding = "utf8",
          shell = false,
        } = options;

        console.log(`执行可执行文件: ${executablePath}`);
        console.log(`参数: ${args.join(" ")}`);
        console.log(`工作目录: ${cwd}`);

        const child = spawn(executablePath, args, {
          cwd: cwd,
          env: env,
          shell: shell,
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        // 收集标准输出
        child.stdout.on("data", (data) => {
          stdout += data.toString(encoding);
        });

        // 收集错误输出
        child.stderr.on("data", (data) => {
          stderr += data.toString(encoding);
        });

        // 设置超时
        const timer = setTimeout(() => {
          child.kill("SIGTERM");
          reject(new Error(`执行超时: ${timeout}ms`));
        }, timeout);

        // 监听进程结束
        child.on("close", (code) => {
          clearTimeout(timer);

          const result = {
            success: code === 0,
            exitCode: code,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            executablePath: executablePath,
            args: args,
          };

          if (code === 0) {
            console.log(`可执行文件执行成功，退出码: ${code}`);
            resolve(result);
          } else {
            console.error(`可执行文件执行失败，退出码: ${code}`);
            console.error(`错误输出: ${stderr}`);
            reject(new Error(`执行失败，退出码: ${code}\n错误输出: ${stderr}`));
          }
        });

        // 监听错误事件
        child.on("error", (error) => {
          clearTimeout(timer);
          console.error("执行可执行文件时发生错误:", error);
          reject(error);
        });
      } catch (error) {
        console.error("调用可执行文件时发生错误:", error);
        reject(error);
      }
    });
  }

  // 导出函数供其他模块使用
  module.exports = {
    writeParamsToFile,
    readParamsFromFile,
    executeFile,
    getPostData, // 保留原有的AJAX函数
  };
} else {
  // 浏览器环境下的处理
  console.log("当前在浏览器环境中，Node.js函数不可用");
}
