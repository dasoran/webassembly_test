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
  - サブルーチンコールを削減した実装: https://github.com/qramana/webassembly_test/blob/9d3ce53ef3f4f538568cf3c00425affdc6c2b13b/main.wat
  - サブルーチンコールを残した実装: https://github.com/qramana/webassembly_test/blob/c967ccc3ffde15739bf87035bd6c1d1fe57caa12/main.wat
  - 計算処理のループ回数: 4000回(1回の計算) * 100回 = 400000ループ
  - 実装間のサブルーチンコール数
    - 削減済み: 0
    - 未削減: 4回(1ループ) * 400000ループ = 1600000回
  - 実行時間
    - 削減済み: 3.4s
    - 未削減: 13.6s
