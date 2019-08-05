import * as imports from './imports.js';

function main(wasm) {
    wasm.exports.exported_func();
}

WebAssembly.instantiateStreaming(fetch("test.wasm"), {imports: imports})
.then(result => {
  main(result.instance);
})
