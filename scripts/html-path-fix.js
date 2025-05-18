// This plugin adds the path-fix.js and vercel-path-fix.js scripts to the HTML
const HtmlWebpackPlugin = require('html-webpack-plugin');

class HtmlPathFixPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlPathFixPlugin', (compilation) => {
      // HtmlWebpackPlugin 4.x API
      const hooks = HtmlWebpackPlugin.getHooks(compilation);
      
      hooks.beforeEmit.tapAsync('HtmlPathFixPlugin', (data, cb) => {
        // Scripts to be added to head
        const pathFixScripts = `
    <!-- Path fix scripts for deployment - must be loaded first -->
    <script src="/path-fix.js"></script>
    <script src="/vercel-path-fix.js"></script>
`;
        
        // Add scripts right after the head opening tag
        data.html = data.html.replace('<head>', '<head>' + pathFixScripts);
        
        cb(null, data);
      });
    });
  }
}

module.exports = HtmlPathFixPlugin;
