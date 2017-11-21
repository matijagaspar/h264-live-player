const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: "./wsavc/index",
    output: {
        // options related to how webpack emits results
    
        path: path.resolve(__dirname, "dist_webpack"), // string
        // the target directory for all output files
        // must be an absolute path (use the Node.js path module)
        filename: "bundle.js", 
        library: "WSAvcPlayer",
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            loader: "babel-loader",
            // the loader which should be applied, it'll be resolved relative to the context
            // -loader suffix is no longer optional in webpack2 for clarity reasons
            // see webpack 1 upgrade guide
    
            options: {
              presets: [
                  "stage-1",
                  ["env", {
                    "targets": {
                      "browsers": [">= 5%"]          
                    }
                  }]
                ]
            },
          }
        ]
      },
    node: {
        fs: 'empty'
    },
    plugins: [
        new UglifyJsPlugin()
      ]
    
}