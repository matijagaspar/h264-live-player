const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const libraryName = 'WSAvcPlayer'
module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        // options related to how webpack emits results

        path: path.resolve(__dirname, 'lib'), // string
        // the target directory for all output files
        // must be an absolute path (use the Node.js path module)
        filename: `${ libraryName }.js`,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                // the loader which should be applied, it'll be resolved relative to the context
                // -loader suffix is no longer optional in webpack2 for clarity reasons
                // see webpack 1 upgrade guide

                options: {
                    presets: [
                        'stage-1',
                        [ 'env', {
                            'targets': {
                                'browsers': [ '>= 5%' ],
                            },
                        }],
                    ],
                },
            },
        ],
    },
    resolve: {
        modules: [ path.resolve(__dirname, 'src'), 'node_modules' ],
    },
    node: {
        fs: 'empty',
    },
    plugins: [
        new UglifyJsPlugin(),
    ],

}