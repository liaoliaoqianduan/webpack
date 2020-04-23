const path = require('path');

const fs = require('fs');

const ejs = require('ejs');

// babylon 主要把源码转换成ast

const babylon = require('babylon');

// @babel/traverse
// @babel/traverse 可以用来遍历更新@babel/parser生成的AST
// 对语法树中特定的节点进行操作(特殊节点的函数)
// 进入节点（enter）
// 退出节点  (exit)
const traverse = require('@babel/traverse').default;

// @babel/types判断 AST 节点类型与构造新的节点

// const t = require('@babel/types');

// @babel/generator根据 AST 与相关选项重新构建代码

const generator = require('@babel/generator').default;

class Pack {

    constructor(config) {

        this.config = config;

        // 需要保存所有模块的依赖

        this.modules = {};

        // 入口路径

        this.entry = config.entry;

    }

    run() {

        // 执行并且创建模块的依赖关系
        this.buildModule(this.entry);

        // 输出一个打包后的文件

        this.output()

    }

    /**

    * 构建模块

    */

    buildModule(modulePath) {

        // 拿到模块的内容

        const source = fs.readFileSync(modulePath,'utf8');
        // 解析，需要把source源码进行改造，返回一个依赖列表
        const { sourceCode, dependencies } = this.parse(source, path.dirname(modulePath));
        this.modules[modulePath] = sourceCode;

        // 把相对路径和模块中的内容 对应起来
        dependencies.forEach(dep => {
            // 附模块的递归加载
            this.buildModule(dep, false);
        });

    }

    /**

    * 解析文件

    */

    parse(source, parentPath){
        // AST 解析语法树

        const ast = babylon.parse(source);

        const dependencies = [];
        fs.writeFileSync('./test.txt', JSON.stringify(ast));
       
        traverse(ast, {

            CallExpression(p) {

                // 对应的节点
                

                const {node} = p;
                if (node.callee.name === 'require') {

                    node.callee.name = '__webpack_require__';

                    // 模块的引用名字:比如是"b.js"这种
                    let moduleName = node.arguments[0].value;
                    //模块名字改成相对路径：比如是:'./src/b.js'
                    moduleName = './' + path.join(parentPath, moduleName);
                    //存储模块路径
                    dependencies.push(moduleName);
                    //更改ast中节点的值，node.arguments本来是[ { type: 'StringLiteral', value: 'a.js' } ]，改为[ { type: 'StringLiteral', value: './src/b.js' } ],这样在后面转换成源码的时候才会转换成相对路径a的源码：__webpack_require__("./src\\b.js");，而不是__webpack_require__('b.js');
                    node.arguments[0].value=moduleName
                }

            }

        });
        //获取源码
        // a的源码：__webpack_require__("./src\\b.js");

        // __webpack_require__("./src\\c.js");
        
        // const el = document.getElementById('a');
        // el.innerHTML = 'this is a module111';

        // b的源码：const el = document.getElementById('b');
        // el.innerHTML = 'this is b module';

        // c的源码：const el = document.getElementById('c');
        // el.innerHTML = 'this is c module';

        const sourceCode = generator(ast).code;
        return {
            sourceCode,
            dependencies
        }
    }

    /**
    * 输出文件
    */
    output() {
        // 拿到输出的目录
        const outPath = path.join(this.config.output.path, this.config.output.filename);
        //读取ejs模板文件
        const templatStr = fs.readFileSync(path.join(__dirname, 'main.ejs'),'utf8');
        //把解析出的模块代码渲染到模板文件里面去
        const bundle = ejs.render(templatStr, { entry: this.entry, modules: this.modules })
        // 输出bundle文件
        fs.writeFileSync(outPath, bundle);
    }
}
module.exports = Pack