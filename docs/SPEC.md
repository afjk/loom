# Loom 仕様書

## 1. 概要

Loom は、ブラウザで動く**ステートレスなデータフロー実行エンジン**です。JSON でグラフを定義し、毎フレーム値を計算・更新します。

**英語での一行説明：**
> A stateless dataflow engine for the browser. Build reactive visual, audio, and 3D content by composing pure functions.

**日本語での説明：**

ブラウザで動くステートレスなデータフロー実行エンジン。純粋な関数の合成により、リアクティブな視覚・音響・3D コンテンツを構築します。

Loom の核は、以下の仕組みです：

1. グラフ状に配置された複数の「ノード」を定義（JSON で記述）
2. ノードどうしを「エッジ」で接続（値の流れを表現）
3. エンジンが毎フレーム、グラフを評価し、各ノードの出力値を計算
4. 外部から `engine.getValue()` で任意のノードの出力値を取得し、画面や音響に反映

## 2. 設計原則

### 原則 1：ステートレスを基本とする

状態（過去を引きずる値）を持たず、現在時刻と入力だけから出力が決まる純粋なデータフローを基盤とします。

**意図：**
- 任意のタイミングで同じ計算を再実行しても、同じ結果が得られる
- 記録と再生が容易
- マルチプレイの同期が単純

### 原則 2：状態が必要な部分は明示的に局在化する

「状態部品」という限定された種類の部品にだけ状態を持たせ、グラフ上で目に見える形で管理します。

**意図：**
- 状態を持つ部品がどこかは常に明確
- デバッグやテストが容易
- 状態管理の責任が明確に分離される

### 原則 3：副作用を出口側に集める

外部への副作用（位置や色を変える、音を鳴らす、メッセージを送るなど）は「シンク」専用部品でのみ行います。中間の計算は副作用を持ちません。

**意図：**
- 中間の計算ロジックが純粋で、テスト・再利用が容易
- 副作用がどこで起きるかが明確
- グラフの再利用性が高い

### 原則 4：テキスト表現とビジュアル表現の二重持ち

内部はテキストの専用記法（DSL）で持ち、UI はそれを視覚化します。両方向に変換可能で、人間も AI も自由に行き来できます。

**注意：** 第ゼロ段階では DSL とビジュアル UI は実装せず、JSON 直書きから始めます。

**意図：**
- テキスト形式により、バージョン管理・AI 処理が容易
- ビジュアル UI により、直感的な編集が可能
- 両者の変換が可能なため、ツール化が容易

## 3. データフローモデル

### 3.1 値の二種類

すべての値は次のどちらかに分類されます。

**連続値（Behavior）**

常に何らかの値が流れている「川」のようなもの。時間的に途切れません。例：

- 時計（経過時間）
- Sin 波（周期的な振動）
- 温度センサーの現在値
- マウスのポインタ位置

第ゼロ段階では、連続値のみを扱います。

**イベント（Event）**

時々瞬間的に発生する「雷」のようなもの。時間的に離散的です。例：

- クリック
- キープレス
- メッセージ受信
- 閾値超え（値が特定の値を越えたとき）

イベントは第一段階で導入します。

### 3.2 ノード（部品）の 5 カテゴリ

部品は次の 5 つのカテゴリに分かれます。

#### ソース部品

入力なしで値を生み出すノード。

**例：** `clock`（時刻）、`constant`（定数）

#### 入力部品

外界から値を受け取るノード。ユーザーの操作やネットワーク通信などが対象。

**例：** `pointerPosition`（マウス位置）、`pointerClick`（クリック）、`webhook`（HTTP リクエスト）

第ゼロ段階では実装されません。

#### 変換部品

純粋な計算で値を変換する。状態を持ちません。

**例：** `add`（足し算）、`multiply`（掛け算）、`sine`（正弦波）、`map`（配列変換）

#### 状態部品

内部に状態を持つ唯一のカテゴリ。過去の値を記憶し、それに基づいて出力を決定します。

**例：** `accum`（積分）、`smooth`（なめらか化）、`delay`（遅延）

第ゼロ段階では実装されません。

#### シンク部品

外部への副作用を持つノード。値を受け取り、画面・音響・ネットワークなどに影響を与えます。

**例：** `setPosition`（位置変更）、`playSound`（音声再生）、`broadcastEvent`（イベント送信）

第ゼロ段階では実装されません。

### 3.3 イベントの伝播モデル

- イベントは「あるフレームで発生／発生しない」のいずれかの状態を持つ
- ノードの Event 型入力ポートは、未接続またはそのフレームに上流からイベントが届かなかった場合「発生していない」扱い
- ノードの evaluate 関数は毎フレーム呼ばれるが、Event 型出力ポートに値を書くかどうかはノード自身の判断
- 同一フレーム内で複数のイベントが同じ Event 型ポートに到達することがあり得る。その場合、下流ノードは配列としてすべて受け取れる
- イベントはフレームをまたがない。次フレームでは新たに発生したイベントだけが下流に流れる

### 3.4 接続の型ルール

- Behavior 型ポート → Behavior 型ポート：許容（既存通り）
- Event 型ポート → Event 型ポート：許容
- Behavior ↔ Event のクロス接続：禁止、`TYPE_MISMATCH` エラー
- ペイロード型が異なる場合（例：`event<vec2>` → `event<void>`）も `TYPE_MISMATCH` エラー

**例外：** `sample` ノードの `value` 入力ポート（Behavior 型）には Event 型の上流から接続することが許される唯一のケース。これは Behavior 値をイベントトリガでサンプリングするための設計である。

## 4. 第ゼロ段階のスコープ

### 実装対象

- ✅ 評価器の中核（JSON グラフを受け取り、毎フレーム値を計算する）
- ✅ ノード 5 種類のみ：`clock`、`constant`、`sine`、`add`、`multiply`
- ✅ ブラウザ環境のみ（Node.js 対応は第一段階以降）
- ✅ 単一クライアント（ネットワーク同期なし）
- ✅ JSON でグラフ定義、`engine.getValue()` で外部から値を取得
- ✅ ESM 形式の単一ファイル（`loom.js`）として配布
- ✅ 依存ライブラリゼロ（Three.js などへの依存も持たない）

### 実装外（第一段階以降）

- ❌ テキスト記法（DSL）とそのパーサ
- ❌ ビジュアルノードエディタ
- ❌ イベント型のノード
- ❌ 状態を持つノード（`accum`、`smooth` など）
- ❌ シンクノード（`setPosition` など）
- ❌ マルチプレイ・broadcast 機能
- ❌ AI 連携用ツール定義
- ❌ Three.js / SceneSync 連携アダプタ
- ❌ npm パッケージング

## 4.5 第一段階のスコープ

### 実装対象（第一段階で追加）

- ✅ Event 型ポートと型ルール
- ✅ `engine.dispatchEvent(ref, payload)` API
- ✅ 入力ノード4種：`pointerClick`、`pointerPosition`、`keyDown`、`keyUp`
- ✅ イベント変換ノード3種：`filter`、`sample`、`merge`
- ✅ DOM シンクノード4種：`setText`、`setStyle`、`setAttr`、`log`
- ✅ 既存ノードはそのまま動作（後方互換）

### 実装外（第二段階以降）

- ❌ 状態を持つノード（`accum`、`smooth` など）
- ❌ DSL とパーサ
- ❌ ビジュアルエディタ
- ❌ マルチクライアント同期
- ❌ Three.js アダプタ

## 5. ノード仕様（第ゼロ段階の 5 種類）

### ノード型のメタデータ構造

各ノード型は、内部的に以下のメタデータを持つオブジェクトとして定義されます。

```javascript
{
  category: "source" | "transform" | "state" | "sink" | "input",
  inputs: [
    { name: "t", type: "number", default: 0 },
    ...
  ],
  outputs: [
    { name: "out", type: "number" }
  ],
  params: [
    { name: "freq", type: "number", default: 1 },
    ...
  ],
  evaluate: (inputs, params, ctx) => outputs
}
```

このメタデータは以下の目的で利用されます。

- グラフ読み込み時の検証（未知のポートやパラメータの検出）
- エラーメッセージの生成（どのノードのどのポートが問題かを特定）
- 将来のビジュアルエディタでの自動 UI 生成
- 将来の AI 連携でのスキーマ提供

### 5.0 入力・パラメータの統一ルール

すべてのノードは、入力ポートとパラメータについて次の優先順位で値を決定します。

1. 入力ポートにエッジが接続されていれば、その値を使う
2. エッジが接続されていなければ、`params` の同名フィールドの値を使う
3. それも指定されていなければ、ノード型ごとのデフォルト値を使う

このルールにより、すべてのノードの設定値は「グラフ上で動的に変えたければエッジで接続、静的に固定したければ `params` で指定」という形で統一的に扱えます。

### 5.1 clock

**カテゴリ：** ソース部品

**入力：** なし

**出力：**
- `t`（経過秒、エンジン起動時を 0 とする）
  - 型：`number`（double）

**パラメータ：** なし

**説明：**

エンジン起動からの経過時間（秒）を常に出力します。

**例：**
```json
{
  "id": "timer",
  "type": "clock"
}
```

### 5.2 constant

**カテゴリ：** ソース部品

**入力：** なし

**出力：**
- `out`（定数値）
  - 型：`number`（デフォルト 0）

**パラメータ：**
- `value`（出力する定数値、型：`number`、デフォルト 0）

**説明：**

パラメータで指定した定数値を常に出力します。変わりません。

**例：**
```json
{
  "id": "freq_source",
  "type": "constant",
  "params": {
    "value": 2.5
  }
}
```

### 5.3 sine

**カテゴリ：** 変換部品

**入力：**
- `t`（時刻、未接続時は `0`）
  - 型：`number`
- `freq`（周波数、Hz、未接続時は `params.freq`、デフォルト 1）
  - 型：`number`
- `amplitude`（振幅、未接続時は `params.amplitude`、デフォルト 1）
  - 型：`number`
- `phase`（位相、ラジアン、未接続時は `params.phase`、デフォルト 0）
  - 型：`number`
- `offset`（オフセット、未接続時は `params.offset`、デフォルト 0）
  - 型：`number`

**出力：**
- `out`（正弦波出力）
  - 型：`number`
  - 計算式：`sin(t * freq * 2π + phase) * amplitude + offset`

**パラメータ：**
- `freq`（周波数、Hz、型：`number`、デフォルト 1）
- `amplitude`（振幅、型：`number`、デフォルト 1）
- `phase`（位相、ラジアン、型：`number`、デフォルト 0）
- `offset`（オフセット、型：`number`、デフォルト 0）

**説明：**

時刻 `t` を入力として、正弦波を計算します。周波数、振幅、位相、オフセットでカスタマイズ可能です。

**例：**
```json
{
  "id": "oscillator",
  "type": "sine",
  "params": {
    "freq": 2.0,
    "amplitude": 1.5,
    "phase": 0,
    "offset": 0
  }
}
```

### 5.4 add

**カテゴリ：** 変換部品

**入力：**
- `a`（加数、未接続時は `params.a`、デフォルト 0）
  - 型：`number`
- `b`（加数、未接続時は `params.b`、デフォルト 0）
  - 型：`number`

**出力：**
- `out`（合計）
  - 型：`number`
  - 計算式：`a + b`

**パラメータ：**
- `a`（入力 `a` が未接続のときのデフォルト値、型：`number`、デフォルト 0）
- `b`（入力 `b` が未接続のときのデフォルト値、型：`number`、デフォルト 0）

**説明：**

2 つの数値を足し合わせます。入力が未接続の場合、対応する `params` の値が使われます。

**例：**
```json
{
  "id": "summer",
  "type": "add",
  "params": {
    "b": 5
  }
}
```

### 5.5 multiply

**カテゴリ：** 変換部品

**入力：**
- `a`（被乗数、未接続時は `params.a`、デフォルト 1）
  - 型：`number`
- `b`（乗数、未接続時は `params.b`、デフォルト 1）
  - 型：`number`

**出力：**
- `out`（積）
  - 型：`number`
  - 計算式：`a * b`

**パラメータ：**
- `a`（入力 `a` が未接続のときのデフォルト値、型：`number`、デフォルト 1）
- `b`（入力 `b` が未接続のときのデフォルト値、型：`number`、デフォルト 1）

**説明：**

2 つの数値を掛け合わせます。入力が未接続の場合、対応する `params` の値が使われます。

**例：**
```json
{
  "id": "scaler",
  "type": "multiply",
  "params": {
    "b": 0.5
  }
}
```

### 5.5a subtract

**カテゴリ：** 変換部品

**入力：**
- `a`（被減数、未接続時は `params.a`、デフォルト 0）
  - 型：`number`
- `b`（減数、未接続時は `params.b`、デフォルト 0）
  - 型：`number`

**出力：**
- `out`（差）
  - 型：`number`
  - 計算式：`a - b`

**パラメータ：**
- `a`（デフォルト 0）
- `b`（デフォルト 0）

**説明：**

2 つの数値の差を計算します。`a` から `b` を引きます。

### 5.5b divide

**カテゴリ：** 変換部品

**入力：**
- `a`（被除数、未接続時は `params.a`、デフォルト 0）
  - 型：`number`
- `b`（除数、未接続時は `params.b`、デフォルト 1）
  - 型：`number`

**出力：**
- `out`（商）
  - 型：`number`
  - 計算式：`b === 0 ? 0 : a / b`

**パラメータ：**
- `a`（デフォルト 0）
- `b`（デフォルト 1）

**説明：**

2 つの数値の商を計算します。除数が 0 の場合は 0 を返します。

### 5.5c mod

**カテゴリ：** 変換部品

**入力：**
- `a`（被除数、未接続時は `params.a`、デフォルト 0）
  - 型：`number`
- `b`（除数、未接続時は `params.b`、デフォルト 1）
  - 型：`number`

**出力：**
- `out`（剰余）
  - 型：`number`
  - 計算式：`b === 0 ? 0 : ((a % b) + b) % b`

**パラメータ：**
- `a`（デフォルト 0）
- `b`（デフォルト 1）

**説明：**

`a` を `b` で割った剰余を返します。負数に対応し、常に非負の値を返します（数学的な正のモジュロ）。除数が 0 の場合は 0 を返します。

### 5.5d negate

**カテゴリ：** 変換部品

**入力：**
- `a`（未接続時は `params.a`、デフォルト 0）
  - 型：`number`

**出力：**
- `out`（符号反転値）
  - 型：`number`
  - 計算式：`-a`

**パラメータ：**
- `a`（デフォルト 0）

**説明：**

数値の符号を反転させます。正を負に、負を正に変えます。

### 5.5e abs

**カテゴリ：** 変換部品

**入力：**
- `a`（未接続時は `params.a`、デフォルト 0）
  - 型：`number`

**出力：**
- `out`（絶対値）
  - 型：`number`
  - 計算式：`Math.abs(a)`

**パラメータ：**
- `a`（デフォルト 0）

**説明：**

数値の絶対値を返します。負の値は正に、正の値はそのまま返します。

### 5.5f clamp

**カテゴリ：** 変換部品

**入力：**
- `value`（未接続時は `params.value`、デフォルト 0）
  - 型：`number`
- `min`（最小値、未接続時は `params.min`、デフォルト 0）
  - 型：`number`
- `max`（最大値、未接続時は `params.max`、デフォルト 1）
  - 型：`number`

**出力：**
- `out`（クランプされた値）
  - 型：`number`
  - 計算式：`min > max ? min : Math.max(min, Math.min(max, value))`

**パラメータ：**
- `value`（デフォルト 0）
- `min`（デフォルト 0）
- `max`（デフォルト 1）

**説明：**

入力値を `min` と `max` の範囲に挟みます。`min > max` の場合は `min` を返します。

### 5.5g lerp

**カテゴリ：** 変換部品

**入力：**
- `a`（開始値、未接続時は `params.a`、デフォルト 0）
  - 型：`number`
- `b`（終了値、未接続時は `params.b`、デフォルト 1）
  - 型：`number`
- `t`（補間パラメータ、未接続時は `params.t`、デフォルト 0）
  - 型：`number`

**出力：**
- `out`（補間値）
  - 型：`number`
  - 計算式：`a + (b - a) * t`

**パラメータ：**
- `a`（デフォルト 0）
- `b`（デフォルト 1）
- `t`（デフォルト 0）

**説明：**

2 つの値 `a` と `b` を `t` で線形補間します。`t=0` で `a`、`t=1` で `b` が得られます。`t` が 0～1 の範囲外でも外挿（クランプされない）します。

### 5.5h smoothstep

**カテゴリ：** 変換部品

**入力：**
- `x`（入力値、未接続時は `params.x`、デフォルト 0）
  - 型：`number`
- `edge0`（下辺、未接続時は `params.edge0`、デフォルト 0）
  - 型：`number`
- `edge1`（上辺、未接続時は `params.edge1`、デフォルト 1）
  - 型：`number`

**出力：**
- `out`（スムーズステップ値）
  - 型：`number`

**パラメータ：**
- `x`（デフォルト 0）
- `edge0`（デフォルト 0）
- `edge1`（デフォルト 1）

**説明：**

GLSL の `smoothstep` に準拠した関数です。`x` が `edge0` より小さい場合は 0、`edge1` より大きい場合は 1 を返します。その間では、エルミート補間で滑らかに遷移する値を返します。`edge0 === edge1` の場合は、`x < edge0` なら 0、そうでなければ 1 を返します。

### 5.5i map

**カテゴリ：** 変換部品

**入力：**
- `value`（入力値、未接続時は `params.value`、デフォルト 0）
  - 型：`number`
- `inMin`（入力範囲の最小、未接続時は `params.inMin`、デフォルト 0）
  - 型：`number`
- `inMax`（入力範囲の最大、未接続時は `params.inMax`、デフォルト 1）
  - 型：`number`
- `outMin`（出力範囲の最小、未接続時は `params.outMin`、デフォルト 0）
  - 型：`number`
- `outMax`（出力範囲の最大、未接続時は `params.outMax`、デフォルト 1）
  - 型：`number`

**出力：**
- `out`（リマップ値）
  - 型：`number`

**パラメータ：**
- `value`（デフォルト 0）
- `inMin`（デフォルト 0）
- `inMax`（デフォルト 1）
- `outMin`（デフォルト 0）
- `outMax`（デフォルト 1）
- `clamp`（boolean、デフォルト `false`）：入力値が範囲外の場合、`true` なら出力をクランプ、`false` なら外挿する

**説明：**

入力範囲 `[inMin, inMax]` から出力範囲 `[outMin, outMax]` へ値をリマップします。TouchDesigner の Math CHOP の Range/Map 機能に相当します。`inMin === inMax` の場合は `outMin` を返します。`clamp` パラメータは **入力ポートではなくパラメータのみ** です。

### 5.5j cosine

**カテゴリ：** 変換部品

**入力：**
- `t`（時刻、未接続時は `params` から解決、デフォルト 0）
  - 型：`number`
- `freq`（周波数（Hz）、未接続時は `params.freq`、デフォルト 1）
  - 型：`number`
- `amplitude`（振幅、未接続時は `params.amplitude`、デフォルト 1）
  - 型：`number`
- `phase`（位相（ラジアン）、未接続時は `params.phase`、デフォルト 0）
  - 型：`number`
- `offset`（オフセット、未接続時は `params.offset`、デフォルト 0）
  - 型：`number`

**出力：**
- `out`（コサイン出力）
  - 型：`number`
  - 計算式：`Math.cos(t * freq * 2 * Math.PI + phase) * amplitude + offset`

**パラメータ：**
- `freq`（デフォルト 1）
- `amplitude`（デフォルト 1）
- `phase`（デフォルト 0）
- `offset`（デフォルト 0）

**説明：**

コサイン波を出力します。`sine` と同じシグネチャですが、`Math.cos` を使用します。Lissajous 曲線など、複数の異なる周波数のトリゴノメトリック関数を組み合わせるのに利用します。

### 5.6 pointerClick

**カテゴリ：** 入力部品

**入力：** なし

**出力：**
- `event`（クリックイベント）
  - 型：`event<vec2>`（ペイロードはクリック位置 `{x, y}`）

**パラメータ：**
- `target`（オプション、文字列）：CSS セレクタ。指定するとそのセレクタに合致する DOM 要素上のクリックのみを発生させる。未指定なら `window` のクリックすべて。

**説明：**

ブラウザの pointer down イベントを購読し、クリックがあったフレームに `event` ポートからイベントを発生させる。`engine.dispatchEvent` を経由する経路（後述）か、ノード型が `start()` 内で自動購読する形のいずれかで実装される（実装は第一段階プロトタイプで決定）。

**ペイロード座標系：**

- `event<vec2>` の `{x, y}` は **viewport 基準**（`clientX` / `clientY` 相当）の座標。ピクセル単位。
- `target` がウィンドウ全体の場合（`target` 省略時または `"window"`）：ブラウザビューポート左上が原点。
- `target` が DOM 要素の場合：座標は依然として viewport 基準のまま発火する（要素相対への変換は呼び出し側が `getBoundingClientRect()` を使って行う）。

将来 Unity 等の非 DOM 環境で実装する場合は、当該プラットフォームの「画面座標系」相当（左上原点、ピクセル単位）にマップする。

### 5.7 pointerPosition

**カテゴリ：** 入力部品

**入力：** なし

**出力：**
- `pos`（現在のポインタ位置）
  - 型：`vec2`（`{x, y}`）

**パラメータ：** なし

**説明：**

現在のマウス／タッチ位置を Behavior 型として常時出力する。値は最後に観測された位置で、初回観測前は `{x: 0, y: 0}`。

**座標系：**

- `pos` は `pointerClick` と同じ viewport 基準の `{x, y}`。ピクセル単位。
- 未操作時の初期値は `{x: 0, y: 0}`。
- Behavior 型のため、毎フレーム最後に観測されたポインタ位置を返す。

非 DOM 環境での解釈は `pointerClick` に準ずる。

### 5.8 keyDown

**カテゴリ：** 入力部品

**入力：** なし

**出力：**
- `event`（キー押下イベント）
  - 型：`event<string>`（ペイロードは KeyboardEvent.key）

**パラメータ：**
- `key`（オプション、文字列）：指定するとそのキーのみフィルタする

**説明：**

`keydown` を購読し、該当フレームに `event` ポートからイベントを発生させる。

### 5.9 keyUp

**カテゴリ：** 入力部品

**入力：** なし

**出力：**
- `event`（キー離鍵イベント）
  - 型：`event<string>`（ペイロードは KeyboardEvent.key）

**パラメータ：**
- `key`（オプション、文字列）：指定するとそのキーのみフィルタする

**説明：**

`keyup` を購読し、該当フレームに `event` ポートからイベントを発生させる。

### 5.10 filter

**カテゴリ：** 変換部品

**入力：**
- `event`（任意の Event 型）

**出力：**
- `event`（入力と同じ Event 型）

**パラメータ：**
- `predicate`（必須、文字列）：制限式 DSL で記述された条件式。

**制限式 DSL の文法：**

predicate は以下の文法に限定される。`new Function` や `eval` での評価は禁止。

- **リテラル：**
  - 数値リテラル：`0`、`1.5`、`-3.14`
  - 文字列リテラル：シングルクォートのみ。例 `'Enter'`、`'a'`
  - 真偽値リテラル：`true`、`false`
- **識別子：**
  - `value`：イベントペイロード本体
  - `key`：ペイロードが文字列の場合のみ参照可能。それ以外は `undefined` 扱い
  - `value.x`、`value.y`：ペイロードがオブジェクトの場合のフィールドアクセス（1 段のみ、ネスト不可）
- **演算子：**
  - 比較：`==`、`!=`、`<`、`<=`、`>`、`>=`
  - 論理：`&&`、`||`、`!`
  - 算術：`+`、`-`、`*`、`/`（数値同士のみ）
- **括弧：** `(` `)` によるグループ化
- **演算子優先順位：** `!` > 算術 > 比較 > `&&` > `||`（C 系言語準拠）

**禁止事項：**
- 関数呼び出し（`Math.abs(value)` など）は使用不可
- メソッド呼び出し（`value.toString()` など）は使用不可
- 代入演算子（`=`、`+=` 等）は使用不可
- 配列リテラル・オブジェクトリテラル不可
- ネストしたフィールドアクセス（`value.a.b`）不可

**例：**
- `value > 0`
- `key == 'Enter'`
- `value.x > 100 && value.y < 200`
- `!(key == 'Escape')`

**実装方針：**

predicate は `load()` 時にパースして抽象構文木（AST）に変換し、評価は AST のインタプリタで行う。これにより JavaScript 環境と他環境（C#、Unity 等）で同一の評価結果を保証する。パース失敗時は `INVALID_GRAPH` エラーを投げ、`details: { reason: "filter.predicate", nodeId, error }` を含める。

**実装メモ**：

バージョン 0.2.0 では `new Function` ベースの評価を廃止し、制限式 DSL のパーサ・インタプリタで predicate を評価する。これにより、複数環境での一貫性が保証される。

### 5.11 sample

**カテゴリ：** 変換部品

**入力：**
- `trigger`（型：`event<void>`）：サンプリングのきっかけ
- `value`（型：任意の Behavior）：サンプリング対象の連続値

**出力：**
- `event`（型：`event<入力 value の値型>`）：trigger が発火した瞬間の value をペイロードに持つイベント

**パラメータ：** なし

**説明：**

`trigger` イベントが発火したフレームに、その時点の `value` の値をペイロードとして含むイベントを出力する。クリックした瞬間のマウス位置を取得する、といった用途に使う。

### 5.12 merge

**カテゴリ：** 変換部品

**入力：**
- `a`（型：`event<T>`）
- `b`（型：`event<T>`）：a と同じペイロード型

**出力：**
- `event`（型：`event<T>`）

**パラメータ：** なし

**説明：**

複数の Event ストリームを1本にまとめる。同一フレームに両方発生した場合、出力配列は `a` の全ペイロード、その後に `b` の全ペイロード、という順序で連結される。下流ノードはこの順序を前提にしてよい。

### 5.13 setText

**カテゴリ：** シンク部品

**入力：**
- `value`（型：`any`、デフォルト：`""`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：CSS セレクタ

**説明：**

DOM 要素のテキスト内容を更新する。`document.querySelector(target)` で要素を取得し、その `textContent` に `value` を文字列化して設定します。要素が見つからない場合、何もしない（エラーにしない）。

### 5.14 setStyle

**カテゴリ：** シンク部品

**入力：**
- `value`（型：`any`、デフォルト：`""`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：CSS セレクタ
- `property`（型：`string`、デフォルト：`""`）：スタイルプロパティ名
- `unit`（型：`string`、デフォルト：`""`）：単位（例："px"、"em"、""）

**説明：**

DOM 要素の CSS スタイルを更新する。`el.style[property] = String(value) + unit` として設定されます。例えば `value=50`、`property="width"`、`unit="px"` なら、`el.style.width = "50px"` となります。要素が見つからない場合、何もしない（エラーにしない）。

### 5.15 setAttr

**カテゴリ：** シンク部品

**入力：**
- `value`（型：`any`、デフォルト：`""`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：CSS セレクタ
- `name`（型：`string`、デフォルト：`""`）：属性名

**説明：**

DOM 要素の HTML 属性を更新する。`el.setAttribute(name, String(value))` として設定されます。例えば `name="data-count"` なら `data-count` 属性が更新されます。要素が見つからない場合、何もしない（エラーにしない）。

### 5.16 log

**カテゴリ：** シンク部品

**入力：**
- `value`（型：`any`、デフォルト：`undefined`）

**出力：** なし

**パラメータ：**
- `label`（型：`string`、デフォルト：`""`）：ラベル

**説明：**

ブラウザコンソールにメッセージを出力する。`console.log(label || "log", value)` として実行されます。デバッグ用。

## 5.17-5.21 Three.js アダプタノード

**注：** 以下のノードは、`src/loom-three.js` のアダプタを通じて登録されます。コアには含まれず、`registerThreeNodes(Loom, objects)` 呼び出しで利用可能になります。

### 5.17 setPosition

**カテゴリ：** シンク部品

**入力：**
- `x`（型：`number`、デフォルト：`0`、kind: `behavior`）
- `y`（型：`number`、デフォルト：`0`、kind: `behavior`）
- `z`（型：`number`、デフォルト：`0`、kind: `behavior`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：操作対象の Three.js Object3D のキー

**説明：**

Three.js Object3D の位置を設定します。`registerThreeNodes(Loom, { objectKey: mesh })` で登録されたオブジェクトに対して、`target: "objectKey"` でアクセスできます。`position.set(x, y, z)` が呼ばれます。

### 5.18 setRotation

**カテゴリ：** シンク部品

**入力：**
- `x`（型：`number`、デフォルト：`0`、kind: `behavior`）：X軸周りの回転（ラジアン、オイラー角）
- `y`（型：`number`、デフォルト：`0`、kind: `behavior`）：Y軸周りの回転（ラジアン、オイラー角）
- `z`（型：`number`、デフォルト：`0`、kind: `behavior`）：Z軸周りの回転（ラジアン、オイラー角）

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：操作対象の Three.js Object3D のキー

**説明：**

Three.js Object3D の回転をオイラー角（ラジアン）で設定します。`rotation.set(x, y, z)` が呼ばれます。

### 5.19 setScale

**カテゴリ：** シンク部品

**入力：**
- `x`（型：`number`、デフォルト：`1`、kind: `behavior`）
- `y`（型：`number`、デフォルト：`1`、kind: `behavior`）
- `z`（型：`number`、デフォルト：`1`、kind: `behavior`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：操作対象の Three.js Object3D のキー

**説明：**

Three.js Object3D のスケールを設定します。`scale.set(x, y, z)` が呼ばれます。

### 5.20 setColor

**カテゴリ：** シンク部品

**入力：**
- `r`（型：`number`、デフォルト：`1`、kind: `behavior`）：赤成分（0..1）
- `g`（型：`number`、デフォルト：`1`、kind: `behavior`）：緑成分（0..1）
- `b`（型：`number`、デフォルト：`1`、kind: `behavior`）：青成分（0..1）

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：操作対象の Three.js Object3D のキー

**説明：**

Three.js Object3D のマテリアルの色を RGB（0..1 範囲）で設定します。`material.color.setRGB(r, g, b)` が呼ばれます。

**マテリアル配列対応：** `material` が配列の場合、第一実装では **最初の要素のみ** を更新します。`material[0].color.setRGB(r, g, b)` が対象。

### 5.21 setVisible

**カテゴリ：** シンク部品

**入力：**
- `visible`（型：`any`、デフォルト：`true`、kind: `behavior`）：表示状態の真偽値

**出力：** なし

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：操作対象の Three.js Object3D のキー

**説明：**

Three.js Object3D の表示・非表示を切り替えます。`visible = !!inputs.visible` として設定されます。

## 5.22-5.27 SceneSync アダプタノード

**注：** 以下のノードは、`src/loom-scenesync.js` のアダプタを通じて登録されます。コアには含まれず、`new LoomSceneSync(...)` で利用可能になります。

### 5.22 serverClock

**カテゴリ：** ソース部品

**入力：** なし

**出力：**
- `t`（サーバ同期済み時刻、秒）
  - 型：`number`

**パラメータ：**
- `adapterId`（型：`string`、自動注入）：アダプタインスタンス ID

**説明：**

全クライアント同期済みのサーバ時刻を出力します。コンストラクタで渡された `getServerTime()` の戻り値を返します。

### 5.23 sceneSetPosition

**カテゴリ：** シンク部品

**入力：**
- `x`、`y`、`z`（型：`number`、デフォルト：`0`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`）：オブジェクト ID
- `adapterId`（型：`string`、自動注入）：アダプタインスタンス ID

**説明：**

オブジェクトの位置を設定します。`resolveTarget(target)` で取得したオブジェクトの `position.set(x, y, z)` を呼びます。

### 5.24 sceneSetRotation

**カテゴリ：** シンク部品

**入力：**
- `x`、`y`、`z`（型：`number`、デフォルト：`0`、オイラー角ラジアン）

**出力：** なし

**パラメータ：**
- `target`（型：`string`）：オブジェクト ID
- `adapterId`（型：`string`、自動注入）：アダプタインスタンス ID

**説明：**

オブジェクトの回転をオイラー角（ラジアン）で設定します。

### 5.25 sceneSetScale

**カテゴリ：** シンク部品

**入力：**
- `x`、`y`、`z`（型：`number`、デフォルト：`1`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`）：オブジェクト ID
- `adapterId`（型：`string`、自動注入）：アダプタインスタンス ID

**説明：**

オブジェクトのスケールを設定します。

### 5.26 sceneSetColor

**カテゴリ：** シンク部品

**入力：**
- `r`、`g`、`b`（型：`number`、デフォルト：`1`、0..1 範囲）

**出力：** なし

**パラメータ：**
- `target`（型：`string`）：オブジェクト ID
- `adapterId`（型：`string`、自動注入）：アダプタインスタンス ID

**説明：**

オブジェクトのマテリアル色を RGB で設定します。`material` が配列の場合は最初の要素のみ更新します。

### 5.27 sceneSetVisible

**カテゴリ：** シンク部品

**入力：**
- `visible`（型：`boolean`、デフォルト：`true`）

**出力：** なし

**パラメータ：**
- `target`（型：`string`）：オブジェクト ID
- `adapterId`（型：`string`、自動注入）：アダプタインスタンス ID

**説明：**

オブジェクトの表示・非表示を設定します。


## 6. グラフ定義の JSON フォーマット

### 基本構造

グラフは、`nodes` と `edges` を持つオブジェクトで表現されます。`loom` および `meta` はオプションです。

```json
{
  "loom": "0.0.1",
  "meta": {
    "name": "sample-graph",
    "author": "afjk",
    "description": "Sin 波を出力するサンプル"
  },
  "nodes": [ ... ],
  "edges": [ ... ]
}
```

- `loom`（オプション、文字列）：グラフが対象とする Loom 仕様のバージョン。後方互換性チェックなどに使用
- `meta`（オプション、オブジェクト）：人間や AI 向けの自由なメタデータ。エンジンの評価には影響しない
- `nodes`（必須、配列）：ノード定義の配列
- `edges`（必須、配列）：エッジ定義の配列

### nodes 配列

各ノードは以下の構造を持ちます：

```json
{
  "id": "unique_node_id",
  "type": "node_type_name",
  "params": { ... }
}
```

- `id`（必須）：ノードを一意に識別する文字列。グラフ内で重複してはいけません。
- `type`（必須）：ノードの型（`"clock"`、`"constant"`、`"sine"`、`"add"`、`"multiply"` など）
- `params`（オプション）：ノードのパラメータ。型によって異なります。省略可能で、その場合はデフォルト値が使われます。

### edges 配列

各エッジは、値の流れを表現します：

```json
{
  "from": "sourceNodeId.portName",
  "to": "targetNodeId.portName"
}
```

- `from`（必須）：送信側のノードの出力ポート（`"nodeId.outputPortName"` 形式）
- `to`（必須）：受信側のノードの入力ポート（`"nodeId.inputPortName"` 形式）

### 例：Sin 波の値を取り出すグラフ

時刻を取得し、その時刻に対する正弦波を計算するグラフです：

```json
{
  "nodes": [
    {
      "id": "timer",
      "type": "clock"
    },
    {
      "id": "wave",
      "type": "sine",
      "params": {
        "freq": 1.0,
        "amplitude": 1.0,
        "phase": 0,
        "offset": 0
      }
    }
  ],
  "edges": [
    {
      "from": "timer.t",
      "to": "wave.t"
    }
  ]
}
```

このグラフでは：
1. `clock` ノードが時刻 `t` を生成
2. その時刻が `sine` ノードに入力
3. `sine` ノードが正弦波 `out` を出力

外部から `engine.getValue("wave.out")` を呼ぶと、現在の正弦波の値が得られます。

### 別の例：加算と乗算の組み合わせ

定数 10 と時刻を足し、さらに 2 倍にするグラフ：

```json
{
  "nodes": [
    {
      "id": "const10",
      "type": "constant",
      "params": {
        "value": 10
      }
    },
    {
      "id": "timer",
      "type": "clock"
    },
    {
      "id": "adder",
      "type": "add"
    },
    {
      "id": "doubler",
      "type": "multiply",
      "params": {
        "b": 2
      }
    }
  ],
  "edges": [
    {
      "from": "const10.out",
      "to": "adder.a"
    },
    {
      "from": "timer.t",
      "to": "adder.b"
    },
    {
      "from": "adder.out",
      "to": "doubler.a"
    }
  ]
}
```

このグラフの最終結果は、`engine.getValue("doubler.out")` で取得できます。

## 7. 公開 API

Loom の評価モデルは「指定された時刻のグラフ状態を計算する」ことを中核とします。エンジン本体は時刻を内部で進めるのではなく、外部から `evaluateAt(time)` を呼ぶことで、その時刻におけるすべてのノード出力を確定させます。`start()` / `stop()` は `requestAnimationFrame` を使って `evaluateAt` を毎フレーム呼ぶ便利ラッパーであり、テストや決定論的再生では `evaluateAt` を直接呼ぶ運用が想定されています。

### Loom クラス

#### コンストラクタ：`new Loom(graph)`

```javascript
const engine = new Loom(graph);
```

**引数：**
- `graph`（オブジェクト）：グラフ定義（`nodes` と `edges` を持つオブジェクト）

**説明：**

グラフ定義を受け取り、エンジンを初期化します。この時点では評価ループは開始されていません。

グラフにサイクル（循環参照）が存在する場合、このコンストラクタはエラーを投げます。

**例：**
```javascript
const graph = { nodes: [...], edges: [...] };
const engine = new Loom(graph);
```

#### `engine.evaluateAt(time)`

```javascript
engine.evaluateAt(time);
```

**引数：**
- `time`（数値）：評価する時刻（秒、エンジン起動を 0 とする想定）

**説明：**

指定された時刻におけるグラフ全体を一度評価し、すべてのノードの出力値を内部に保存します。呼び出し後、`getValue()` でその時刻における任意のノード出力を取得できます。

`evaluateAt` は Loom の中核 API であり、`start()` / `stop()` はこれを `requestAnimationFrame` で繰り返し呼ぶ便利ラッパーです。テストや、外部の時刻ソース（サーバ時刻、録画再生など）に同期したい場合は、`evaluateAt` を直接呼ぶ運用が想定されています。

呼び出し時、保留中のグラフ（`load()` で渡されたもの）があれば、評価開始前に切り替えが行われます。

**例：**
```javascript
const engine = new Loom(graph);
engine.evaluateAt(0);
console.log(engine.getValue("wave.out"));
engine.evaluateAt(0.5);
console.log(engine.getValue("wave.out"));
```

#### `engine.dispatchEvent(ref, payload)`

```javascript
engine.dispatchEvent("click1.event", { x: 100, y: 200 });
```

**引数：**
- `ref`（文字列）：`"nodeId.portName"` 形式で、入力ノードの Event 型出力ポートを指定
- `payload`（任意）：Event のペイロード。`event<void>` の場合は省略可能

**説明：**

外部からの非同期イベント（DOM のクリック等）をエンジンに注入する。呼び出し時点でキューに積まれ、次の `evaluateAt` 呼び出しの中で該当ノードのその出力ポートからイベントが発生し、下流ノードへ伝播する。

入力ノードの実装は通常、コンストラクタや `start()` 内で DOM イベントリスナを登録し、その中で `dispatchEvent` を呼ぶ形になる。

#### `engine.getValue(ref)`

```javascript
const value = engine.getValue("nodeId.portName");
```

**引数：**
- `ref`（文字列）：`"nodeId.portName"` 形式で、ノードの出力ポートを指定

**戻り値：**
- 現在のノード出力値（型は出力ポートに依存、通常は `number`）

**説明：**

グラフ上の任意のノードの現在の出力値を取得します。

指定されたノードやポートが存在しない場合、またはまだ評価されていない場合の動作は未定義です。

**Behavior ポート参照時の戻り値：**

- `evaluateAt()` で評価された最新値。一度も評価されていないポートは `undefined`。

**Event ポート参照時の戻り値：**

`getValue("nodeId.eventPort")` で Event 型ポートを参照した場合の戻り値は以下のとおり：

- 当該 tick 内で 1 つ以上の payload が発火した場合：**payload の配列**（発火順）。
- 当該 tick 内で発火がなかった場合：**空配列 `[]`**（`undefined` ではない）。

これは内部の Event 伝播メカニズムにおいて、同一 tick 内で複数の payload が同一ポートを通過し得るため、配列形式で統一する。下流の Event ノード（`filter`、`merge`、`sample`）はこの配列を要素ごとに処理する。

**注意：**

`evaluateAt()` を呼んだ直後にのみ Event の発火状態が反映される。`start()` ループ外で `getValue()` を呼んでも、最後の `evaluateAt()` 時点の Event 配列が返る。次の `evaluateAt()` 呼び出しで Event 配列はクリアされる。

**補足：** 出力ポート名はノード型によって異なります。`clock` の出力ポートは `t`、それ以外のノード（`constant`、`sine`、`add`、`multiply`）の出力ポートは `out` です。

**例：**
```javascript
const current_time = engine.getValue("timer.t");
const wave_value = engine.getValue("wave.out");
const keyEvents = engine.getValue("kd.event"); // 配列 or 空配列
```

#### `engine.load(graph)`

```javascript
engine.load(graph);
```

**引数：**
- `graph`（オブジェクト）：新しいグラフ定義

**説明：**

グラフを差し替えます。動作は以下の三段階です。

1. **即時バリデーション**：渡されたグラフをただちに検証し、サイクルや構造エラーがあればこの時点でエラーをスローします。スローされた場合、現在のグラフはそのまま維持されます。
2. **保留状態として保持**：検証に成功したグラフは「保留中（pending）」として内部に保持されます。この時点ではまだ切り替えは行われていません。
3. **次の `evaluateAt` 呼び出し開始時に切り替え**：次に `evaluateAt(time)` が呼ばれた瞬間、保留中のグラフが新しい現行グラフになり、評価はそのグラフに対して行われます。

評価ループ実行中に呼ばれた場合も、フレーム途中でグラフがすり替わることはありません。同一フレーム内で `load()` 直後に `getValue()` を呼ぶと、古いグラフの値が返ります。

**例：**
```javascript
engine.load(newGraph);
console.log(engine.getValue("wave.out")); // 古いグラフの値
engine.evaluateAt(1.0);                   // ここで切り替え
console.log(engine.getValue("wave.out")); // 新しいグラフの値
```

#### `engine.start()`

```javascript
engine.start();
```

**説明：**

リアルタイム評価ループを開始します。これは便利機能であり、内部では `requestAnimationFrame` を使い、毎フレーム `evaluateAt(t)` を呼び出しているだけです（`t` はエンジン起動からの経過秒）。

リアルタイム実行を必要としない場合（テスト、サーバサイド、手動制御）は、`evaluateAt()` を直接呼び出すことを推奨します。

呼び出し後、`engine.stop()` が呼ばれるまで評価が続きます。

**例：**
```javascript
engine.start();
```

#### `engine.stop()`

```javascript
engine.stop();
```

**説明：**

`start()` で開始したリアルタイム評価ループを停止します。

呼び出し後も `getValue()` で最後の値を取得することはできます。手動で `evaluateAt()` を呼ぶこともできます。

**例：**
```javascript
engine.stop();
```

#### `Loom.registerNodeType(name, definition)`（静的メソッド）

```javascript
Loom.registerNodeType('setPosition', {
  category: 'sink',
  inputs: [...],
  outputs: [],
  params: [...],
  evaluate: (inputs, params, ctx) => ({})
});
```

**引数：**
- `name`（文字列）：登録するノード型の名前
- `definition`（オブジェクト）：ノード型のメタデータ定義。「5. ノード仕様」で説明した構造と同じ

**説明：**

外部からノード型を追加する。アダプタライブラリ向けの拡張ポイント。

同じ `name` で既に登録済みの場合、`LoomError` (`code: 'DUPLICATE_NODE_TYPE'`)をスロー。

**例：**
```javascript
import { Loom } from './src/loom.js';
import { registerThreeNodes } from './src/loom-three.js';

registerThreeNodes(Loom, objectsMap);  // 内部で Loom.registerNodeType を呼ぶ
const engine = new Loom(graph);
```

## 8. 評価モデル

### 初期化（グラフ読み込み時）

1. グラフの `nodes` 配列を検証（重複した ID がないか確認）
2. グラフの `edges` 配列を検証（存在しないノードやポートへのエッジがないか確認）
3. **トポロジカルソート** を実行し、ノード評価の順序を決定
4. サイクル（循環参照）が検出された場合、エラーを投げる

### 評価コンテキスト

毎フレーム、以下の情報をコンテキストとして保持します：

- `time`：エンジン起動からの経過秒数（秒単位、小数含む）

このコンテキストは、ノード評価時に参照されます（例：`clock` ノードが `time` を出力）。

### フレームごとの評価

毎フレーム、以下の処理が行われます：

1. 保留中のグラフ（`engine.load()` で渡されたもの）があれば、現行グラフに切り替え
2. `time` を `evaluateAt(time)` の引数で更新
3. `dispatchEvent` で積まれた保留イベントを、対応する入力ノードの出力に反映する
4. ソース側からシンク側へ向けて、**トポロジカルソートされた順序** に従い、各ノードを順次評価
   - Behavior 型入力：エッジ → params → デフォルトの3段階で値を決定
   - Event 型入力：上流からイベントが届いていればその配列、届いていなければ「発生していない」
   - 計算結果を Behavior 型出力ポートに書く（毎フレーム）
   - 必要なら Event 型出力ポートにイベントを書く（発生フレームのみ）
5. 評価終了後、Event 型ポートに溜まったイベントは破棄。次フレームに持ち越さない

### 未接続ポートの扱い

入力エッジが接続されていないポートの値は `undefined` として扱われます。各ノード型は、未接続ポートに対して以下のデフォルト値で処理します。

- `sine.t`：未接続時は `0`
- `sine.freq`：未接続時は `params.freq`（デフォルト `1`）
- `sine.amplitude`：未接続時は `params.amplitude`（デフォルト `1`）
- `sine.phase`：未接続時は `params.phase`（デフォルト `0`）
- `sine.offset`：未接続時は `params.offset`（デフォルト `0`）
- `add.a`：未接続時は `params.a`（デフォルト `0`）
- `add.b`：未接続時は `params.b`（デフォルト `0`）
- `multiply.a`：未接続時は `params.a`（デフォルト `1`）
- `multiply.b`：未接続時は `params.b`（デフォルト `1`）

これにより、エンジンは未接続ポートがあっても安全に評価を継続できます。

## 9. 配布形態

### ファイル形式

ES Module（ESM）形式の単一 JavaScript ファイルとして配布されます。

```html
<script type="module">
  import { Loom } from './src/loom.js';
  const engine = new Loom(graph);
  engine.start();
</script>
```

### ファイルパス

- `src/loom.js`

リポジトリのルートではなく、`src/` ディレクトリに配置されます。

### ビルドツール

ビルドツール（webpack、esbuild など）を使いません。人が読める単一ファイルのまま配布されます。

### 依存ライブラリ

ゼロです。Three.js や d3.js などの外部ライブラリに依存しません。

これにより、ファイルサイズが最小化され、読み込みが高速化されます。

### アダプタ層

コアエンジン（`src/loom.js`）は依存ゼロを保つが、特定ライブラリとの連携は別ファイルのアダプタとして提供する。

- `src/loom-three.js`：Three.js Object3D 連携。`registerThreeNodes(Loom, objects)` で利用。

アダプタは Loom コアに依存し、コアの `Loom.registerNodeType(name, definition)` 経由でノード型を登録する。

## 10. エラー仕様

Loom がスローするエラーは、以下の構造を持つ `Error` オブジェクトです。

```javascript
{
  name: "LoomError",
  message: "...",
  code: "ERROR_CODE",
  details: { ... }
}
```

`code` フィールドにより、利用側はエラーの種類をプログラム的に判別できます。

### 10.1 エラー種別一覧

| code | 発生タイミング | `details` の内容 | 説明 |
| --- | --- | --- | --- |
| `DUPLICATE_NODE_ID` | コンストラクタ、`load()` | `{ nodeId }` | 同じ ID のノードが複数存在する |
| `UNKNOWN_NODE_TYPE` | コンストラクタ、`load()` | `{ nodeId, type }` | 未知のノード型が指定された |
| `UNKNOWN_NODE` | コンストラクタ、`load()` | `{ nodeId }` | エッジが存在しないノードを参照している |
| `UNKNOWN_PORT` | コンストラクタ、`load()` | `{ nodeId, port, side }` | エッジが存在しないポートを参照している（`side` は `"input"` または `"output"`） |
| `DUPLICATE_INPUT_EDGE` | コンストラクタ、`load()` | `{ nodeId, port }` | 同じ入力ポートに複数のエッジが接続されている |
| `CYCLE` | コンストラクタ、`load()` | `{ nodeIds }` | グラフにサイクルが存在する。第ゼロ段階では一律エラー扱い |
| `TYPE_MISMATCH` | コンストラクタ、`load()` | `{ from, to, fromType, toType }` | エッジが Behavior と Event を混ぜている、またはペイロード型が一致しない |
| `DUPLICATE_NODE_TYPE` | `Loom.registerNodeType()` | `{ name }` | 同じ名前のノード型が既に登録されている |
| `INVALID_GRAPH` | コンストラクタ、`load()` | `{ reason }` | 上記以外の構造的問題（`nodes` が配列でない等） |

### 10.2 エラーが投げられるタイミング

- `new Loom(graph)`：コンストラクタ呼び出し時にグラフを検証し、問題があれば即座にスローする
- `engine.load(graph)`：呼び出し時にグラフを検証し、問題があれば即座にスローする。スローした場合、保留中のグラフ切り替えは発生しない
- `engine.evaluateAt(time)`：実行時のエラーは原則発生しない（未接続ポートはデフォルト値で処理されるため）

## 12. クロスプラットフォーム評価セマンティクス

Loom は単一の JSON グラフ表現を真の単一ソースとし、複数の評価環境（JavaScript / C# / その他）で**同一の入力に対し同一の出力**を返すことを保証する。

### 12.1 評価決定論性

ステートレスなノードのみで構成されたグラフは、以下を入力として与えれば全環境で同一結果を返す：

- グラフ JSON 定義
- `evaluateAt(time)` に渡す `time`
- 各 Event ポートに対する `dispatchEvent` 呼び出し列（順序とペイロード）

ステートを持つノード（将来追加される `accum`、`smooth` 等）はノード自身に状態保持責任があり、状態の初期値・更新規則は当該ノード仕様で定義する。

### 12.2 浮動小数点演算

数値演算は IEEE 754 倍精度（`double` / `float64`）を使用する。`sin`、`cos`、`sqrt` 等の超越関数の最終ビットは環境依存となる場合があるが、視覚的・聴覚的同期に問題のないレベルとする（厳密一致が必要な用途では deterministic math ライブラリの導入を将来検討）。

### 12.3 制限式 DSL の評価

`filter.predicate` で使用される制限式 DSL（5.10 節）は、全環境で同一の AST に変換され、同一のインタプリタ規則で評価される。各環境のホスト言語の構文や評価規則に依存しない。

### 12.4 入力ノードの実装

入力ノード（`pointerClick`、`pointerPosition`、`keyDown`、`keyUp`）は環境依存の API を利用するため、環境ごとに同等の機能を提供するアダプタが必要となる：

- ブラウザ：DOM `addEventListener`
- Unity：`InputSystem` または `Input.GetKey`
- その他：当該環境の入力 API

各環境で発火タイミング・ペイロード形式は本仕様（5.6〜5.9）に準拠する。

### 12.5 SceneSync 連携時の時刻同期

複数クライアントで結果を揃えるには、共有された時刻ソースが必要となる。これは将来の `serverClock` ノード（SceneSync アダプタで提供予定）で実現する。`evaluateAt(time)` の `time` を全クライアントで揃えれば、ステートレスグラフの結果は揃う。

## 13. ロードマップ

### 第一段階：イベント型と入力ノード（実装完了・仕様 0.2.0 準拠化完了）

- ✅ Event 型ポートと型ルールの実装
- ✅ `engine.dispatchEvent(ref, payload)` API の実装
- ✅ 入力ノード4種の実装：`pointerClick`、`pointerPosition`、`keyDown`、`keyUp`
- ✅ イベント変換ノード3種の実装：`filter`、`sample`、`merge`
- ✅ 制限式 DSL インタプリタの実装（仕様 0.2.0 準拠）
- ✅ Event ポート `getValue()` 戻り値の配列化
- ✅ 既存ノード5種の後方互換性維持
- ✅ ノード数を計12種に拡張

### 近期タスク：vec2 型スカラ変換ノード

- **TODO：** `vec2unpack` / `vec2pack` ノードの追加（vec2 とスカラの相互変換）。これにより `pointerPosition` をスカラ系ノード（`map`, `lerp` 等）と組み合わせ可能になる。
  - `vec2unpack`：入力 `vec2` を `x`, `y` という2つの `number` 出力に分解
  - `vec2pack`：2つの `number` 入力を `vec2` にパック

### 第二段階：状態部品と同期ポリシー

- 状態を持つノード（`accum`、`smooth`、`delay` など）の実装
- 状態の初期化・リセット戦略
- 複数クライアント環境での状態同期ポリシー（スナップショット送信、権威ノードなど）の検討

### 第三段階：デバッグ・検査機能

- ノード値の watch / inspect API
- スナップショット取得とタイムトラベルデバッグ
- グラフ可視化補助機能

### 第四段階：DSL とパッチ形式

- 専用テキスト記法（DSL）の設計とパーサ
- DSL ↔ JSON の相互変換
- 部分更新用のパッチ形式（AI による差分編集を想定）

### 第五段階：ビジュアルエディタとプリセット

- ブラウザベースのビジュアルノードエディタ
- ノード追加・削除、エッジ接続、リアルタイムプレビュー
- 再利用可能なサブグラフ／プリセット機構

### 第六段階：マルチクライアント同期と各種アダプタ

- 複数クライアントでのグラフ・状態同期
- イベント配信ノードによる broadcast
- ✅（一部完了）3D エンジン連携アダプタ：Three.js Object3D 向けの `src/loom-three.js`（`setPosition`、`setRotation`、`setScale`、`setColor`、`setVisible` シンクノード）
- AI 連携用のツール定義

### Phase 1.5：SceneSync アダプタ（Web）

- `src/loom-scenesync.js` の追加（Loom リポジトリ側のアダプタ層）。
- `serverClock` ノード追加（クロスクライアント時刻同期）。
- Sink ノード 5 種追加：`setPosition`、`setRotation`、`setScale`、`setColor`、`setVisible`。
- メッセージプロトコル：`scene-graph-set` / `scene-graph-clear` / `scene-graph-patch` / `scene-graph-input`。
- グラフのライフサイクル：シーン全体グラフ 1 個 + オブジェクト単位グラフ N 個を並行保持。
- 配信ポリシー：ステートレスなグラフ定義のみ broadcast、入力は各クライアントローカル評価。

### Phase 1.6：Unity 対応（C# 再実装）

- C# で Loom エンジンを再実装（評価コア、ノードレジストリ、`engine.load()` によるランタイム差し替え対応）。
- JSON スキーマと評価セマンティクス（12 章）を JS 版と完全一致させる。
- 制限式 DSL のインタプリタを C# でも実装。
- ノードの C# 実装は JS 版とノード型ごとに対応（仕様変更時は両側更新）。
- DSL（テキスト記法）は JS 版のみで扱い、Unity 側は JSON 中間表現のみ受信。
- SceneSync sink は Unity の `Transform` / `Renderer` に直接書き込む。

### Phase 2 以降：DSL とビジュアルエディタ

- グラフ DSL パーサ（テキスト → JSON 変換）。Phase 0 から JSON は中間表現の位置づけだったことを明文化。
- ノードグラフ視覚エディタ。
- DSL ↔ JSON ↔ ビジュアル の三者相互変換。
- ステートノード（`accum`、`smooth` 等）と Sink ノードの一般化。

---

**仕様書のバージョン：** 0.2.0（クロスプラットフォーム仕様確定版）

---

## Unity C# ランタイム補足仕様（v0.1.0）

### 概要

JavaScript 版 Loom と同じ JSON グラフ形式を、Unity C# ランタイムでも評価できる。

実装は `unity/com.afjk.loom/` に配置された Unity Package として提供される。

### 評価モデル

- Unity C# ランタイムは JSON グラフ評価のみを対象とする
- グラフ DSL は将来の人間向け表現であり、Unity 側は JSON 中間表現を評価する
- JavaScript 版の `evaluateAt(time)` に相当する `EvaluateAt(double time)` を毎フレーム呼び出す
- `Load(graph)` は JS 版同様、次の `EvaluateAt()` まで切り替えを保留する

### filter.predicate

- `filter.predicate` の式 DSL は JS / C# 両方で評価される
- C# 側では外部ライブラリ・Roslyn・DataTable.Compute を使わず、小さな tokenizer / parser / evaluator を実装する
- 対応演算子: 比較（`==` `!=` `<` `<=` `>` `>=`）、論理（`&&` `||` `!`）、算術（`+` `-` `*` `/`）、括弧

### sceneSetRotation の角度換算

- `sceneSetRotation` はラジアン入力を受け付ける（JS 版と合わせるため）
- Unity の `Transform.localEulerAngles` は度数法のため、内部で `radians * (180 / π)` 変換を行う

### Unity 向け未対応事項

以下は現バージョンでは Unity 側に実装しない：

- グラフ DSL パーサ
- ビジュアルエディタ
- WebSocket 本体実装
- Unity Package Manager 公開
