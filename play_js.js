function main() {
    const count = 100;
    const bit = 2000;

    const operator = generate_rotate(0, bit, 1/4*Math.PI);
    console.log(operator);
    performance.mark('myPerformanceStart');

    let start_vec = [];
    for (let i = 0; i < bit; i++) {
        start_vec.push([1/Math.sqrt(2), 0.00000000000000001]);
        start_vec.push([1/Math.sqrt(2), 0.00000000000000001]);
    }
    let x_vec = start_vec;
    for (let j = 0; j < count; j++) {
        x_vec = proceed_operator(operator, x_vec);
    }
    console.log(x_vec);

    performance.mark('myPerformanceEnd');
    performance.measure(
            'myPerformance', // 計測名
            'myPerformanceStart', // 計測開始点
            'myPerformanceEnd' // 計測終了点
    );
    const results = performance.getEntriesByName('myPerformance');
    console.log(results[0]);
}

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

function proceed_operator(a, x) {
    let return_vec = [];
    for (let i = 0; i < x.length; i++) {
        let row = [0, 0];
        for (let j = 0; j < x.length; j++) {
            let element = mul_complex(a[i][j], x[j]);
            row[0] += element[0];
            row[1] += element[1];
        }
        return_vec.push(row);
    }
    return return_vec;
}

function mul_complex(x, y) {
    return [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + y[0] * x[1]];
}

main()
