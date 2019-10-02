function main() {
    const count = 100;
    const bit = 10;

    const operator_x = generate_X(bit);
    console.log(operator_x);
    performance.mark('myPerformanceStart');
    for (let j = 0; j < count; j++) {
        let start_vec = [];
        for (let i = 0; i < bit; i++) {
            start_vec.push([1, 0]);
            start_vec.push([0, 0]);
        }
        // console.log(start_vec);
        let x_vec = proceed_operator(operator_x, start_vec);
        // console.log(x_vec);
    }
    performance.mark('myPerformanceEnd');
    performance.measure(
            'myPerformance', // 計測名
            'myPerformanceStart', // 計測開始点
            'myPerformanceEnd' // 計測終了点
    );
    const results = performance.getEntriesByName('myPerformance');
    console.log(results[0]);
}

function generate_X(bit) {
    let operator = [];
    for (let i = 0; i < bit * 2; i++) {
        let row = [];
        if (i == 0) {
            for (let j = 0; j < bit * 2; j++) {
                if (j == 1) {
                    row.push([1, 0]);
                } else {
                    row.push([0, 0]);
                }
            }
        } else if (i == 1) {
            for (let j = 0; j < bit * 2; j++) {
                if (j == 0) {
                    row.push([1, 0]);
                } else {
                    row.push([0, 0]);
                }
            }
        } else {
            for (let j = 0; j < bit * 2; j++) {
                if (j == i) {
                    row.push([1, 0]);
                } else {
                    row.push([0, 0]);
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
