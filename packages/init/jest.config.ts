import type { Config } from 'jest';

const config: Config = {
    collectCoverage: true, // 是否收集测试时的覆盖率信息
    coverageDirectory: "coverage", // 覆盖率信息输出目录
    coverageProvider: "v8", // 用哪个提供程序来检测代码以进行覆盖。允许的值为babel（默认）或v8
    coverageThreshold: {
        global: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
    },
    }, // 配置覆盖结果的最小阈值强制执行
    preset: "ts-jest", // 用作 Jest 配置基础的预设
    testEnvironment: "node", // 将用于测试的测试环境。 Jest 中的默认环境是 Node.js 环境。 如果你正在构建一个 web 应用程序，你可以通过 jsdom 来使用类似浏览器的环境
    verbose: true, // 是否应在运行期间报告每个单独的测试。
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)']
};

export default config;