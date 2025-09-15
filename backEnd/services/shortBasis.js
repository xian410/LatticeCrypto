// shortBasis.js - 短基算法页面相关业务逻辑
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
 * LLL算法服务
 */
class LLLAlgorithmService {
  static async reduceBasis(params) {
    const {
      dimension,
      latticeMatrix,
      delta = 0.75,
      precision = 1e-10,
    } = params;

    // 参数验证
    if (!dimension || !latticeMatrix) {
      throw new Error("缺少必要参数：dimension, latticeMatrix");
    }

    if (dimension < 2 || dimension > 1000) {
      throw new Error("格维度范围应在2-1000之间");
    }

    if (delta < 0.25 || delta > 1.0) {
      throw new Error("LLL参数delta应在0.25-1.0之间");
    }

    await delay(2000 + dimension * 10);

    // 执行LLL约化
    const reductionResult = this.performLLLReduction(
      dimension,
      latticeMatrix,
      delta
    );

    // 写入输入文件
    const inputContent = [
      `algorithm=LLL`,
      `dimension=${dimension}`,
      `delta=${delta}`,
      `precision=${precision}`,
      `originalMatrix=${latticeMatrix}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const inputFile = getFilePath("shortbasis", "lll_input.txt");
    await writeFile(inputFile, inputContent);

    // 写入输出文件
    const outputContent = [
      `algorithm=LLL`,
      `dimension=${dimension}`,
      `reducedMatrix=${reductionResult.reducedMatrix}`,
      `shortestVector=${reductionResult.shortestVector}`,
      `reductionRatio=${reductionResult.reductionRatio}`,
      `iterations=${reductionResult.iterations}`,
      `executionTime=${reductionResult.executionTime}`,
      `qualityMetric=${reductionResult.qualityMetric}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const outputFile = getFilePath("shortbasis", "lll_output.txt");
    await writeFile(outputFile, outputContent);

    return {
      inputFile,
      outputFile,
      results: reductionResult,
    };
  }

  static performLLLReduction(dimension, latticeMatrix, delta) {
    // 模拟LLL约化过程
    const reducedMatrix = this.generateReducedMatrix(dimension, latticeMatrix);
    const shortestVector = this.findShortestVector(reducedMatrix, dimension);

    return {
      reducedMatrix,
      shortestVector,
      reductionRatio: (0.6 + Math.random() * 0.3).toFixed(4), // 约化比例
      iterations: Math.floor(
        dimension * Math.log(dimension) + Math.random() * 50
      ),
      executionTime: (dimension * 0.1 + Math.random() * 2).toFixed(3) + "s",
      qualityMetric: this.calculateQualityMetric(dimension, delta),
      hermiteFactor: this.calculateHermiteFactor(dimension),
    };
  }

  static generateReducedMatrix(dimension, originalMatrix) {
    // 生成约化后的矩阵（模拟）
    let reducedMatrix = "";
    for (let i = 0; i < dimension; i++) {
      const row = [];
      for (let j = 0; j < dimension; j++) {
        // 约化后的值通常比原始值小
        const reducedValue = Math.floor(Math.random() * 100 - 50);
        row.push(reducedValue);
      }
      reducedMatrix += row.join(",") + ";";
    }
    return reducedMatrix;
  }

  static findShortestVector(matrix, dimension) {
    // 生成最短向量（模拟）
    const shortestVector = [];
    for (let i = 0; i < dimension; i++) {
      shortestVector.push(Math.floor(Math.random() * 20 - 10));
    }
    return shortestVector.join(",");
  }

  static calculateQualityMetric(dimension, delta) {
    // 计算约化质量指标
    const baseQuality = Math.pow(delta, dimension / 4);
    const noise = 1 + (Math.random() - 0.5) * 0.1;
    return (baseQuality * noise).toFixed(6);
  }

  static calculateHermiteFactor(dimension) {
    // 计算Hermite因子
    const theoreticalFactor = Math.pow(2, dimension / (4 * Math.log(2)));
    const actualFactor = theoreticalFactor * (1 + (Math.random() - 0.5) * 0.2);
    return actualFactor.toFixed(6);
  }
}

/**
 * BKZ算法服务
 */
class BKZAlgorithmService {
  static async reduceBasis(params) {
    const {
      dimension,
      latticeMatrix,
      blockSize = 20,
      tours = 8,
      precision = 1e-10,
    } = params;

    // 参数验证
    if (!dimension || !latticeMatrix) {
      throw new Error("缺少必要参数：dimension, latticeMatrix");
    }

    if (dimension < 2 || dimension > 1000) {
      throw new Error("格维度范围应在2-1000之间");
    }

    if (blockSize < 2 || blockSize > dimension) {
      throw new Error(`BKZ块大小应在2-${dimension}之间`);
    }

    if (tours < 1 || tours > 50) {
      throw new Error("BKZ轮数应在1-50之间");
    }

    await delay(3000 + dimension * blockSize);

    // 执行BKZ约化
    const reductionResult = this.performBKZReduction(
      dimension,
      latticeMatrix,
      blockSize,
      tours
    );

    // 写入输入文件
    const inputContent = [
      `algorithm=BKZ`,
      `dimension=${dimension}`,
      `blockSize=${blockSize}`,
      `tours=${tours}`,
      `precision=${precision}`,
      `originalMatrix=${latticeMatrix}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const inputFile = getFilePath("shortbasis", "bkz_input.txt");
    await writeFile(inputFile, inputContent);

    // 写入输出文件
    const outputContent = [
      `algorithm=BKZ`,
      `dimension=${dimension}`,
      `blockSize=${blockSize}`,
      `reducedMatrix=${reductionResult.reducedMatrix}`,
      `shortestVector=${reductionResult.shortestVector}`,
      `reductionRatio=${reductionResult.reductionRatio}`,
      `totalTours=${reductionResult.totalTours}`,
      `executionTime=${reductionResult.executionTime}`,
      `qualityMetric=${reductionResult.qualityMetric}`,
      `hermiteFactor=${reductionResult.hermiteFactor}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const outputFile = getFilePath("shortbasis", "bkz_output.txt");
    await writeFile(outputFile, outputContent);

    return {
      inputFile,
      outputFile,
      results: reductionResult,
    };
  }

  static performBKZReduction(dimension, latticeMatrix, blockSize, tours) {
    // 模拟BKZ约化过程
    const reducedMatrix = this.generateBKZReducedMatrix(
      dimension,
      latticeMatrix,
      blockSize
    );
    const shortestVector = this.findBKZShortestVector(reducedMatrix, dimension);

    return {
      reducedMatrix,
      shortestVector,
      reductionRatio: (0.4 + Math.random() * 0.4).toFixed(4), // BKZ通常比LLL约化得更好
      totalTours: tours,
      executionTime:
        (dimension * blockSize * 0.05 + Math.random() * 5).toFixed(3) + "s",
      qualityMetric: this.calculateBKZQualityMetric(dimension, blockSize),
      hermiteFactor: this.calculateBKZHermiteFactor(dimension, blockSize),
      approximationFactor: this.calculateApproximationFactor(blockSize),
    };
  }

  static generateBKZReducedMatrix(dimension, originalMatrix, blockSize) {
    // 生成BKZ约化后的矩阵（通常比LLL更优）
    let reducedMatrix = "";
    for (let i = 0; i < dimension; i++) {
      const row = [];
      for (let j = 0; j < dimension; j++) {
        // BKZ约化后的值比LLL更小
        const reductionFactor = Math.max(0.1, 1 - blockSize / dimension);
        const reducedValue = Math.floor(
          (Math.random() * 80 - 40) * reductionFactor
        );
        row.push(reducedValue);
      }
      reducedMatrix += row.join(",") + ";";
    }
    return reducedMatrix;
  }

  static findBKZShortestVector(matrix, dimension) {
    // 生成BKZ找到的最短向量
    const shortestVector = [];
    for (let i = 0; i < dimension; i++) {
      shortestVector.push(Math.floor(Math.random() * 16 - 8));
    }
    return shortestVector.join(",");
  }

  static calculateBKZQualityMetric(dimension, blockSize) {
    // BKZ质量指标计算
    const baseQuality = Math.pow(2, -dimension / (2 * blockSize));
    const enhancement = 1 + blockSize / dimension;
    return (baseQuality * enhancement).toFixed(8);
  }

  static calculateBKZHermiteFactor(dimension, blockSize) {
    // BKZ Hermite因子
    const exponent = (blockSize - 1) / (2 * blockSize);
    const factor = Math.pow(blockSize / (2 * Math.PI * Math.E), exponent);
    return (factor * (1 + (Math.random() - 0.5) * 0.1)).toFixed(6);
  }

  static calculateApproximationFactor(blockSize) {
    // 近似因子
    return Math.pow(2, blockSize / 4 + Math.random() * 2).toFixed(2);
  }
}

/**
 * 格基质量评估服务
 */
class LatticeQualityService {
  static async evaluateBasis(params) {
    const {
      dimension,
      latticeMatrix,
      algorithm = "auto", // auto, lll, bkz
    } = params;

    if (!dimension || !latticeMatrix) {
      throw new Error("缺少必要参数：dimension, latticeMatrix");
    }

    await delay(1000);

    // 评估格基质量
    const qualityMetrics = this.calculateQualityMetrics(
      dimension,
      latticeMatrix,
      algorithm
    );

    // 写入评估结果
    const evaluationResult = {
      algorithm: algorithm,
      dimension: dimension,
      metrics: qualityMetrics,
      recommendations: this.generateQualityRecommendations(qualityMetrics),
      timestamp: Date.now(),
    };

    const evaluationFile = getFilePath("shortbasis", "quality_evaluation.json");
    await writeFile(evaluationFile, evaluationResult, "json");

    return {
      evaluationFile,
      results: evaluationResult,
    };
  }

  static calculateQualityMetrics(dimension, latticeMatrix, algorithm) {
    return {
      orthogonalityDefect: this.calculateOrthogonalityDefect(dimension),
      hadamardRatio: this.calculateHadamardRatio(dimension),
      rootHermiteFactor: this.calculateRootHermiteFactor(dimension),
      potentialReduction: this.estimatePotentialReduction(dimension, algorithm),
      basisLength: this.calculateBasisLength(dimension),
      conditioning: this.calculateConditioning(dimension),
      sparsity: this.calculateSparsity(latticeMatrix),
    };
  }

  static calculateOrthogonalityDefect(dimension) {
    // 正交性缺陷
    return Math.pow(2, dimension * Math.random() * 0.5).toFixed(2);
  }

  static calculateHadamardRatio(dimension) {
    // Hadamard比率
    return (Math.random() * 0.8 + 0.1).toFixed(6);
  }

  static calculateRootHermiteFactor(dimension) {
    // 根Hermite因子
    return (1.01 + Math.random() * 0.05).toFixed(4);
  }

  static estimatePotentialReduction(dimension, algorithm) {
    // 估算潜在约化比例
    const baseReduction = algorithm === "bkz" ? 0.7 : 0.5;
    return (baseReduction + Math.random() * 0.2).toFixed(3);
  }

  static calculateBasisLength(dimension) {
    // 基向量长度
    return Math.floor(Math.sqrt(dimension) * (50 + Math.random() * 100));
  }

  static calculateConditioning(dimension) {
    // 条件数
    return Math.pow(10, 2 + Math.random() * 4).toFixed(2);
  }

  static calculateSparsity(latticeMatrix) {
    // 稀疏性（模拟）
    return (0.1 + Math.random() * 0.3).toFixed(3);
  }

  static generateQualityRecommendations(metrics) {
    const recommendations = [];

    if (parseFloat(metrics.hadamardRatio) < 0.3) {
      recommendations.push("格基质量较差，建议使用BKZ算法进行约化");
    }

    if (parseFloat(metrics.rootHermiteFactor) > 1.03) {
      recommendations.push("Hermite因子偏高，可以进一步优化");
    }

    if (parseFloat(metrics.conditioning) > 10000) {
      recommendations.push("条件数过高，可能存在数值稳定性问题");
    }

    if (parseFloat(metrics.potentialReduction) > 0.8) {
      recommendations.push("存在较大约化潜力，建议运行更多轮约化");
    }

    return recommendations;
  }
}

/**
 * 矩阵生成工具服务
 */
class MatrixGeneratorService {
  static async generateRandomLattice(params) {
    const {
      dimension,
      determinant,
      distributionType = "uniform", // uniform, gaussian, knapsack
      seed,
    } = params;

    if (!dimension) {
      throw new Error("缺少必要参数：dimension");
    }

    if (dimension < 2 || dimension > 500) {
      throw new Error("维度范围应在2-500之间");
    }

    await delay(500 + dimension * 2);

    // 设置随机种子（如果提供）
    if (seed) {
      Math.seedrandom && Math.seedrandom(seed);
    }

    const latticeMatrix = this.generateMatrix(
      dimension,
      distributionType,
      determinant
    );

    // 写入生成的矩阵
    const matrixContent = [
      `generationType=randomLattice`,
      `dimension=${dimension}`,
      `distributionType=${distributionType}`,
      `determinant=${determinant || "auto"}`,
      `seed=${seed || "none"}`,
      `matrix=${latticeMatrix}`,
      `timestamp=${Date.now()}`,
    ].join("\n");

    const matrixFile = getFilePath("shortbasis", "generated_matrix.txt");
    await writeFile(matrixFile, matrixContent);

    return {
      matrixFile,
      matrix: latticeMatrix,
      properties: this.analyzeMatrixProperties(latticeMatrix, dimension),
    };
  }

  static generateMatrix(dimension, distributionType, determinant) {
    let matrix = "";

    for (let i = 0; i < dimension; i++) {
      const row = [];
      for (let j = 0; j < dimension; j++) {
        let value;
        switch (distributionType) {
          case "gaussian":
            value = Math.floor(this.gaussianRandom() * 50);
            break;
          case "knapsack":
            value =
              i === j
                ? Math.floor(Math.random() * 1000 + 100)
                : Math.floor(Math.random() * 10);
            break;
          case "uniform":
          default:
            value = Math.floor(Math.random() * 200 - 100);
            break;
        }
        row.push(value);
      }
      matrix += row.join(",") + ";";
    }

    return matrix;
  }

  static gaussianRandom() {
    // Box-Muller变换
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  static analyzeMatrixProperties(matrix, dimension) {
    return {
      dimension: dimension,
      density: (0.5 + Math.random() * 0.4).toFixed(3),
      estimatedDeterminant: Math.floor(
        Math.pow(10, dimension * 0.5 + Math.random() * 5)
      ),
      maxEntry: Math.floor(Math.random() * 200),
      minEntry: -Math.floor(Math.random() * 200),
      rank: dimension, // 假设满秩
      sparsity: (Math.random() * 0.3).toFixed(3),
    };
  }
}

module.exports = {
  LLLAlgorithmService,
  BKZAlgorithmService,
  LatticeQualityService,
  MatrixGeneratorService,
};
