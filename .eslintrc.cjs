// eslint-disable-next-line
module.exports = {
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': 'eslint:recommended',
    'plugins': [
        'prefer-let'
    ],
    'overrides': [
    ],
    'globals': {
        'process': true,
        'Buffer': true
    },
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'eol-last': [
            'error',
            'always'
        ],
        'prefer-let/prefer-let': [
            'error'
        ],
        'padded-blocks': [
            'error',
            'never'
        ],
        'no-multiple-empty-lines': [
            'error',
            {
                'max': 1,
            }
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ]
    }
};
