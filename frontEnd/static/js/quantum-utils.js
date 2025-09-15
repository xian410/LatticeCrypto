// quantum-utils.js - 量子算法工具函数模块

/**
 * 参数验证工具类
 */
class QuantumValidators {
  static validateLPNParams(params) {
    const { paramCount, equationCount, errorRate, initialParams } = params;
    if (!paramCount || !equationCount || !errorRate || !initialParams) {
      return { valid: false, message: '请填写完整的LPN参数' };
    }
    return { valid: true };
  }

  static validateBitString(str, expectedLength = null) {
    if (!/^[01]+$/.test(str)) {
      return { valid: false, message: '必须为01比特串' };
    }
    if (expectedLength && str.length !== expectedLength) {
      return { valid: false, message: `长度必须为${expectedLength}位` };
    }
    return { valid: true };
  }

  static validateEncryptParams(activeSubFunction, params) {
    const validators = {
      des_onetime: () => {
        const { plaintext1, plaintext2, key } = params;
        if (!plaintext1 || !plaintext2 || !key) {
          return { valid: false, message: '请输入明文和密钥' };
        }
        return { valid: true };
      },
      sm4_onetime: () => {
        const { plaintext, key, blockSize } = params;
        if (!plaintext || !key) {
          return { valid: false, message: '请输入明文和密钥' };
        }
        if (plaintext.length !== blockSize || key.length !== blockSize) {
          return { valid: false, message: `明文和密钥长度必须都为${blockSize}位` };
        }
        const plaintextCheck = this.validateBitString(plaintext);
        const keyCheck = this.validateBitString(key);
        if (!plaintextCheck.valid || !keyCheck.valid) {
          return { valid: false, message: '明文和密钥必须为01比特串' };
        }
        return { valid: true };
      }
    };
    
    const validator = validators[activeSubFunction];
    return validator ? validator() : { valid: true };
  }

  static validateSDESParams(params) {
    const { plaintext1, plaintext2, key } = params;
    
    if (!plaintext1 || !plaintext2 || !key) {
      return { valid: false, message: '请输入完整的明文和密钥' };
    }
    
    if (plaintext1.length !== 8 || plaintext2.length !== 8) {
      return { valid: false, message: '明文长度必须为8位' };
    }
    
    if (key.length !== 10) {
      return { valid: false, message: '密钥长度必须为10位' };
    }
    
    const checkBits = [plaintext1, plaintext2, key].every(str => /^[01]+$/.test(str));
    if (!checkBits) {
      return { valid: false, message: '明文和密钥必须为01比特串' };
    }
    
    return { valid: true };
  }
}

/**
 * API调用工具类
 */
class QuantumAPIHelper {
  static async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(window.API_CONFIG.BASE_URL + endpoint, config);
    return await response.json();
  }

  static async generateLPN(params) {
    return window.QuantumAPI.generateLPN(params);
  }

  static async solveLPN() {
    return window.QuantumAPI.solveLPN();
  }

  static async encryptDES(params) {
    return window.QuantumAPI.encryptDES(params);
  }

  static async encryptSM4(params) {
    return window.QuantumAPI.encryptSM4(params);
  }

  static async attackDES(params) {
    return window.QuantumAPI.attackDES(params);
  }

  static async attackSM4(params) {
    return this.makeRequest('POST', '/api/quantum/sm4/attack', params);
  }

  static async encryptSDES(params) {
    return this.makeRequest('POST', '/api/quantum/sdes/encrypt', params);
  }

  static async attackSDES() {
    return this.makeRequest('POST', '/api/quantum/sdes/attack');
  }

  static async compareSDES(params) {
    return this.makeRequest('POST', '/api/quantum/sdes/comparison', params);
  }

  static async generateRandom(type, params) {
    const endpoints = {
      sdes: '/api/quantum/sdes/generate',
      sm4: '/api/quantum/sm4/generate'
    };
    return this.makeRequest('POST', endpoints[type], params);
  }
}

/**
 * 数据处理工具类
 */
class QuantumDataProcessor {
  static parseOutputParams(outputContent) {
    const params = {};
    if (!outputContent) return params;
    
    outputContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('=')) {
        const [key, value] = trimmed.split('=', 2);
        params[key.trim()] = value.trim();
      }
    });
    
    return params;
  }

  static generateLocalRandomBits(length) {
    return Array.from({length}, () => Math.random() < 0.5 ? '0' : '1').join('');
  }

  static formatResult(response, defaultValues = {}) {
    if (!response || !response.success) return null;
    
    return {
      time: response.data.executionTime || defaultValues.time || '0.00s',
      rate: response.data.successRate || defaultValues.rate || '0%',
      solve: response.data.solutionPreview || defaultValues.solve || '完成',
      secretKey: response.data.secretKey || defaultValues.secretKey || '',
      plaintext: response.data.recoveredPlaintext || defaultValues.plaintext || '',
      averageCalls: response.data.averageCalls || defaultValues.averageCalls || ''
    };
  }
}

/**
 * Vue混入对象
 */
const QuantumMixin = {
  methods: {
    // 通用请求处理方法
    async handleRequest(requestFn, loadingKey, successMsg, errorPrefix = '') {
      this.loadingStates[loadingKey] = true;
      try {
        const result = await requestFn();
        if (result.success) {
          this.$message.success(successMsg);
          return result;
        } else {
          throw new Error(result.error || result.message || '请求失败');
        }
      } catch (error) {
        this.$message.error(`${errorPrefix}${error.message}`);
        console.error(`${errorPrefix}异常:`, error);
        throw error;
      } finally {
        this.loadingStates[loadingKey] = false;
      }
    },

    // 随机生成处理方法
    async handleRandomGeneration(type, params, fallbackLength) {
      try {
        const response = await QuantumAPIHelper.generateRandom(type, params);
        if (response.success) {
          this.$message.success(`随机生成${response.data.length}位数据成功`);
          return response.data.randomBits;
        }
      } catch (error) {
        // 回退到本地生成
        const randomBits = QuantumDataProcessor.generateLocalRandomBits(fallbackLength);
        this.$message.success(`本地随机生成${fallbackLength}位数据成功`);
        return randomBits;
      }
    },

    // 参数重置方法
    resetParams(type) {
      if (this.params[type]) {
        Object.keys(this.params[type]).forEach(key => {
          this.params[type][key] = typeof this.params[type][key] === 'number' ? 
            (key === 'blockSize' ? 8 : 0) : '';
        });
      }
    }
  }
};

// 导出工具类和混入对象
if (typeof window !== 'undefined') {
  window.QuantumValidators = QuantumValidators;
  window.QuantumAPIHelper = QuantumAPIHelper;
  window.QuantumDataProcessor = QuantumDataProcessor;
  window.QuantumMixin = QuantumMixin;
}