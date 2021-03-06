//webpack dev开发环境配置文件
'use strict'
//引入当前目录下的utils.js文件模块
const utils = require('./utils')
//内置模块
const webpack = require('webpack')
//引入config目录下的index.js文件
const config = require('../config')
//进行合并对象，相同项目会进行覆盖
const merge = require('webpack-merge')
//node的path模块
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
//复制webpack插件
const CopyWebpackPlugin = require('copy-webpack-plugin')
// 下面是一个自动生成html的插件，能够把资源自动加载到html文件中
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 下面这个插件是用来把webpack的错误和日志收集起来，漂亮的展示给用户
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
//找到当前机器打开的端口
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)
//开发环境的配置
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    //loader的配置，具体内容可以参考utils文件
    rules: utils.styleLoaders({sourceMap: config.dev.cssSourceMap, usePostCSS: true})
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    //重新加载server时，控制台对一些错误以warning的方式提示
    clientLogLevel: 'warning',
    //当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html
    historyApiFallback: {
      rewrites: [
        {from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html')},
      ],
    },
    //启用 webpack 的模块热替换特性
    hot: true,
    //告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要,这里我们禁用
    contentBase: false, // since we use CopyWebpackPlugin.
    //是否压缩
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    //是否自动打开浏览器
    open: config.dev.autoOpenBrowser,
    //编译出错时是否有提示
    overlay: config.dev.errorOverlay
      ? {warnings: false, errors: true}
      : false,
    //静态内容的路径,此路径下的打包文件可在浏览器中访问
    publicPath: config.dev.assetsPublicPath,
    //接口的代理
    proxy: config.dev.proxyTable,
    //启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见。
    quiet: true, // necessary for FriendlyErrorsPlugin
    //监视文件的选项
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    //DefinePlugin 允许创建一个在编译时可以配置的全局常量。这里生成了一个当前环境的常量
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    //模块热替换插件，修改模块时不需要刷新页面
    new webpack.HotModuleReplacementPlugin(),
    //当开启 HMR 的时候使用该插件会显示模块的相对路径
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    //在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误。
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      //打包后js文件放在body的最后
      inject: true
    }),
    // copy custom static assets
    //将static的内容拷贝到开发路径，忽略这个文件夹下“.XX”的文件
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
          ? utils.createNotifierCallback()
          : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})

//注释参考出处：https://www.cnblogs.com/caideyipi/p/8442932.html
