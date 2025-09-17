/**
 * API接口配置
 * 统一管理前后端接口地址
 */

// 后端服务配置
const API_CONFIG = {
  BASE_URL: "http://localhost:3001",
  TIMEOUT: 30000, // 30秒超时
};

// API接口地址
const API_URLS = {
  // 健康检查
  HEALTH: "/api/health",

  // LPN相关接口
  LPN: {
    GENERATE: "/api/quantum/lpn/generate",
    SOLVE: "/api/quantum/lpn/solve",
  },

  // DES相关接口
  DES: {
    ENCRYPT: "/api/quantum/des/encrypt",
    ATTACK: "/api/quantum/des/attack",
  },

  // SDES相关接口
  SDES: {
    ENCRYPT: "/api/quantum/sdes/encrypt",
    ATTACK: "/api/quantum/sdes/attack",
    COMPARISON: "/api/quantum/sdes/comparison",
    GENERATE: "/api/quantum/sdes/generate",
  },

  // SM4相关接口
  SM4: {
    ENCRYPT: "/api/quantum/sm4/encrypt",
    ATTACK: "/api/quantum/sm4/attack",
    GENERATE: "/api/quantum/sm4/generate",
  },

  // 文件操作接口
  FILES: {
    READ: "/api/files", // GET /api/files/:category/:filename
  },
};

// 构建完整URL
function buildApiUrl(endpoint) {
  return API_CONFIG.BASE_URL + endpoint;
}

// 通用AJAX请求函数
function makeApiRequest(method, endpoint, data = null, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = buildApiUrl(endpoint);
    const timeout = options.timeout || API_CONFIG.TIMEOUT;

    console.log(`发送${method}请求到:`, url);
    if (data) {
      console.log("请求数据:", data);
    }

    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.timeout = timeout;

    // 加载状态显示
    if (options.showLoading && window.Vue && options.loadingRef) {
      options.loadingRef.value = true;
    }

    xhr.onload = function () {
      // 隐藏加载状态
      if (options.showLoading && window.Vue && options.loadingRef) {
        options.loadingRef.value = false;
      }

      try {
        const response = JSON.parse(xhr.responseText);
        console.log(`${method}请求响应:`, response);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(
            new Error(response.error || `HTTP ${xhr.status}: ${xhr.statusText}`)
          );
        }
      } catch (error) {
        reject(new Error("响应解析失败: " + error.message));
      }
    };

    xhr.onerror = function () {
      // 隐藏加载状态
      if (options.showLoading && window.Vue && options.loadingRef) {
        options.loadingRef.value = false;
      }
      reject(new Error("网络请求失败"));
    };

    xhr.ontimeout = function () {
      // 隐藏加载状态
      if (options.showLoading && window.Vue && options.loadingRef) {
        options.loadingRef.value = false;
      }
      reject(new Error("请求超时"));
    };

    // 发送请求
    if (data) {
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}

// 封装的API调用函数
const QuantumAPI = {
  // 健康检查
  async healthCheck() {
    return makeApiRequest("GET", API_URLS.HEALTH);
  },

  // LPN问题生成
  async generateLPN(params, options = {}) {
    return makeApiRequest("POST", API_URLS.LPN.GENERATE, params, options);
  },

  // LPN问题求解
  async solveLPN(options = {}) {
    return makeApiRequest("POST", API_URLS.LPN.SOLVE, null, options);
  },

  // DES加密
  async encryptDES(params, options = {}) {
    return makeApiRequest("POST", API_URLS.DES.ENCRYPT, params, options);
  },

  // DES攻击
  async attackDES(params, options = {}) {
    return makeApiRequest("POST", API_URLS.DES.ATTACK, params, options);
  },

  // SM4加密
  async encryptSM4(params, options = {}) {
    return makeApiRequest("POST", API_URLS.SM4.ENCRYPT, params, options);
  },

  // SM4攻击
  async attackSM4(params, options = {}) {
    return makeApiRequest("POST", API_URLS.SM4.ATTACK, params, options);
  },

  // SDES加密
  async encryptSDES(params, options = {}) {
    return makeApiRequest("POST", API_URLS.SDES.ENCRYPT, params, options);
  },

  // SDES攻击
  async attackSDES(options = {}) {
    return makeApiRequest("POST", API_URLS.SDES.ATTACK, null, options);
  },

  // SDES方案对比
  async compareSDES(params, options = {}) {
    return makeApiRequest("POST", API_URLS.SDES.COMPARISON, params, options);
  },

  // 读取文件
  async readFile(category, filename, options = {}) {
    return makeApiRequest(
      "GET",
      `${API_URLS.FILES.read}/${category}/${filename}`,
      null,
      options
    );
  },
};

// 原有的apiUrls兼容（保持向后兼容）
const apiUrls = {
  decrypt: "/decrypt/",
  encrypt: "/encrypt/",
};

// 导出到全局作用域
if (typeof window !== "undefined") {
  window.API_CONFIG = API_CONFIG;
  window.API_URLS = API_URLS;
  window.buildApiUrl = buildApiUrl;
  window.makeApiRequest = makeApiRequest;
  window.QuantumAPI = QuantumAPI;
  window.apiUrls = apiUrls; // 兼容旧接口
}

// Node.js环境导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    API_CONFIG,
    API_URLS,
    buildApiUrl,
    makeApiRequest,
    QuantumAPI,
    apiUrls,
  };
}
