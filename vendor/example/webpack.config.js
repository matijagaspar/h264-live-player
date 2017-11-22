const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpackConfig = {
    entry: path.resolve(__dirname, 'index.js'),
    output: {
        // options related to how webpack emits results

        path: path.resolve(__dirname, 'dist'), // string
        // the target directory for all output files
        // must be an absolute path (use the Node.js path module)
        filename: `bundle.js`,
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /.*node_modules.*/,
                // the loader which should be applied, it'll be resolved relative to the context
                // -loader suffix is no longer optional in webpack2 for clarity reasons
                // see webpack 1 upgrade guide

                options: {
                    presets: [
                        'stage-1',
                        [ 'env', {
                            'debug': false,
                            'targets': {
                                'node': 'current',
                            },
                        }],
                    ],
                },
            },
        ],
    },
    resolve: {
        modules: [ path.resolve(__dirname, '../src'), '../node_modules' ],
    }
    // node: {
    //     fs: 'empty',
    // },
}

module.exports = webpackConfig