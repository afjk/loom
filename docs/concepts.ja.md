# 設計ノート（日本語）

このドキュメントは、root README から移設した日本語の設計・背景メモを保持するためのものです。

ブラウザで動くデータフロー実行エンジン。純粋関数ノードを基本としつつ、必要な箇所だけを `state` ノードとして明示し、リアクティブな視覚・音響・3D コンテンツを構築します。

## 設計思想

Loomlet は原則としてステートレスなデータフローを基本とし、時間的な追従・遅延・累積が必要な場合のみ、明示的な state ノード(explicit temporal state)に状態を隔離します。これにより graph JSON は宣言的・再現可能なまま保たれ、状態を持つ挙動も graph の中で可視化されます。

加えて、Source AST API（`parseDSLToAST` / `compileToGraph` / `formatDSL`）を公開しており、AI 補助編集・DSL formatter・ビジュアルエディタの基盤として利用できます。詳細は [SPEC.md の AST 章](SPEC.md#astabstract-syntax-tree) を参照してください。

加えて、Editor Model API（`graphToEditorModel` / `editorModelToGraph` / `applyEditorOperation`）を公開し、Source AST と GraphJSON の上にノードエディタ向けの正規化層を追加しました。三層分離の詳細は [SPEC.md の Editor Model 章](SPEC.md#editor-model) を参照してください。

```text
DSL → Source AST → GraphJSON → EditorModel → Rete 描画
                              ↑
      Rete 操作 → EditorModel → GraphJSON → Preview 実行
```

## 表現レイヤーと役割

Loomlet は、`.loom` のテキスト、ノードエディタ、ランタイム実行、ホスト連携を同じものとして無理に扱わず、用途ごとに複数の表現へ分けます。

これは冗長に見えますが、それぞれに必要な情報が違うためです。

```text
DSL Source
  ↓ parse
Source AST
  ↓ lower / normalize
Graph AST
  ↓ compile
Runtime Graph
  ↓ adapt
Target Graph
```

Node Editor は `Graph AST` を表示・編集し、レイアウトや選択状態などの UI 情報は `Node Editor ViewModel` として別に持ちます。

| 表現 | 主な役割 | 人間 | AI | ランタイム | ノードエディタ |
|---|---|---:|---:|---:|---:|
| DSL Source | `.loom` テキスト。人間・AI・Git が扱う正本 | ◎ | ◎ | × | △ |
| Source AST | DSL の構文情報。コメント、raw literal、source range を保持 | × | △ | × | △ |
| Graph AST | ノード、ポート、エッジ、params、source map を持つ編集向け中間表現 | ○ | ◎ | △ | ◎ |
| Runtime Graph | 実行に必要な最小グラフ。評価器が読む形式 | △ | ○ | ◎ | △ |
| Target Graph | Scene Sync / Unity / Web など各ホスト向けに変換された形式 | △ | ○ | host側 | △ |
| Node Editor ViewModel | ノード位置、選択、zoom、pan など UI 状態 | △ | × | × | ◎ |

### なぜ複数の表現が必要か

`DSL Source` は人間と AI が読み書きしやすく、Git diff でも扱いやすい正本です。一方で、ランタイムがそのまま実行するには構文情報やコメントが多すぎます。

`Source AST` は、DSL を安全に編集するための構文表現です。コメント、元の数値表記、名前付き引数、source range などを保持します。ノードエディタや AI が DSL を壊さずに書き換えるために使います。

`Graph AST` は、ノードエディタと AI が構造を理解するための中間表現です。ノード、ポート、エッジ、params、source map を持ち、たとえば `math.sine` の `freq` だけを安全に変更する、といった編集を可能にします。

`Runtime Graph` は、実行に必要な情報だけを持つ最小表現です。Loomlet runtime は基本的にこれを評価します。コメントやエディタ用情報は含めません。

`Target Graph` は、Scene Sync、Unity、Web runtime など、実行先の世界に合わせた形式です。たとえば Scene Sync では Loomlet の Runtime Graph を Scene Sync behavior graph に変換して送信します。

`Node Editor ViewModel` は、表示上の状態です。ノードの座標、選択状態、zoom、pan などはプログラムの意味とは別なので、DSL や Runtime Graph とは分離します。

### AI とノードエディタの扱い

AI が主に扱うのは `DSL Source` と `Graph AST` です。

- 実際に編集する正本は `DSL Source`
- 構造理解や編集計画には `Graph AST`
- 実行確認には `Runtime Graph` / `Target Graph`
- UI 状態である `Node Editor ViewModel` は基本的に AI には扱わせない

この分離により、人間、AI、ノードエディタ、ランタイムが同じ Loomlet プログラムを扱いながら、それぞれに適した形式を使えます。

## Node categories

| Category | 説明 | 例 |
|---|---|---|
| `source` | 入力なしで値を生成するカテゴリ | `clock`, `constant` |
| `input` | 外界から値やイベントを受け取るカテゴリ | `pointerPosition`, `pointerClick`, `keyDown` |
| `transform` | ステートレスな純粋変換を行うカテゴリ | `sine`, `add`, `map`, `clamp` |
| `state` | 前フレーム値と `dt` を保持する特例カテゴリ。明示的な temporal state。詳細は SPEC.md の「State nodes」章参照 | `smoothLerp`, `lowpass`, `delay1`, `integrate` |
| `sink` | 副作用を外部に反映するカテゴリ | `setStyle`, `setText`, `log` |

## ステータス

**第一段階：プロトタイプ実装完了、仕様確定**

第ゼロ段階と第一段階に加え、時間ベース state ノード（`smoothLerp`, `lowpass`, `delay1`, `integrate`）を実装済みです。仕様書はクロスプラットフォーム評価セマンティクスを維持したまま、明示的な状態管理層を持つ形に拡張されています。

## 背景・モチベーション

アート、インタラクティブ作品、ゲームなどのリアルタイムなコンテンツでは、視覚・音響・3D 空間の変化を時々刻々と計算する必要があります。こうしたシステムは状態管理が複雑になりがちで、デバッグや再現が難しいという課題があります。

Loomlet は、データフロー思想に基づき、現在時刻と入力値だけから出力が決まる設計を基本とします。状態が必要な処理は state ノードに限定して局所化します。これにより：

- 任意のタイミングで同じ計算を再実行しても、同じ結果が得られる
- 動作が予測可能で、デバッグが容易
- ステートフルな追従や累積も、グラフ上で明示的に扱える
- クリエイティブコーダーと AI が共有できるテキスト表現を持つ

ことが実現されます。

## 設計原則

Loomlet の設計は、以下の 4 つの原則に基づいています。

1. **ステートレスを基本とする**  
   状態（過去を引きずる値）を持たず、現在時刻と入力だけから出力が決まる純粋なデータフローを基盤とします。これにより、誰が計算しても同じ結果になり、マルチプレイの同期が単純になります。

2. **状態が必要な部分は明示的に局在化する**  
   「状態部品」という限定された種類の部品にだけ状態を持たせ、グラフ上で目に見える形で管理します。状態を持つ部品はカテゴリとして明確に区別されます。

3. **副作用を出口側に集める**  
   外部への副作用（位置や色を変える、音を鳴らす、メッセージを送るなど）は「シンク」専用部品でのみ行います。中間の計算は副作用を持ちません。

4. **テキスト表現とビジュアル表現の二重持ち**  
   内部はテキストの専用記法（DSL）で持ち、UI はそれを視覚化します。両方向に変換可能で、人間も AI も自由に行き来できます。ただし第ゼロ段階では、DSL とビジュアル UI は実装せず、JSON 直書きから始めます。

## 第ゼロ段階のスコープ

第ゼロ段階では、以下のみを対象とします。

**実装対象：**
- 評価器の中核（JSON グラフを受け取り、毎フレーム値を計算）
- ノード 5 種類：`clock`、`constant`、`sine`、`add`、`multiply`
- ブラウザ環境
- JSON でグラフ定義、API で値を取得
- ESM 形式の単一ファイル配布
- 依存ライブラリゼロ

**実装外（第一段階以降）：**
- テキスト記法（DSL）とパーサ
- ビジュアルノードエディタ
- イベント型ノード
- 状態部品
- シンク部品
- マルチプレイ機能
- AI 連携ツール定義
- Three.js などのアダプタ

## Unity 対応

Unity 向け C# ランタイムを `unity/com.afjk.loom` に追加しています。

Unity 版は JavaScript 版と同じ JSON グラフを評価します。  
グラフ DSL は Unity 側では直接扱わず、DSL をパースした後の JSON グラフを入力とします。

```text
Graph DSL → JSON graph → Web Loom / Unity Loom で評価
```

詳細は [UNITY.md](UNITY.md) を参照してください。

## Node Editor と DSL

### エディタ一覧

| エディタ | URL | 特徴 |
|---|---|---|
| フル版 Node Editor (`editor-studio/`) | [node-editor/](https://afjk.github.io/loomlet/node-editor/) | CodeMirror DSL editor + Rete.js Node Editor による並行編集 |

**フル版 Node Editor** は CodeMirror 6 ベースの DSL editor と Rete.js v2 ベースの Node Editor を組み合わせた実験的なエディタです。

DSL（Domain Specific Language）は JSON より簡潔にグラフを記述するためのテキスト形式です。各代入文がノードに、識別子参照がエッジに自動変換されます。Loomlet source files use the `.loom` extension.

```loom
# リサジュー曲線の DSL 例
timer = clock()
sineX = sine(timer, freq: 0.3)
cosineY = cosine(timer, freq: 0.5)
mapX = map(sineX, inMin: -1, inMax: 1, outMin: 100, outMax: 700)
mapY = map(cosineY, inMin: -1, inMax: 1, outMin: 50, outMax: 450)

render point(x: mapX, y: mapY, color: "#00ff00", trail: 0.05)
```

パイプ演算子 `|>` を使えば処理の流れをより直線的に書けます：

```loom
timer = clock()
x = timer |> sine(freq: 0.3) |> map(inMin: -1, inMax: 1, outMin: 100, outMax: 700)
```

詳細な仕様は [DSL.md](DSL.md) を参照してください。

## Scene Sync 関連の概要

- **SceneSync アダプタ** (`src/loom-scenesync.js`): SceneSync メッセージプロトコルでの複数グラフ管理
- **Three.js アダプタ** (`src/loom-three.js`): Three.js Object3D の制御

Node Editor から Scene Sync への Behavior Graph 送信プロトタイプ（`scene-graph-set` / `scene-graph-clear`）をサポートしています。現状は REST broadcast ベースの試験実装です。

詳細は以下を参照してください。

- [Scene Sync integration guide](scene-sync.md)
- [SCENESYNC.md](SCENESYNC.md)
- [SCENESYNC demos](SCENESYNC_DEMOS.md)
