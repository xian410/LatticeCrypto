# Quantum.html 文件操作功能实现说明

## 概述

根据用户需求，已成功修改 quantum.html 页面和对应的 Node.js 后端方法，实现了正确的文件读写操作。所有功能都按照指定的文件格式进行输入输出。

## 功能实现详情

### 1. LPN (Learning Parity with Noise) 功能

#### 自动生成 LPN 问题

- **输入界面**: 变量个数、方程个数、误差概率、初始参数次数
- **文件操作**:
  - 写入 `/lpn/input_gen.txt` (每行一个值，按顺序)
  - 生成 `/lpn/output.txt` (三行：解的 01 比特串、概率浮点数、运行时间浮点数)
- **API 测试**: ✅ 已验证

#### 求解已知 LPN 问题

- **功能**: 读取现有的 output.txt 文件内容
- **显示**: 解、概率、运行时间
- **API 测试**: ✅ 已验证

### 2. SM4 国密算法功能

#### 加密部分

- **支持分组**: 8 位和 16 位
- **随机生成**: 支持明文和密钥的 8 位/16 位随机生成
- **位数检查**: 自动验证明文和密钥长度正确性
- **文件操作**:
  - 8 位: 写入 `/sm4/input_encrypt_8.txt`, 生成 `/sm4/output_8.txt`
  - 16 位: 写入 `/sm4/input_encrypt_16.txt`, 生成 `/sm4/output_16.txt`
  - 格式: 第一行明文，第二行密钥(输入) / 第一行明文，第二行密文(输出)
- **API 测试**: ✅ 已验证

#### 攻击部分

- **读取文件**: 根据分组长度读取对应的 output 文件
- **显示内容**: 明密文对自动显示
- **攻击结果**: 写入 `/sm4/output.txt` (三行：密钥 01 比特串、概率、平均调用次数)
- **API 测试**: ✅ 已验证

### 3. SDES 简化 DES 功能

#### 加密部分

- **界面**: 两组明密文界面
- **长度**: 明文 8 位，密钥 10 位
- **文件操作**:
  - 写入 `/sdes/input.txt` (三行：明文 1、明文 2、密钥)
  - 生成 `/sdes/output_1.txt` (四行：明文 1、明文 2、密文 1、密文 2)
- **API 测试**: ✅ 已验证

#### 攻击部分

- **读取**: 从 output_1.txt 读取内容并展示
- **攻击**: 生成 `/sdes/output.txt` (三行：密钥 01 比特串、概率、平均调用次数)
- **API 测试**: ✅ 已验证

#### 方案对比

- **输入**: 实验次数选择
- **文件操作**:
  - 写入 `/sdes/input_2.txt` (一行：实验次数)
  - 生成 `/sdes/output_2.txt` (三行：三个方案的概率)
- **API 测试**: ✅ 已验证

## 文件格式示例

### LPN 文件格式

```
// input_gen.txt
10
20
0.1
5

// output.txt
求解结果：\nx1 = 123...\nx2 = 456...
0.9481
1.76
```

### SM4 文件格式

```
// input_encrypt_8.txt
10110001
01010101

// output_8.txt
10110001
11100100

// output.txt (攻击结果)
01010101
0.7584
1392
```

### SDES 文件格式

```
// input.txt
10110001
01010101
1011000110

// output_1.txt
10110001
01010101
00000000
11100100

// input_2.txt (方案对比)
100

// output_2.txt (方案对比结果)
0.8220
0.6122
0.8313
```

## 前端界面优化

1. **参数验证**: 增强了输入验证，确保位数正确
2. **随机生成**: 完善了各算法的随机生成功能
3. **文件读取**: 实现了攻击部分的文件内容自动显示
4. **结果展示**: 按照新格式正确显示解、概率、运行时间

## API 接口

所有功能通过以下 API 接口实现：

- `POST /api/quantum/lpn/generate` - LPN 问题生成
- `POST /api/quantum/lpn/solve` - LPN 问题求解
- `POST /api/quantum/sm4/encrypt` - SM4 加密
- `POST /api/quantum/sm4/attack` - SM4 攻击
- `POST /api/quantum/sdes/encrypt` - SDES 加密
- `POST /api/quantum/sdes/attack` - SDES 攻击
- `POST /api/quantum/sdes/comparison` - SDES 方案对比

## 测试验证

所有功能已通过 API 测试验证：
✅ LPN 生成和求解
✅ SM4 8 位和 16 位加密/攻击
✅ SDES 加密/攻击/方案对比
✅ 文件格式完全符合要求
✅ 前后端交互正常

## 使用说明

1. 启动后端服务：`cd backEnd && npm start`
2. 启动前端服务：`cd frontEnd && python3 -m http.server 8080`
3. 访问：http://localhost:8080/pages/parts/quantum.html
4. 按界面提示操作，所有文件会自动生成到 data/quantum 目录下
