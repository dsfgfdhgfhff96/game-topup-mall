// Node 18 缺少全局 File 对象，alipay-sdk 依赖它
// Node 20+ 已原生支持，此 polyfill 仅用于 Node 18
if (typeof globalThis.File === 'undefined') {
  const { Blob } = require('node:buffer')
  globalThis.File = class File extends Blob {
    #name
    #lastModified
    constructor(bits, name, options = {}) {
      super(bits, options)
      this.#name = name
      this.#lastModified = options.lastModified || Date.now()
    }
    get name() { return this.#name }
    get lastModified() { return this.#lastModified }
  }
}
