
//在这个文件目录下install 'loader-utils',不是在example目录下install，否则会找不到
const loaderUtils = require('loader-utils')

module.exports = function(source){
	//this 是compiler对象
	const options = loaderUtils.getOptions(this)
	this.cacheable(options.cache)
	let script = `
		let style = document.createElement("style");
		style.innerText = ${JSON.stringify(source)};
		document.head.appendChild(style);
`
	return script
}