# Loom

[![Tests](https://github.com/afjk/loom/actions/workflows/test.yml/badge.svg)](https://github.com/afjk/loom/actions/workflows/test.yml)

A browser dataflow engine with stateless transforms and explicit time-based state nodes. Build reactive visual, audio, and 3D content by composing small graph parts.

---

ブラウザで動くデータフロー実行エンジン。純粋関数ノードを基本にしつつ、必要な箇所だけを `state` ノードとして明示し、リアクティブな視覚・音響・3D コンテンツを構築します。

## 設計思想

Loom は原則としてステートレスなデータフローを基本とし、時間的な追従・遅延・累積が必要な場合のみ、明示的な state ノード(explicit temporal state)に状態を隔離します。これにより graph JSON は宣言的・再現可能なまま保たれ、状態を持つ挙動も graph の中で可視化されます。

加えて、Source AST API（`parseDSLToAST` / `compileToGraph` / `formatDSL`）を公開しており、AI 補助編集・DSL formatter・ビジュアルエディタの基盤として利用できます。詳細は [SPEC.md の AST 章](docs/SPEC.md#astabstract-syntax-tree) を参照してください。

加えて、Editor Model API（`graphToEditorModel` / `editorModelToGraph` / `applyEditorOperation`）を公開し、Source AST と GraphJSON の上にノードエディタ向けの正規化層を追加しました。三層分離の詳細は [SPEC.md の Editor Model 章](docs/SPEC.md#editor-model) を参照してください。

```text
DSL → Source AST → GraphJSON → EditorModel → (将来) Rete 描画
                              ↑
      (将来) Rete 操作 → EditorModel → GraphJSON → Preview 実行
```

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

Loom は、データフロー思想に基づき、現在時刻と入力値だけから出力が決まる設計を基本とします。状態が必要な処理は state ノードに限定して局所化します。これにより：

- 任意のタイミングで同じ計算を再実行しても、同じ結果が得られる
- 動作が予測可能で、デバッグが容易
- ステートフルな追従や累積も、グラフ上で明示的に扱える
- クリエイティブコーダーと AI が共有できるテキスト表現を持つ

ことが実現されます。

## 設計原則

Loom の設計は、以下の 4 つの原則に基づいています。

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

## 詳細仕様

仕様の詳細は **[docs/SPEC.md](docs/SPEC.md)** をご覧ください。以下が含まれます：

- データフローモデル（連続値とイベント）
- ノード仕様（transform / input / state / sink）
- グラフ定義の JSON フォーマット
- 公開 API（Loom エンジンの使用方法）
- 評価モデル
- ロードマップ

state ノードとして、以下を同梱しています。

- `smoothLerp`: 目標値への時間ベース追従
- `lowpass`: 時定数ベースの平滑化
- `delay1`: 1 フレーム遅延
- `integrate`: 時間積分と min/max クランプ

## Unity 対応

Unity 向け C# ランタイムを `unity/com.afjk.loom` に追加しています。

Unity 版は JavaScript 版と同じ JSON グラフを評価します。  
グラフ DSL は Unity 側では直接扱わず、DSL をパースした後の JSON グラフを入力とします。

```text
Graph DSL → JSON graph → Web Loom / Unity Loom で評価
```

詳細は [docs/UNITY.md](docs/UNITY.md) を参照してください。



- **Three.js アダプタ** (`src/loom-three.js`): Three.js Object3D の制御
- **SceneSync アダプタ** (`src/loom-scenesync.js`): SceneSync メッセージプロトコルでの複数グラフ管理

詳細は [docs/SCENESYNC.md](docs/SCENESYNC.md) を参照してください。

## 使い方

第ゼロ段階の最小実装が `src/loom.js` にあります。

```html
<script type="module">
  import { Loom } from './src/loom.js';

  const graph = {
    nodes: [
      { id: "timer", type: "clock" },
      { id: "wave", type: "sine", params: { freq: 1.0 } }
    ],
    edges: [
      { from: "timer.t", to: "wave.t" }
    ]
  };

  const engine = new Loom(graph);
  engine.start();

  // 任意のタイミングで値を取得
  console.log(engine.getValue("wave.out"));
</script>
```

詳細な API・ノード仕様は [docs/SPEC.md](docs/SPEC.md) をご覧ください。

## CLI

Loom CLI は Loom DSL の最初のターミナルインターフェースです。CLI 自体に処理を閉じ込めず、`src/toolchain/` の compile / format / inspect / run を Web Studio / Scene Sync / AI toolchain からも再利用できる前提で追加しています。

現在の CLI は、Loom DSL を GraphJSON に変換し、整形し、要約を取り、単純な pure/source/transform/state グラフを 1 回実行する用途に向いています。

最小の import metadata と target validation もサポートしています。

```bash
npm run loom -- compile examples/cli-basic.loom
npm run loom -- format examples/cli-basic.loom
npm run loom -- inspect examples/cli-basic.loom
npm run loom -- run examples/cli-basic.loom --get x.out --time 1
npm run loom -- compile script.loom --target cli
npm run loom -- inspect script.loom --target web
node bin/loom.mjs run examples/cli-text.loom --get message.out
```

```bash
node bin/loom.mjs compile examples/cli-basic.loom
node bin/loom.mjs run examples/cli-basic.loom --get x.out --time 1
```

現時点の制約:

- CLI run は pure/source/transform/state ノード中心の実行にフォーカスしています。
- DOM / Three.js / Unity / SceneSync アダプタは CLI からは実行しません。
- file I/O ノードの実体、module loading、named/alias import は今後の作業です。

例:

```text
import math
import fs

x = constant(value: 1)
```

`compile` と `inspect` の `--target` は省略時に `any` として扱われ、runtime-specific import を generic workflow 用に許可します。`run` は省略時に `cli` で検証するため、たとえば `import dom` は CLI 実行時に失敗します。

初期の CLI-safe library nodes:

- `text.upper`, `text.lower`, `text.trim`, `text.replace`
- `json.parse`, `json.stringify`
- `console.log`, `console.warn`, `console.error`

### REPL

Start an interactive Loom session:

```bash
node bin/loom.mjs repl
```

Example:

```text
loom> import text
imported text
loom> message = text.upper("hello loom")
message.out = HELLO LOOM
loom> import console
imported console
loom> console.log(message)
[log] HELLO LOOM
loom> :source
import text
import console

message = text.upper("hello loom")
console.log(message)
loom> :quit
```

The REPL currently recompiles the accumulated source after each snippet. Invalid snippets are rejected and do not modify the current session.
Import snippets are hoisted into the import block automatically, so you can add imports later while exploring.
The REPL recompiles the accumulated source after each snippet, but it only displays effects introduced by the latest snippet.

### Scene Sync probe commands

Loom CLI includes read-only Scene Sync probe commands to interact with the afjk.jp AI wrapper.

#### Save a Scene Sync session

Redeem and save a Scene Sync AI link code:

```bash
node bin/loom.mjs scenesync redeem 301398 --save
```

Output:
```
Linked Scene Sync room.
Room: <roomId>
Session: saved to ~/.config/loom/scenesync-session.json
Expires At: <expiresAt>
```

Then use probe commands without passing a long session token:

```bash
node bin/loom.mjs scenesync ping
node bin/loom.mjs scenesync info
node bin/loom.mjs scenesync objects
```

Saved sessions are stored in `~/.config/loom/scenesync-session.json`. The session token is a secret and should not be committed to a repository.

#### Show saved session

```bash
node bin/loom.mjs scenesync session
```

or the alias:

```bash
node bin/loom.mjs scenesync status
```

#### Clear saved session

```bash
node bin/loom.mjs scenesync logout
```

#### List objects in a room

```bash
node bin/loom.mjs scenesync objects --room <roomId> --session <sessionId>
```

#### Get room information

```bash
node bin/loom.mjs scenesync info --room <roomId> --session <sessionId>
```

#### Check room connectivity

```bash
node bin/loom.mjs scenesync ping --room <roomId> --session <sessionId>
```

`ping` currently performs a lightweight scene snapshot request because the existing AI wrapper does not expose a dedicated ping endpoint.

#### Configure defaults

```bash
export LOOM_SCENESYNC_ROOM=<roomId>
export LOOM_SCENESYNC_SESSION=<sessionId>
export LOOM_SCENESYNC_ENDPOINT=https://afjk.jp/presence/api/ai

# Now you can omit --room and --session
node bin/loom.mjs scenesync objects
```

These commands are read-only. Sending Loom graphs to Scene Sync is planned for a later phase.

## ライブエディタと DSL

### エディタ一覧

| エディタ | URL | 特徴 |
|---|---|---|
| シンプル版 (`editor/`) | [editor/](https://afjk.github.io/loom/editor/) | 依存ゼロ・軽量・textarea ベース |
| **Pro 版** (`editor-pro/`) | [editor-pro/dist/](https://afjk.github.io/loom/editor-pro/dist/) | **補完・構文ハイライト・lint 付き、オーバーレイ UI** |
| **Studio MVP** (`editor-studio/`) | [editor-studio/dist/](https://afjk.github.io/loom/editor-studio/dist/) | **DSL + ノードエディタ並行編集 MVP** |

**シンプル版** はライブラリ依存ゼロで手軽に使えるテキストエリアベースのエディタです。

**Pro 版** は CodeMirror 6 ベースの高機能エディタで、以下の機能を備えています:
- 構文ハイライト（コメント・文字列・数値・キーワード・ノード名・識別子）
- 文脈依存の補完（ノード型、パラメータ名、定義済み識別子）
- パースエラー時の赤い波線 lint 表示
- デモを全画面背景に表示した半透明オーバーレイ UI
- ドラッグ・リサイズ対応、デスクトップ・タブレット・スマホで動作

ライブエディタ（`editor/index.html`）では **JSON** モードと **DSL** モードを切り替えてグラフを編集できます。

DSL（Domain Specific Language）は JSON より簡潔にグラフを記述するためのテキスト形式です。各代入文がノードに、識別子参照がエッジに自動変換されます。

```
# リサジュー曲線の DSL 例
timer = clock()
sineX = sine(timer, freq: 0.3)
cosineY = cosine(timer, freq: 0.5)
mapX = map(sineX, inMin: -1, inMax: 1, outMin: 100, outMax: 700)
mapY = map(cosineY, inMin: -1, inMax: 1, outMin: 50, outMax: 450)

render point(x: mapX, y: mapY, color: "#00ff00", trail: 0.05)
```

パイプ演算子 `|>` を使えば処理の流れをより直線的に書けます：

```
timer = clock()
x = timer |> sine(freq: 0.3) |> map(inMin: -1, inMax: 1, outMin: 100, outMax: 700)
```

詳細な仕様は **[docs/DSL.md](docs/DSL.md)** をご覧ください。

### Editor Studio

`editor-studio` は DSL と Rete.js v2 ノードエディタを左右に並べた協調編集スタジオです。

- GitHub Pages: https://afjk.github.io/loom/editor-studio/dist/

ローカル開発:

```bash
cd editor-studio
npm install
npm run dev
```

**機能：**
- DSL エディタ（CodeMirror）と **Rete.js v2 ノードエディタ** を左右2ペインで表示
- `Apply DSL → Node`: DSL をパースしてノードエディタに反映
- `Generate DSL ← Node`: ノードエディタから正規形 DSL を生成
- ノード操作：
  - ドラッグで移動
  - エッジの接続・削除
  - params の表示・編集
- Canvas preview：`render bar` / `render point` に対応（全画面表示）
- GraphJSON 表示 pane
- Errors pane
- Editor panels can be shown or hidden with the `Show/Hide Editors` button

**設計方針：**
- 手動同期: DSL ↔ Node は明示ボタン式（リアルタイム自動同期ではない）
- Node → DSL は正規形（元のコメント・書式は保持しない）
- EditorModel が single source of truth、Rete.js ノードエディタは view として扱う
- The node editor uses **Rete.js v2** as the visual editing layer

詳細は `editor-studio/src/` の実装と `test/loom-editor-studio.test.html` のテストを参照してください。

## デモの確認方法

GitHub Pages で公開されているデモを、ブラウザから直接確認できます。

* 基本デモ：https://afjk.github.io/loom/examples/01-basic.html
* 揺れる箱デモ：https://afjk.github.io/loom/examples/02-moving-box.html
* ポインタ追従デモ：https://afjk.github.io/loom/examples/03-pointer.html
* キー入力カウンタ：https://afjk.github.io/loom/examples/04-keydown.html
* シンクノードデモ：https://afjk.github.io/loom/examples/05-sink-box.html
* Three.js デモ：https://afjk.github.io/loom/examples/06-three-cube.html
* SceneSync モックデモ：https://afjk.github.io/loom/examples/07-scenesync-mock.html
* Lissajous 曲線：https://afjk.github.io/loom/examples/08-lissajous.html
* ポインタ軌跡：https://afjk.github.io/loom/examples/09-lerp-tween.html
* 位相ずらし波：https://afjk.github.io/loom/examples/10-multi-phase.html
* 色相循環 (Three.js)：https://afjk.github.io/loom/examples/11-color-cycle.html
* 円運動：https://afjk.github.io/loom/examples/12-circular-motion.html
* 範囲リマップ：https://afjk.github.io/loom/examples/13-clamp-map.html
* DOM Transform Sink デモ：https://afjk.github.io/loom/examples/14-dom-transform-sink.html
* Threshold Class Sink デモ：https://afjk.github.io/loom/examples/15-threshold-class-sink.html
* smoothLerp 追従デモ：https://afjk.github.io/loom/examples/16-smooth-pointer.html
* lowpass 平滑化デモ：https://afjk.github.io/loom/examples/17-jitter-free-trail.html
* integrate チャージゲージ：https://afjk.github.io/loom/examples/18-charge-gauge.html
* **ライブエディタ（シンプル版）**：https://afjk.github.io/loom/editor/
* **ライブエディタ（Pro 版）**：https://afjk.github.io/loom/editor-pro/dist/
* **Studio MVP**：https://afjk.github.io/loom/editor-studio/dist/
* テスト結果：https://afjk.github.io/loom/test/loom.test.html

ローカルで確認する場合は、ESM を使うため、ローカルファイル直接 (`file://`) ではなく HTTP サーバから配信する必要があります。

    # Python が入っていれば

    python3 -m http.server 8000

    # Node.js が入っていれば

    npx serve .

ブラウザで以下を開いてください。

* 基本デモ：`http://localhost:8000/examples/01-basic.html`

* 揺れる箱デモ：`http://localhost:8000/examples/02-moving-box.html`

* ポインタ追従デモ：`http://localhost:8000/examples/03-pointer.html`

* キー入力カウンタ：`http://localhost:8000/examples/04-keydown.html`

* シンクノードデモ：`http://localhost:8000/examples/05-sink-box.html`

* Three.js デモ：`http://localhost:8000/examples/06-three-cube.html`

* SceneSync モックデモ：`http://localhost:8000/examples/07-scenesync-mock.html`

* Lissajous 曲線：`http://localhost:8000/examples/08-lissajous.html`

* ポインタ軌跡：`http://localhost:8000/examples/09-lerp-tween.html`

* 位相ずらし波：`http://localhost:8000/examples/10-multi-phase.html`

* 色相循環 (Three.js)：`http://localhost:8000/examples/11-color-cycle.html`

* 円運動：`http://localhost:8000/examples/12-circular-motion.html`

* 範囲リマップ：`http://localhost:8000/examples/13-clamp-map.html`
* DOM Transform Sink デモ：`http://localhost:8000/examples/14-dom-transform-sink.html`
* Threshold Class Sink デモ：`http://localhost:8000/examples/15-threshold-class-sink.html`
* smoothLerp 追従デモ：`http://localhost:8000/examples/16-smooth-pointer.html`
* lowpass 平滑化デモ：`http://localhost:8000/examples/17-jitter-free-trail.html`
* integrate チャージゲージ：`http://localhost:8000/examples/18-charge-gauge.html`

* **ライブエディタ（シンプル版）**：`http://localhost:8000/editor/`
* **ライブエディタ（Pro 版）**：`http://localhost:8000/editor-pro/dist/`

* テスト：`http://localhost:8000/test/loom.test.html`

* SceneSync アダプタテスト：`http://localhost:8000/test/loom-scenesync.test.html`

## CI と自動テスト

Fast Node/unit tests:

```bash
npm test
# or
npm run test:unit
```

Browser tests:

```bash
npm run test:browser
```

GitHub Actions runs unit tests automatically for pull requests and pushes to `main`.
Browser tests are available as a manual GitHub Actions workflow and should be run when changing browser examples, renderer behavior, Web Studio, or DOM/Canvas-related code.

`src/loom.js` は依存ライブラリゼロの単一ファイル配布であり、`package.json` は開発用ツール（Playwright、http-server）と CLI / toolchain 用テストを含みます。

## ライセンス

MIT License
