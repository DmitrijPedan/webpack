const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const isDev = process.env.NODE_ENV === 'development';

const optimization = () => {
    const config = {splitChunks: {chunks: 'all'}};
    if (!isDev) {
        config.minimizer = [
            new OptimizeCssAssetsPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config;
}

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const plugins = () => {
    const basePlugins = [
        new HtmlWebpackPlugin({
            template: './index.html',
            // минифицировать при production mode
            minify: {
                collapseWhitespace: !isDev
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: filename('css'),
        }),
        // копировать статические файлы и папки
        // new CopyWebpackPlugin({patterns:[
        //         {
        //             from: path.resolve(__dirname, 'src/assets/favicon.png'),
        //             to: path.resolve(__dirname, 'public/assets/favicon.png')
        //         }
        //     ]})
    ];
    // Bundle analyze при билде в production
    // if (!isDev) {
    //     basePlugins.push(new BundleAnalyzerPlugin());
    // }
    return basePlugins;
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './index.js']
        // второстепенный js файл (если есть кроме index.js)
        // second: './second.js'
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'public')
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    optimization: optimization(),
    devServer: {
        port: 3000,
        hot: isDev
    },
    devtool: isDev ? 'source-map' : '',
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [{
                        loader: MiniCssExtractPlugin.loader,
                        options: {hmr: isDev, reloadAll: true},
                        },
                        'css-loader'
                    ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {hmr: isDev, reloadAll: true},
                },
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                loader: 'file-loader',
                include: path.resolve(__dirname, 'src/assets/images'),
                options: {
                    limit: 10000,
                    name: isDev ? '[name].[ext]' : '[name].[hash].[ext]',
                    outputPath: './assets/images',
                }
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                loader: 'file-loader',
                include: path.resolve(__dirname, 'src/assets/fonts'),
                options: {
                    limit: 10000,
                    name: '[name].[ext]',
                    outputPath: './assets/fonts',
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript'
                        ]
                    }
                }
            }
        ]
    }
}
