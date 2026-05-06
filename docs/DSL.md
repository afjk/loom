# Loom DSL 仕様書

## 概要

Loom DSL は JSON グラフをより簡潔に記述するためのテキスト形式です。各「代入文」が Loom のノードに対応し、識別子参照がエッジに、リテラル値がパラメータに変換されます。

DSL → JSON グラフへの片方向変換のみサポートします（JSON → DSL は今後の予定）。

```
# DSL
t = clock()
wave = sine(t, freq: 0.3)

# 等価な JSON
{
  "nodes": [
    { "id": "t", "type": "clock" },
    { "id": "wave", "type": "sine", "params": { "freq": 0.3 } }
  ],
  "edges": [
    { "from": "t.t", "to": "wave.t" }
  ]
}
```

---

## 構文

### コメント

`#` から行末まで。行の途中にも書けます。

```
# これはコメント
t = clock()  # 時間ソース
```

### import 文

Loom DSL はトップレベルの `import` 文をサポートします。

```text
import math
import fs
import scene
```

現時点の `import` は主に metadata / target validation 用です。
`text`, `json`, `console` など一部の標準ライブラリノードは実行できますが、
`import` による動的 module loading や node registry の厳密な import-driven 切り替えはまだ行いません。

`import` は、代入文や `render` 文より前に書く必要があります。

```text
import math

t = clock()
x = sine(t, freq: 0.5)
```

以下はエラーです。

```text
t = clock()
import math
```

library name は単純な識別子のみ対応します。

```text
import math
```

以下は未対応です。

```text
import math.extra
import { sine } from math
from math import sine
import math as m
```

### Qualified function calls

Loom DSL は `library.nodeName` 形式の qualified function call をサポートします。

```loom
import text

message = text.upper("hello")
```

- qualified function call は `library.nodeName`
- import 名そのものは引き続き単純な識別子だけをサポートします
- dotted import name は未対応です

`text.upper`, `json.parse`, `console.log` などの一部の qualified function は標準ライブラリノードとして実行できます。

### Effect statements

トップレベルの関数呼び出しを、代入なしで effect statement として書けます。

```loom
import console

message = constant(value: "hello")
console.log(message)
```

- effect statement は generated effect node に compile されます
- 現時点では `console.log` などの output/effect node 用です

### 代入文

```
識別子 = 式
```

左辺の識別子がノード ID になります。式は関数呼び出しまたはパイプ式です。

```
timer = clock()
wave = sine(timer, freq: 0.5)
```

### 数値・文字列・真偽値リテラル

| 種類 | 例 |
|------|-----|
| 数値 | `0.3`, `-1`, `100`, `4.5e-2` |
| 文字列 | `"#00ff00"`, `"running"` |
| 真偽値 | `true`, `false` |

リテラルは関数引数として使われ、対応するノードの `params` に格納されます。

### 識別子

英字または `_` で始まり、英数字・`_` が続きます。

```
t, wave, mapX, slow_sine
```

式の中で識別子を参照すると、そのノードのデフォルト出力ポートからのエッジが自動生成されます。

### 関数呼び出しと引数

```
関数名(引数リスト)
```

引数には **位置引数** と **名前付き引数** があります。

```
sine(t, freq: 0.3)        # t は位置引数、freq: 0.3 は名前付き引数
clock()                    # 引数なし
map(t, inMin: 0, inMax: 10, outMin: 100, outMax: 700)
```

### パイプ演算子

`式 |> 関数呼び出し` で、左辺の式が右辺関数の第1引数として渡されます。

```
t |> sine(freq: 0.3)
# 等価: sine(t, freq: 0.3)
```

チェーン可能です：

```
t |> sine(freq: 0.3) |> map(inMin: -1, inMax: 1, outMin: 100, outMax: 700)
```

### render 文

トップレベルに1つだけ書ける特殊な文です。エディタのキャンバス描画を設定します。

```
render point(x: mapX, y: mapY, color: "#00ff00", trail: 0.05)
render bar(width: widthMap, color: "#00ccff", height: 40)
```

`point` と `bar` は Loom ノードではなく、エディタの描画設定に変換されます。

### 改行と継続

通常、改行は文の終わりです。以下の場合は継続とみなされます：

1. **括弧内**: `(` が閉じていない間、改行は無視されます
2. **パイプ継続**: 次の行が `|>` で始まる場合（直前の行との間に空行がない場合）

```
# 括弧内の複数行
result = map(
  t,
  inMin: 0,
  inMax: 10,
  outMin: 100,
  outMax: 700
)

# パイプ継続
width = t
  |> mod(b: 4)
  |> smoothstep(edge0: 1, edge1: 3)
  |> map(inMin: 0, inMax: 1, outMin: 100, outMax: 700)
```

**注意**: 空行が入るとパイプチェーンは終わります。空行の後に `|>` が来た場合は構文エラーになります。

---

## 引数のルール

### デフォルトルール（全ノード共通）

- 第1引数: 位置引数でも名前付き引数でも可
- 第2引数以降: **名前付き必須**

```
sine(t, freq: 0.3)          # OK
sine(t: t, freq: 0.3)       # OK（全部名前付き）
sine(t, 0.3)                # エラー（freq に名前が必要）
```

### 可換ノード（add, multiply）

全引数を位置引数で書けます。ただし **混在禁止**（全部位置引数か全部名前付き引数のどちらか）。

```
add(a, b)                   # OK（全部位置引数）
add(a: x, b: y)             # OK（全部名前付き）
add(a, b: y)                # エラー（混在禁止）
```

### 非可換ノード（subtract, divide, mod など）

デフォルトルール通り。第1引数のみ位置引数で書けます。

```
subtract(x, b: y)           # OK（第1引数のみ位置）
subtract(a: x, b: y)        # OK（全部名前付き）
subtract(x, y)              # エラー（b に名前が必要）
```

### パイプ演算子と引数ルールの関係

パイプ `|>` は第1引数を提供するため、呼び出し側の引数は第2引数以降になります。

```
x |> sine(freq: 0.3)        # OK（x は |> で第1引数, freq が第2引数）
x |> add(y)                 # OK（add は可換、x と y は両方位置引数）
```

---

## ノードのデフォルト出力ポート

識別子を参照する際、自動的に「デフォルト出力ポート」が選択されます。

| ノード型 | デフォルト出力ポート |
|----------|---------------------|
| `clock` | `t` |
| `pointerPosition` | `pos` |
| その他（変換 / 状態 / シンク系を含む） | `out` |

例：

```
t = clock()
wave = sine(t, freq: 0.3)
# t は clock の出力 → t.t として解決
# wave は sine の出力 → wave.out として解決
```

state ノードも同じルールで扱えます。

```
t = clock()
wave = sine(t, freq: 0.3)
smooth = smoothLerp(wave, rate: 5, initial: 0)
```

---

## エラー

パースエラーは `LoomDSLError` としてスローされます。

| プロパティ | 説明 |
|-----------|------|
| `message` | エラーメッセージ |
| `line` | 行番号（1始まり）|
| `column` | 列番号（1始まり）|
| `code` | エラー種別 |

### エラーコード一覧

| コード | 説明 |
|--------|------|
| `UNEXPECTED_TOKEN` | 予期しないトークン |
| `UNKNOWN_NODE_TYPE` | 未知のノード型 |
| `MISSING_ARGUMENT_NAME` | 引数名が必要 |
| `UNDEFINED_IDENTIFIER` | 未定義の識別子 |
| `IMPORT_MUST_BE_TOP_LEVEL` | `import` 文が代入文または `render` 文の後に書かれている |
| `UNKNOWN_IMPORT` | 未知の import library |
| `UNSUPPORTED_IMPORT` | 指定 runtime target で利用できない import library |
| `UNKNOWN_RUNTIME_TARGET` | 未知の runtime target |

---

## 例

### リサジュー曲線

```
timer = clock()
sineX = sine(timer, freq: 0.3)
cosineY = cosine(timer, freq: 0.5)
mapX = map(sineX, inMin: -1, inMax: 1, outMin: 100, outMax: 700)
mapY = map(cosineY, inMin: -1, inMax: 1, outMin: 50, outMax: 450)

render point(x: mapX, y: mapY, color: "#00ff00", trail: 0.05)
```

### 円運動

```
timer = clock()
x = sine(timer, freq: 0.5)
y = cosine(timer, freq: 0.5)
mapX = map(x, inMin: -1, inMax: 1, outMin: 100, outMax: 700)
mapY = map(y, inMin: -1, inMax: 1, outMin: 50, outMax: 450)

render point(x: mapX, y: mapY, color: "#ff00ff", trail: 0.05)
```

### 範囲リマップ（clamp-map）

```
timer = clock()
freqMap = map(timer, inMin: 0, inMax: 30, outMin: 0.1, outMax: 5, clamp: true)
wave = sine(timer, freq: freqMap)
widthMap = map(wave, inMin: -1, inMax: 1, outMin: 50, outMax: 750)

render bar(width: widthMap, color: "#00ccff", height: 40)
```

### 時間ベースの平滑化

```
t = clock()
wave = sine(t, freq: 0.3)
smooth = smoothLerp(wave, rate: 5, initial: 0)
widthMap = map(smooth, inMin: -1, inMax: 1, outMin: 50, outMax: 600)

render bar(width: widthMap, color: "#80ed99", height: 48)
```

### smoothstep フェード

```
timer = clock()
mod = mod(timer, b: 4)
smooth = smoothstep(mod, edge0: 1, edge1: 3)
widthMap = map(smooth, inMin: 0, inMax: 1, outMin: 50, outMax: 600)

render bar(width: widthMap, color: "#ffaa00", height: 60)
```

### lerp 行き来（ピンポン）

```
timer = clock()
sine = sine(timer, freq: 0.3, amplitude: 0.5, offset: 0.5)
lerp = lerp(a: 100, b: 700, t: sine)

render point(x: lerp, y: 250, color: "#ff6688", trail: 0.1)
```

## State nodes (explicit temporal state)

### smoothLerp — 目標値への滑らかな追従

state ノード。graph JSON には現れない runtime state(prevOut)を持ち、`engine.load()` で同じ id ならその state を引き継ぐ。

```js
const graph = {
  nodes: [
    { id: "target", type: "constant", params: { value: 100 } },
    { id: "follow", type: "smoothLerp", params: { rate: 5, initial: 0 } }
  ],
  edges: [
    { from: "target.out", to: "follow.value" }
  ]
};
```

### lowpass — 時定数 tau による平滑化

state ノード。graph JSON には現れない runtime state(prevOut)を持ち、ノイズの多い入力(マウス座標など)を滑らかにする用途。

```js
const graph = {
  nodes: [
    { id: "raw", type: "pointerPosition", params: { axis: "x" } },
    { id: "smooth", type: "lowpass", params: { tau: 0.1, initial: 0 } }
  ],
  edges: [
    { from: "raw.out", to: "smooth.value" }
  ]
};
```

### integrate — 時間積分(チャージゲージ等)

state ノード。graph JSON には現れない runtime state(prevOut)を持ち、`min` / `max` でクランプ可能。

```js
const graph = {
  nodes: [
    { id: "key", type: "keyDown", params: { key: " " } },
    { id: "rate", type: "constant", params: { value: 1 } },
    { id: "charge", type: "integrate", params: { min: 0, max: 1, initial: 0 } }
  ],
  edges: [
    { from: "rate.out", to: "charge.value" }
  ]
};
```

※ `delay1` は `out = prevOut` を返し、現在の入力を次フレームに渡す state ノードです。

## Scene library (scene objects control)

Loom includes early Scene Sync-oriented scene effect nodes. These nodes describe operations on 3D scene objects.

### scene.setPosition — オブジェクトの位置を設定

```loom
import scene

scene.setPosition("sample-cube", x: 1, y: 0.5, z: 0)
```

オブジェクト ID とワールド座標 (x, y, z) を指定します。

### scene.setRotation — オブジェクトの回転を設定

```loom
import scene

scene.setRotation("sample-cube", x: 0, y: 0, z: 0, w: 1)
```

オブジェクト ID とクォータニオン (x, y, z, w) を指定します。w はスカラー成分（デフォルト 1）。

### scene.setScale — オブジェクトのスケールを設定

```loom
import scene

scene.setScale("sample-cube", x: 2, y: 2, z: 2)
```

オブジェクト ID と均一なスケール (x, y, z) を指定します。

### まとめた例

```loom
import scene

scene.setPosition("sample-cube", x: 1, y: 0.5, z: 0)
scene.setRotation("sample-cube", x: 0, y: 0, z: 0, w: 1)
scene.setScale("sample-cube", x: 2, y: 2, z: 2)
```

現在の段階では、これらのノードは local effect records を生成します。実際の Scene Sync への送信は今後の PR で実装予定です。

## Programmatic API

Loom は DSL を Source AST 経由で扱う関数を公開している。AI 補助編集・DSL formatter・ビジュアルエディタの基盤として使う。

### 例: DSL を解析して整形する

```js
import { parseDSLToAST, formatDSL } from "loom";

const source = `t = clock()\nwave = sine(t, freq: 0.3)`;

const { ast, errors } = parseDSLToAST(source);
if (errors.length) console.error(errors);

const formatted = formatDSL(ast);
```

### 例: DSL を graph JSON に変換する(2 段階)

```js
import { parseDSLToAST, compileToGraph } from "loom";

const { ast } = parseDSLToAST(source);
const { graph, errors } = compileToGraph(ast);
```
