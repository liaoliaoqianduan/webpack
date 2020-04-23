const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
class Pack {
    constructor(config) {
        this.config = config;
        this.modules = {};
        this.entry = config.entry;
    }
    run() {
        this.buildModule(this.entry);
        this.output()
    }
    buildModule(modulePath, isEntry) {
        const source = fs.readFileSync(modulePath,'utf8');
        const { sourceCode, dependencies } = this.parse(source, path.dirname(modulePath));
        this.modules[modulePath] = sourceCode;
        dependencies.forEach(dep => {
            this.buildModule(dep, false);
        });
    }
    parse(source, parentPath){
        const ast = babylon.parse(source);
        const dependencies = [];
        traverse(ast, {
            CallExpression(p) {
                const {node} = p;
                if (node.callee.name === 'require') {
                    node.callee.name = '__webpack_require__';
                    let moduleName = node.arguments[0].value;
                    moduleName = './' + path.join(parentPath, moduleName);
                    dependencies.push(moduleName);
                    node.arguments[0].value=moduleName
                }
            }
        });
        const sourceCode = generator(ast).code;
        return {
            sourceCode,
            dependencies
        }
    }
    output() {
        const outPath = path.join(this.config.output.path, this.config.output.filename);
        const templatStr = fs.readFileSync(path.join(__dirname, 'main.ejs'),'utf8');
        const bundle = ejs.render(templatStr, { entry: entry, modules: this.modules })
        fs.writeFileSync(outPath, bundle);
    }
}
module.exports = Pack