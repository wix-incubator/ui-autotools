const HtmlWebpackPlugin = require('html-webpack-plugin');
const StylableWebpackPlugin = require('@stylable/webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = (_env, {mode = 'development', devtool = 'source-map'}) => {
    return {
        entry: {
            main: './src'
        },
        mode,
        devtool,
        output: {
            filename: mode === 'production' ? 'js/[name].min.js' : 'js/[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: '@ts-tools/webpack-loader'
                },
                {
                    test: /\.d\.ts$/,
                    include: /node_modules/,
                    loader: 'raw-loader'
                },
                {
                    test: /\.css$/,
                    exclude: /\.st\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ],
            noParse: [
                require.resolve('typescript/lib/typescript.js')
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.json']
        },
        plugins: [
            new StylableWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: 'Schema Playground'
            }),
            new MonacoWebpackPlugin({
                languages: ['css', 'javascript', 'typescript', 'html'],
                output: 'workers'
            })
            // new require('webpack-bundle-analyzer').BundleAnalyzerPlugin()
        ],
        performance: {
            hints: false
        }
    }
}
