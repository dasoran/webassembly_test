# webassembly_test

WebAssemblyの検証をするリポジトリ

## buildツール
https://github.com/WebAssembly/wabt

インストールはみてがんばって。README通りcmakeでやった。

## 実行

```
$ python server.py
```

localhost:8000

にリクエストを投げればだいたい動く

- play.html
- test.html
- play_js.html

この3つは独立したコード。


# 実験結果

## 概要
- `play_js.html`と`play.html`の比較実験
  - 4000次元のベクトルに正方行列(1/4piの回転)を100回作用させる計算
  - `play_js.html`: JavaScriptだけで計算
  - `play.html`: 計算部分をWebAssemblyで計算
- 計算結果
  - JS: 10.7s
  - WebAssembly: 3.4s
- 結論
  - WebAssemblyで処理すると3倍程度高速化が見込める

## WebAssemblyを採用するにあたって
- データの渡し方が特殊なので、その点を考慮する必要がある
  - 以下のように、特定のデータ(メモリ空間)に直でデータを流し込む必要がある
  - 引数では単一の数字しか渡せない
  - https://github.com/dasoran/webassembly_test/blob/7bfebb1713c1d1ca6949326b49aec667f0c659c4/play.js
```
    let fMemory = new Float64Array(memory.buffer);

    let o_mat = bit * 2 * 2;
    let o_ret = bit * 2;

    for (let i = 0; i < bit; i++) {
        fMemory[o_ret + i * 4]      = 0.00000000000000001;
        fMemory[o_ret + i * 4 + 1]  = 0.00000000000000001;
        fMemory[o_ret + i * 4 + 2]  = 0.00000000000000001;
        fMemory[o_ret + i * 4 + 3]  = 0.00000000000000001;
    }
```
- 詳細は以下に記述するものの、現状性能を出すためにはボトルネックを把握して性能が出る記述方法を行う必要がある
- 適切に使えば十分高速化が見込める技術と言える

## WebAssemblyについて
### 構造
- 基本的にはただのVM
  - それもJVM的なものではなく、CPUに近いVM
- メモリ空間に該当するものは1つだけ渡すことができる
  - 生アセンブリで描く場合、リソースの管理は全部自分でする必要がある
- CPUと異なり、ローカル変数のスタックは任意に管理することができず、単一要素の変数しか宣言できない
  - ローカル変数としてArrayを持つことができない
  - そういった可変サイズのリソースはメモリ空間に配置する必要がある
- サブルーチンコール時は暗黙的なアドレス専用のスタックを使用している様子
  - このスタックにコードからアクセスする方法はない
### 速度の観点から現状の実装について
- CPUといくつか異なる挙動をする
  - JMPについてはコストがほとんどかからない
  - メモリアクセスは多少遅い
  - サブルーチンのコールが劇的に遅い
    - 暗黙的なスタックが遅い様子
  - CPUと同じように分岐予測等のパイプラインストールを念頭にコーディングするのとは違う前提で実装する必要がある
- サブルーチンコールについて
  - サブルーチンコールを削減した実装: https://github.com/dasoran/webassembly_test/blob/9d3ce53ef3f4f538568cf3c00425affdc6c2b13b/main.wat
  - サブルーチンコールを残した実装: https://github.com/dasoran/webassembly_test/blob/e04a574ef3007fef9e178df4765dc997d9f7d684/main.wat
  - 計算処理のループ回数: 4000回(1回の計算) * 100回 = 400000ループ
  - 実装間のサブルーチンコール数
    - 削減済み: 0
    - 未削減: 4回(1ループ) * 400000ループ = 1600000回
  - 実行時間
    - 削減済み: 3.4s
    - 未削減: 13.6s
  - 参考: ループ比較
    - 計算せずループのみ: 0.9s
      - 比較のためのループのみのコストの計測
      - https://github.com/dasoran/webassembly_test/blob/3d7da18ecfc4900135f7c8a29e250028501d3d74/only_loop_sample.wat
    - 計算せずループ中4回jmp: 5.0s
      - callとjmpの実行コストが異なることを確認するための空loop*4
      - https://github.com/dasoran/webassembly_test/blob/3d7da18ecfc4900135f7c8a29e250028501d3d74/loop_sample.wat
    - 計算せずループ中4回call: 10.7s
      - 空call*4
      - https://github.com/dasoran/webassembly_test/blob/3d7da18ecfc4900135f7c8a29e250028501d3d74/call_sample.wat
  - 参考: メモリアクセスコストの検証
    - 計算せずループのみ: 0.9s
    - 計算せずループ中4回メモリアクセス: 1.5s
      - 厳密にはアクセスしてローカル変数に保存
      - https://github.com/dasoran/webassembly_test/blob/3d7da18ecfc4900135f7c8a29e250028501d3d74/load_j_sample.wat
      - https://github.com/dasoran/webassembly_test/blob/3d7da18ecfc4900135f7c8a29e250028501d3d74/load_same_sample.wat
