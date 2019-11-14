function main(wasm) {
    const count = 100;
    const bit = 2000;

    const operator = generate_rotate(0, bit, 1/4*Math.PI);
    let fMemory = new Float64Array(memory.buffer);

    let o_mat = bit * 2 * 2;
    let o_ret = bit * 2;

    for (let i = 0; i < bit; i++) {
        fMemory[o_ret + i * 4]      = 0.00000000000000001;
        fMemory[o_ret + i * 4 + 1]  = 0.00000000000000001;
        fMemory[o_ret + i * 4 + 2]  = 0.00000000000000001;
        fMemory[o_ret + i * 4 + 3]  = 0.00000000000000001;
    }

    for (let i = 0; i < bit * 2; i++) {
        for (let j = 0; j < bit * 2; j++) {
            fMemory[o_mat + i * bit * 2 + j * 2] = operator[i][j][0]
            fMemory[o_mat + i * bit * 2 + j * 2 + 1] = operator[i][j][1]
        }
    }

    performance.mark('myPerformanceStart');

    let o_vec = 0;
    for (let i = 0; i < bit; i++) {
        fMemory[o_vec + i * 4]      = 1/Math.sqrt(2);
        fMemory[o_vec + i * 4 + 1]  = 0.00000000000000001;
        fMemory[o_vec + i * 4 + 2]  = 1/Math.sqrt(2);
        fMemory[o_vec + i * 4 + 3]  = 0.00000000000000001;
    }

    console.log(fMemory[0]);
    console.log(fMemory[1]);
    console.log(fMemory[2]);
    console.log(fMemory[3]);
    for (let i = 0; i < count; i++) {
        wasm.exports.proceedOperator(o_vec, o_mat, o_ret, bit * 2);
    }
    console.log(fMemory[0]);
    console.log(fMemory[1]);
    console.log(fMemory[2]);
    console.log(fMemory[3]);

    performance.mark('myPerformanceEnd');
    performance.measure(
            'myPerformance', // 計測名
            'myPerformanceStart', // 計測開始点
            'myPerformanceEnd' // 計測終了点
    );
    const results = performance.getEntriesByName('myPerformance');
    console.log(results[0]);
}

let memory = new WebAssembly.Memory({initial:5000, maximum:5000});

WebAssembly.instantiateStreaming(fetch("main.wasm"), {js: { mem: memory }})
.then(result => {
  main(result.instance);
})


function generate_rotate(offset_bit, bit, rad) {
    let operator = [];
    for (let i = 0; i < bit * 2; i++) {
        let row = [];
        if (i == 0 + offset_bit) {
            for (let j = 0; j < bit * 2; j++) {
                if (j == 0) {
                    row.push([Math.cos(rad), 0.00000000000000001]);
                } else if (j == 1) {
                    row.push([-Math.sin(rad), 0.00000000000000001]);
                } else {
                    row.push([0.00000000000000001, 0.00000000000000001]);
                }
            }
        } else if (i == 1 + offset_bit) {
            for (let j = 0; j < bit * 2; j++) {
                if (j == 0) {
                    row.push([Math.sin(rad), 0.00000000000000001]);
                } else if (j == 1) {
                    row.push([Math.cos(rad), 0.00000000000000001]);
                } else {
                    row.push([0.00000000000000001, 0.00000000000000001]);
                }
            }
        } else {
            for (let j = 0; j < bit * 2; j++) {
                if (j == i) {
                    row.push([1, 0.00000000000000001]);
                } else {
                    row.push([0.00000000000000001, 0.00000000000000001]);
                }
            }
        }
        operator.push(row);
    }
    return operator;
}


//fetch("main.wasm").then(reponse =>
//    reponse.arrayBuffer()
//).then(bytes =>
//    WebAssembly.instantiate(bytes, {})
//).then(result =>
//    result.instance
//).then(main);
