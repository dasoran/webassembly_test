function main(wasm) {
    const result = wasm.exports.addTwo(1, 20);

    console.log(result);
}

WebAssembly.instantiateStreaming(fetch("main.wasm"), {})
.then(result => {
  main(result.instance);
})

//fetch("main.wasm").then(reponse =>
//    reponse.arrayBuffer()
//).then(bytes =>
//    WebAssembly.instantiate(bytes, {})
//).then(result =>
//    result.instance
//).then(main);
