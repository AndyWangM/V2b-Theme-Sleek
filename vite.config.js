import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path';
import { visualizer } from "rollup-plugin-visualizer";  
import { terser } from 'rollup-plugin-terser'; // 导入 terser 插件
import imagemin from 'vite-plugin-imagemin';
import htmlMinifier from 'vite-plugin-html-minifier';
import cssnano from 'cssnano';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    visualizer({ open: true }),
    imagemin({
      exclude: ['**/*.svg'],
      gifsicle: { interlaced: true },
      mozjpeg: { quality: 50, progressive: true },
      optipng: { optimizationLevel: 7 },
      svgo: false
    }),
    cssnano({
      preset: 'default', // 使用默认的压缩选项
    }),
    htmlMinifier({
      collapseWhitespace: true, // 去除空格
      removeComments: true, // 去除注释
      minifyCSS: true, // 压缩内联的 CSS
      minifyJS: true, // 压缩内联的 JavaScript
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: "0.0.0.0",
    port: "5175"
  },
  base: './',
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        toplevel: true,  // 混淆顶级作用域的变量名
        keep_classnames: false, // 移除未被引用的类名
        keep_fnames: false, // 移除未被引用的函数名
        reserved: ['a', 'b', 'c'] // 保留特定变量名不被混淆
      },
      compress: {
        sequences: true,  // 合并连续的简单语句
        dead_code: true,  // 移除未被引用的代码
        conditionals: true,  // 将 if 语句转换为条件表达式
        booleans: true,  // 优化布尔表达式
        loops: true,  // 优化循环
        unused: true,  // 移除未被引用的变量和函数
        drop_console: true,  // 移除 console.log
        drop_debugger: true,  // 移除 debugger
        reduce_vars: true,  // 优化变量
        pure_funcs: ['console.log']  // 用于标记纯函数，这些函数的调用结果可以被静态预测，进一步优化代码
      },
      compress: {
        //生产环境时移除console
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false, // 去除注释
      }
    },
    //   关闭文件计算
    reportCompressedSize: false,
    //   关闭生成map文件 可以达到缩小打包体积
    sourcemap: false, // 这个生产环境一定要关闭，不然打包的产物会很大
    assetsInlineLimit: 0,
    // rollup 配置
    rollupOptions: {
      plugins: [
        {
          name: 'separate-css',
          async generateBundle(options, bundle) {
            const cssBundle = Object.keys(bundle).filter((file) => file.endsWith('.css'));
            for (const fileName of cssBundle) {
              const source = bundle[fileName].source;
              await this.emitFile({
                type: 'asset',
                fileName: path.join(fileName),
                source
              });
              delete bundle[fileName]; // 删除原始的 CSS 文件
            }
          }
        },
        // terser()
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
        chunkFileNames: 'js/[hash].js',  // 引入文件名的名称
        entryFileNames: 'js/[hash].js',  // 包的入口文件名称
        assetFileNames: 'assets/[ext]/[hash].[ext]', // 资源文件像 字体，图片等
      }
    }
  }
})
