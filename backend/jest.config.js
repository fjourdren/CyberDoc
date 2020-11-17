module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json"
        }
    },
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/tests/**/*.test.(ts|js)"
    ],
    testEnvironment: "node",
    collectCoverageFrom: [
        "src/**/*.ts",
        "!**/node_modules/**",
        "!**/coverage/**",
        "!src/components/**",
        "!src/index.js",
        "!src/serviceWorker.js"
    ],
    coverageReporters: [
        "html", "cobertura", "json", "lcov", "text", "clover"
    ],
    coverageThreshold: {
        "global": {
            "branches": 50,
            "functions": 40,
            "lines": 50,
            "statements": 50
        }
    }
};
