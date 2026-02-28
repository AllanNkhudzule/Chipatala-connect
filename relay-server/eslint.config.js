const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-n');
const securityPlugin = require('eslint-plugin-security');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        ignores: ['node_modules/**', 'prisma/migrations/**'],
        plugins: {
            n: nodePlugin,
            security: securityPlugin,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'writable',
                exports: 'writable',
                __dirname: 'readonly',
                __filename: 'readonly',
                process: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                Buffer: 'readonly',
            },
        },
        rules: {
            'n/no-missing-require': 'error',
            'n/no-unpublished-require': 'off',
            'security/detect-object-injection': 'warn',
            'security/detect-non-literal-fs-filename': 'warn',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            eqeqeq: ['error', 'always'],
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
    prettierConfig,
];
