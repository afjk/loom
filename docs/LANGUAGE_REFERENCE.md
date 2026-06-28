# Loomlet 言語リファレンス

このドキュメントは「`.loom` をどう書くか」に絞った構文リファレンスです。

- 対象読者: Loomlet のサンプルを書く人、Node Editor で DSL を編集する人、AI に Loomlet を書かせたい人
- 扱うもの: `.loom` の構文（文・式・関数呼び出し・import・代入・pipe・関数定義・sink 呼び出し・エラー）
- 扱わないもの: Loomlet の思想、Graph / Environment / Runtime の設計、決定論の詳細、Scene Sync の同期モデル

思想・意味論・標準ライブラリの一覧は別ドキュメントに分かれています（[関連ドキュメント](#関連ドキュメント)）。

構文は安定度で 3 段階に分けて記載します。

- **安定**: 仕様として依存してよい構文
- **実験的 (v0)**: 使えるが制約が多く、今後変わる可能性がある構文
- **まだ対応していない**: 将来構想・現時点では書けない構文

---

## このリファレンスについて

Loomlet DSL は JSON グラフをより簡潔に記述するためのテキスト形式です。各「代入文」が Loomlet のノードに対応し、識別子参照がエッジに、リテラル値がパラメータに変換されます。

現状は DSL → JSON グラフへの片方向変換のみサポートします（JSON → DSL は今後の予定）。

```loom
# DSL
t = clock()
wave = sine(t, freq: 0.3)
```

```json
// 等価な JSON グラフ
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

## ファイル形式

- `.loom` 拡張子のテキストファイル
- UTF-8
- 原則 1 行 1 文
- 空行は無視されます
- `#` コメントが書けます

---

# 安定した構文

## コメント

`#` から行末まで。行の途中にも書けます。

```loom
# これはコメント
t = clock()  # 時間ソース
```

## import 文

トップレベルの `import` 文をサポートします。

```loom
import math
import scene
import logic
```

`import` は、代入文や `render` などの他の文より **前** に書く必要があります。

```loom
import math

t = clock()
x = sine(t, freq: 0.5)
```

以下はエラーです（`Import statements must appear before other statements` / `IMPORT_MUST_BE_TOP_LEVEL`）。

```loom
t = clock()
import math
```

library name は単純な識別子のみ対応します。`import math.extra` や `import { sine } from math`、`import math as m` などは未対応です（[まだ対応していない構文](#まだ対応していない構文)）。

> 現時点の `import` は主に metadata / target validation 用です。`text`・`json`・`console`・`scene` など一部の標準ライブラリノードは実行できますが、`import` による動的 module loading はまだ行いません。

## 修飾付き関数呼び出し（qualified call）

`library.nodeName` 形式の修飾付き関数呼び出しをサポートします。

```loom
import text

message = text.upper("hello")
```

- 修飾付き呼び出しは `library.nodeName` の形
- import 名そのものは単純な識別子のみ（dotted import name は未対応）

`text.upper`・`json.parse`・`console.log` などが標準ライブラリノードとして実行できます。利用可能な関数の一覧は [標準ライブラリリファレンス](STANDARD_LIBRARY_REFERENCE.md) を参照してください。

## 代入文

```text
識別子 = 式
```

左辺の識別子がノード ID になります。右辺は関数呼び出し・パイプ式・算術式などです。

```loom
timer = clock()
wave = sine(timer, freq: 0.5)
```

## 式文（effect statement）

トップレベルの関数呼び出しを、代入なしで式文（effect statement）として書けます。`console.log` や `scene.*` のような sink / output 系ノードを呼ぶときに使います。

```loom
import console

message = constant(value: "hello")
console.log(message)
```

- 式文は生成された effect node にコンパイルされます

## リテラル

| 種類 | 例 |
|------|-----|
| 数値 | `0.3`, `-1`, `100`, `4.5e-2` |
| 文字列 | `"#00ff00"`, `"running"` |
| 真偽値 | `true`, `false` |
| null | `null` |

リテラルは関数引数として使われ、対応するノードの `params` に格納されます。

```loom
n = constant(value: 1)
name = constant(value: "cube")
enabled = constant(value: true)
```

## 識別子

英字または `_` で始まり、英数字・`_` が続きます。

```text
t, wave, mapX, slow_sine
```

式の中で識別子を参照すると、そのノードのデフォルト出力ポートからのエッジが自動生成されます。

### デフォルト出力ポート

| ノード型 | デフォルト出力ポート |
|----------|---------------------|
| `clock` | `t` |
| `pointerPosition` | `pos` |
| その他（変換 / 状態 / シンク系を含む） | `out` |

```loom
t = clock()
wave = sine(t, freq: 0.3)
# t は clock の出力 → t.t として解決
# wave は sine の出力 → wave.out として解決
```

## 関数呼び出しと引数

```text
関数名(引数リスト)
```

引数には **位置引数** と **名前付き引数** があります。

```loom
sine(t, freq: 0.3)        # t は位置引数、freq: 0.3 は名前付き引数
clock()                   # 引数なし
map(t, inMin: 0, inMax: 10, outMin: 100, outMax: 700)
```

> 読みやすさのため、サンプルでは名前付き引数を推奨します。特に Scene Sync 系は後から見る人が迷いにくくなります。

## 引数のルール

### デフォルトルール（全ノード共通）

- 第 1 引数: 位置引数でも名前付き引数でも可
- 第 2 引数以降: **名前付き必須**

```loom
sine(t, freq: 0.3)          # OK
sine(t: t, freq: 0.3)       # OK（全部名前付き）
sine(t, 0.3)                # エラー（freq に名前が必要）
```

### 可換ノード（add, multiply）

全引数を位置引数で書けます。ただし **混在禁止**（全部位置引数か全部名前付き引数のどちらか）。

```loom
add(a, b)                   # OK（全部位置引数）
add(a: x, b: y)             # OK（全部名前付き）
add(a, b: y)                # エラー（混在禁止）
```

### 非可換ノード（subtract, divide, mod など）

デフォルトルール通り。第 1 引数のみ位置引数で書けます。

```loom
subtract(x, b: y)           # OK（第1引数のみ位置）
subtract(a: x, b: y)        # OK（全部名前付き）
subtract(x, y)              # エラー（b に名前が必要）
```

## パイプ演算子

`式 |> 関数呼び出し` で、左辺の式が右辺関数の第 1 引数として渡されます。

```loom
t |> sine(freq: 0.3)
# 等価: sine(t, freq: 0.3)
```

チェーンできます。

```loom
t |> sine(freq: 0.3) |> map(inMin: -1, inMax: 1, outMin: 100, outMax: 700)
```

パイプは第 1 引数を提供するため、呼び出し側の引数は第 2 引数以降になります。

```loom
x |> sine(freq: 0.3)        # OK（x は |> で第1引数, freq が第2引数）
x |> add(y)                 # OK（add は可換、x と y は両方位置引数）
```

## 算術式

`+`・`-`・`*`・`/`・`%`、単項マイナス、`( )` によるグループ化が使えます。`*` `/` `%` は `+` `-` より優先されます。算術式は内部的に `formula` ノードへコンパイルされます。

```loom
a = constant(value: 2)
b = constant(value: 3)
c = a + b * 2
d = (a - 1) / 3
e = a % 2
```

## 改行と継続

通常、改行は文の終わりです。以下の場合は継続とみなされます。

1. **括弧内**: `(` が閉じていない間、改行は無視されます
2. **パイプ継続**: 次の行が `|>` で始まる場合（直前の行との間に空行がない場合）

```loom
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

> **注意**: 空行が入るとパイプチェーンは終わります。空行の後に `|>` が来た場合は構文エラーになります。

## render 文（プレビュー用）

`render` は通常のノードではなく、Editor Studio / Node Editor の Canvas Preview に何を描くかを指定する特殊な文です。**Scene Sync 上の object を操作する命令ではありません。**

- 1 ファイルにつき 1 つだけ書く想定です
- すべての引数は名前付きで指定する必要があります
- 現在対応している render type は `point` と `bar` のみです（`circle`・`rect`・`text`・`image`・`model` は未対応）

```loom
render point(x: x, y: y, color: "#00ff00", trail: 0.05)
```

### `render point(...)`

| 引数 | 必須 | 型 | 説明 |
|---|---|---|---|
| `x` | yes | number / node reference | 点の X 座標 |
| `y` | yes | number / node reference | 点の Y 座標 |
| `color` | no | string | 点の色。省略時は `#00ff00` |
| `trail` | no | number | 残像の強さ。省略時は `0.1`。`0` に近いほど軌跡が長く残り、`1` に近いほどすぐ消える |

### `render bar(...)`

Canvas 左端（X=0）から横方向に伸びるバーを描画します。

| 引数 | 必須 | 型 | 説明 |
|---|---|---|---|
| `width` | yes | number / node reference | バーの幅 |
| `color` | no | string | バーの色。省略時は `#00ccff` |
| `height` | no | number | バーの高さ。省略時は `40` |
| `y` | no | number / node reference | バーの Y 座標。省略時は Canvas 中央 |

### 例: point

```loom
t = clock()

x = sine(t, freq: 0.2)
  |> map(inMin: -1, inMax: 1, outMin: 100, outMax: 700)

y = cosine(t, freq: 0.3)
  |> map(inMin: -1, inMax: 1, outMin: 100, outMax: 500)

render point(x: x, y: y, color: "#00ffcc", trail: 0.03)
```

### 例: bar

```loom
t = clock()

wave = sine(t, freq: 0.5)
width = map(wave, inMin: -1, inMax: 1, outMin: 40, outMax: 700, clamp: true)

render bar(width: width, color: "#80ed99", height: 60)
```

---

# 実験的な構文 (v0)

以下は使えますが制約が多く、仕様が変わる可能性があります。詳細と非対応ケースは [Function Definitions v0](labs/FUNCTION_DEFINITIONS_V0.md) を参照してください。

## 関数定義

同一ファイル内の純粋な式を再利用するための関数定義です。`fn name(params) => expr`、または単一式のブロック形式 `fn name(x) { expr }` が書けます。

```loom
fn double(x) => add(x, x)

value = double(21)
```

- 位置パラメータ・位置引数の呼び出しのみ
- 同一ファイル定義間のネスト呼び出しは可
- **非対応**: クロージャ、再帰、高階関数定義、関数呼び出しでの名前付き引数、import / export

非対応ケースは `DUPLICATE_FUNCTION`・`UNKNOWN_FUNCTION`・`WRONG_ARITY`・`RECURSIVE_FUNCTION`・`UNSUPPORTED_FUNCTION_BODY` などの診断でコンパイルエラーになります。

## 関数リテラル

`fn(params) => expr` 形式の無名関数リテラルが書けます。主に `list.map` などの高階リストノードへ渡す用途です。

```loom
import list

nums = list.range(start: 1, end: 5)
doubled = list.map(nums, fn: fn(x) => multiply(a: x, b: 2))
```

## 配列・オブジェクト

配列 `[ ]` とオブジェクト `{ }` のリテラルが書けます。

```loom
xs = constant(value: [1, 2, 3])
cfg = constant(value: { width: 100, label: "cube" })
```

> **制約**: 配列の要素はリテラルのみで、ノード参照や呼び出しなどの非リテラルをネストすることはできません（`Nested non-literal in array is not supported`）。

## メンバアクセス

`式.property` 形式のメンバアクセスが書けます。semantic component / swizzle（`pos.x`、`pos.ruf` など）の詳細は [semantic component access](design/semantic-component-access-v0.md) を参照してください。

---

# まだ対応していない構文

現時点では書けません（将来構想を含む）。

- dotted import name: `import math.extra`
- 選択 import / 別名: `import { sine } from math`、`from math import sine`、`import math as m`
- `render circle` / `rect` / `text` / `image` / `model`
- 関数定義の再帰・クロージャ・高階・名前付き引数
- subgraph の Node Editor UI
- パッケージシステム経由の関数 import / export（[Package System](labs/PACKAGE_SYSTEM.md) 参照）

---

# Scene Sync オブジェクト挙動の規約

Scene Sync の Object Behavior として使う `.loom` では、**原則 `objectId` を書きません**。`objectId` が空の場合、Scene Sync 側の対象オブジェクトに適用されます。

```loom
import scene

scene.setColor(r: 1, g: 0.5, b: 0.2)
```

`objectId` を明示することもできますが（`scene.setPosition("sample-cube", ...)` のような呼び出し）、Behavior サンプルでは避けてください。後から別オブジェクトに再利用しにくくなります。

```loom
# Behavior サンプルでは避ける
scene.setColor(objectId: "sample-cube", r: 1, g: 0.5, b: 0.2)
```

object-scoped Behavior Graph での相対移動の例:

```loom
import math
import scene

t = clock()
dy = math.sine(t, freq: 0.8, amplitude: 0.5)

scene.offsetPosition(y: dy)
```

`scene.*` ノードの一覧と引数は [標準ライブラリリファレンス](STANDARD_LIBRARY_REFERENCE.md) を参照してください。

---

# エラー

パースエラーは `LoomDSLError` としてスローされます。

| プロパティ | 説明 |
|-----------|------|
| `message` | エラーメッセージ |
| `line` | 行番号（1 始まり）|
| `column` | 列番号（1 始まり）|
| `code` | エラー種別 |

### エラーコード一覧

| コード | 説明 |
|--------|------|
| `UNEXPECTED_TOKEN` | 予期しないトークン |
| `UNKNOWN_NODE_TYPE` | 未知のノード型 |
| `MISSING_ARGUMENT_NAME` | 引数名が必要 |
| `UNDEFINED_IDENTIFIER` | 未定義の識別子 |
| `IMPORT_MUST_BE_TOP_LEVEL` | `import` 文が他の文の後に書かれている |
| `UNKNOWN_IMPORT` | 未知の import library |
| `UNSUPPORTED_IMPORT` | 指定 runtime target で利用できない import library |
| `UNKNOWN_RUNTIME_TARGET` | 未知の runtime target |

---

# Programmatic API

Loomlet は DSL を Source AST 経由で扱う関数を公開しています。AI 補助編集・formatter・ビジュアルエディタの基盤として使えます。

```js
import { parseDSLToAST, formatDSL, compileToGraph } from "@afjk/loomlet";

const source = `t = clock()\nwave = sine(t, freq: 0.3)`;

// 解析して整形
const { ast, errors } = parseDSLToAST(source);
if (errors.length) console.error(errors);
const formatted = formatDSL(ast);

// graph JSON へ変換
const { graph, errors: compileErrors } = compileToGraph(ast);
```

---

# 関連ドキュメント

| ドキュメント | 役割 |
|---|---|
| [標準ライブラリリファレンス](STANDARD_LIBRARY_REFERENCE.md) | 使える関数・ノードの一覧 |
| [Tour](TOUR.md) | 学習順のサンプル一覧 |
| [Concepts / 設計ノート](concepts.ja.md) | behavior / event / state / 決定論などの意味論 |
| [SPEC](SPEC.md) | Graph / Environment / Runtime の詳細仕様 |
| [Scene Sync](SCENESYNC.md) | Scene Sync 連携 |
</content>
