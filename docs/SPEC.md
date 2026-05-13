# Loomlet の設計思想

Loomlet は、結果ではなく関係を記述する。

Loomlet graph は、環境から出力を導くためのシリアライズ可能な定義である。  
graph 自体は、決定論的な関係として扱う。つまり、同じ環境と同じ評価規則が与えられれば、同じ出力を生成するべきである。

言い換えると、次の原則が成り立つ。

同じgraph + 同じenvironment + 同じ評価規則 = 同じ出力

この原則が Loomlet の設計判断の土台である。

ただし、Loomlet はすべての host behavior を完全に決定論的にすることを目的としない。  
物理、デバイス入力、描画、AI サービス、乱数、外部 API など、host 固有または非決定的な処理は、environment input または同期済み result として扱う。

Loomlet の役割は、同期済み environment から、決定論的に記述できる振る舞いを各 runtime が再現できるようにすることである。

## 3 層モデル

Loomlet は振る舞いを次の 3 つの層に分離する。

1. Graph
2. Environment
3. Runtime

### Graph

Graph は、値、イベント、状態、出力の関係を記述する。

Graph はホスト言語のコードではなく、データである。  
Graph が JSON として表現されることで、シリアライズ、送信、ランタイム編集、AI 生成、ノードとしての可視化、そして Web、Unity、Godot など複数のホスト環境での実行が可能になる。

Graph は、可能な限り決定論的で、副作用を持たない状態に保つべきである。

### Environment

Environment は、graph を評価するために外部から与えられる入力を含む。

Environment には次のものが含まれる。

- 共有 clock によって同期された時刻
- 入力値
- 入力イベント

例として、スライダー値、ボタン押下、乗り物の発車イベント、プレイヤー操作、ページ送り、その他 graph に注入される外部シグナルがある。

Environment は graph から分離される。

この分離が重要である。Loomlet は、計算済みのすべての結果を同期する必要はない。  
代わりに、Loomlet は environment を同期する。すべてのクライアントが同じ graph を同じ environment で評価すれば、各クライアントは同じ結果を独立に計算できる。

### Runtime

Runtime は、graph を environment に対して評価し、その結果として得られた出力をホストシステムに適用する。

Runtime は次の責務を持つ。

- ノードを評価する
- 決定論的な評価規則を維持する
- 明示的な state ノードを管理する
- 出力を host scene や application に適用する
- graph の出力を DOM、Unity Transform、Godot Node など、host 固有の API に対応づける

Web、Unity、Godot など複数の runtime が存在し得るが、それらは同じ評価規則に従うべきである。

## Scene-level graph と Object-level graph

Loomlet graph は、scene 全体に対して持つことも、個別の scene object に attach することもできる。

### Scene-level graph

Scene-level graph は、scene 全体の状態や object 間の関係を記述する。

例:

- game state
- scene phase
- score
- page index
- button と door の関係
- ride start event と乗り物 object の関係
- 全体イベントの routing

Scene-level graph は、object 間の橋渡しを担当する。

たとえば、button object が押されたとき、door object を開くという関係は、button object や door object の内部に直接埋め込むのではなく、scene-level graph に記述できる。

### Object-level graph

Object-level graph は、個別 object の振る舞いを記述する。

例:

- self の position / rotation / scale の制御
- open / close animation
- idle animation
- patrol movement
- projectile motion
- local reaction

Object-level graph は、基本的に自分自身の振る舞いを記述する。  
他 object を直接変更するのではなく、environment event、scene-level graph、または output command を通じて関係を扱う。

同じ graph は、異なる object context と environment で評価することで、多数の object に再利用できる。

たとえば、100 個の bullet object が存在する場合でも、それぞれに同じ bullet motion graph を attach し、spawnTime、initialPosition、direction、speed などの environment だけを変えて評価できる。

このモデルにより、Loomlet core が動的に N 個の object を graph 内で直接管理する必要を減らせる。  
Object の生成、削除、識別子、graph attachment は SceneSync または host 側が管理する。

## 同期モデル

Loomlet は、連続的な結果ではなく原因を同期する。

オブジェクトの位置、回転、アニメーション値、その他の計算済み出力を毎フレーム broadcast する代わりに、Loomlet は environment を同期することを優先する。

- 入力イベントは、発生したときに environment event として同期する
- 入力値は、変化したときに environment value として同期する
- 時刻は、同期された clock に基づく

連続的な振る舞いは、各クライアントがローカルで計算する。

例:

- ページ送りイベントを同期し、スライドアニメーションはローカルで計算する
- 発射イベントを同期し、弾の軌道はローカルで計算する
- 乗り物の発車イベントを同期し、乗り物の移動はローカルで計算する
- ボタン押下を同期し、その結果としての振る舞いはローカルで計算する

これにより、通信量を減らし、振る舞いの再生、デバッグ、再現を容易にする。

## Local input と Committed environment event

Loomlet が読むべき入力は、生の local input ではなく、同期対象として確定した environment event である。

たとえば、マルチプレイで一人のプレイヤーがボタンを押した場合、local device はまず local input を検出する。  
しかし、door を開く、ride を開始する、score を加算するなど、scene の共有状態に影響する処理は、同期済み environment event に基づいて行うべきである。

推奨される流れは次の通りである。

1. プレイヤーの端末が local input を検出する
2. SceneSync または host authority に event request を送る
3. SceneSync または host authority が committed environment event として確定する
4. 確定済み event を全クライアントの environment に配信する
5. Scene-level graph が object 間の関係を評価する
6. 各 object-level graph が自分の振る舞いを計算する

Environment event には、少なくとも次の情報を含めるべきである。

- event id
- channel
- timestamp
- source player id
- target object id
- payload

同期において重要なのは、全クライアントが同じ event set、同じ event order、同じ timestamp、同じ payload を観測できることである。

ただし、local feedback は committed event を待たずに表示してもよい。  
たとえば、ボタンが押された瞬間の軽いアニメーション、音、ハイライト、触覚 feedback などは local input に基づいて即時に出せる。

共有状態に影響する committed behavior と、操作感のための local feedback は分けて扱う。

## 評価モデル

Loomlet runtime は、object-level graph 間で評価順に依存する振る舞いを避けるべきである。

各 evaluation tick において、runtime は次の順序で処理する。

1. environment snapshot を取得する
2. すべての対象 Loomlet graph を、その snapshot に対して評価する
3. host scene を即座に変更せず、output command を収集する
4. 決定論的なルールで output の競合を解決する
5. 収集した output を host scene に適用する

Object-level graph は、同じ tick 内で他の object-level graph が生成した output を観測しないべきである。  
観測できるのは、前回 commit 済みの environment / scene state、または現在 tick の同期済み environment snapshot である。

この方式を次のように表せる。

snapshot → evaluate → collect outputs → resolve conflicts → apply

この評価モデルにより、object の評価順が結果に影響することを避ける。

## behavior と event ポートのセマンティクス

Loomlet のポートは payload の型とは別に、signal kind（port kind）を持つ。

### Port kind

現在の想定 port kind は次の 2 種である。

- `behavior`
- `event`

port kind と payload 型は独立であり、次のように組み合わせられる。

```text
behavior<number>
behavior<vec3>
event<void>
event<vec2>
event<string>
```

### behavior

`behavior` は current-value signal であり、各 evaluation tick ごとに 1 つの値を持つ。

例:

- clock time
- pointer position
- slider value
- object position
- computed number
- computed vector

`behavior` の値は、連続的な animation や current state の表現に適する。

### event

`event` は discrete signal であり、特定の evaluation tick の間に 0 個以上の payload を持つ。

- その tick で何も起きなければ空の event list
- payload は値として扱う（number / string / vec2 / vec3 / record など）

例:

- pointer click
- key down
- collision
- trigger
- drag/drop event
- committed SceneSync event

### Connection rules

port kind の接続ルールは次を基本とする。

```text
behavior output -> behavior input: allowed
event output    -> event input: allowed
behavior output -> event input: not allowed by default
event output    -> behavior input: not allowed by default
```

kind mismatch の直接接続は、明示的に変換セマンティクスを定義する node がない限り reject すべきである。

`behavior` と `event` を橋渡しする場合は、変換 node を明示的に使う。

- `sample`: event trigger + behavior value -> event payload
- future `hold`: event -> behavior
- future `changed`: behavior -> event
- future `toggle`, `count`, `fold`, `stateMachine`

### Evaluation tick における event の扱い

semantic model として、各 tick で event は次のように扱う。

1. tick 処理前に event 出力を空にリセットする
2. queue 済みまたは inject された event をその tick で利用可能にする
3. tick 後、event は current value として保持しない（保持したい場合は state / hold / fold などの明示 node で捕捉する）

### State と determinism

event を含む評価でも、次の決定論モデルを維持する。

同じ graph + 同じ environment + 同じ評価規則 = 同じ出力

同期シーンでは、event order / timestamp / source / payload を同期済み environment に含める必要がある場合がある。  
ただし、これらの詳細フィールドは現時点では host ・ 同期レイヤー側の設計課題であり、本仕様で必須フィールドとして固定しない。

### 既存 node の概念上の役割

- `clock`: behavior source
- `pointerPosition`: behavior input/source
- `pointerClick`: event input/source
- `keyDown` / `keyUp`: event input/source
- `filter`: event transform
- `merge`: event transform
- `sample`: behavior/event bridge

### Future work

- formal event payload envelope
- timestamp/order/source semantics
- event replay
- event-to-behavior conversion nodes
- behavior-to-event conversion nodes
- Node Editor での behavior/event port の視覚的区別

## Output の競合

同じ property に対して複数の graph が同時に output を生成すると、結果が曖昧になる。

例:

- graph A が cube.position を書く
- graph B も cube.position を書く

このような競合は避けるべきである。

基本方針として、Loomlet runtime は single writer rule を採用することが望ましい。

つまり、1 つの property に対して書き込める graph は原則として 1 つにする。

他 object に影響を与えたい場合は、その object の Transform を直接書き換えるのではなく、environment event、command、または scene-level graph を通じて依頼する。

例:

- door.position を外部 graph が直接書くのではなく、door.open event を送る
- bullet が enemy を直接 destroy するのではなく、hit event を発生させる
- button が door を直接操作するのではなく、scene-level graph が button.pressed から door.open を導く

## Spawn / Delete

Object の生成や削除は、graph 評価中に即座に反映しない方がよい。

推奨される扱いは次の通りである。

1. graph は spawn / delete command を生成する
2. runtime は command を収集する
3. tick の commit 段階で object を生成または削除する
4. 新しく生成された object の graph は、次の tick から評価する

これにより、同じ tick 内で生成順や評価順に依存する挙動を避けられる。

Projectile など、生成された瞬間から進行しているように見せたい object では、spawnTime を environment に含める。  
Object-level graph は serverTime - spawnTime を使って現在位置を計算できる。

## Loomlet tick と host frame

Loomlet runtime は、host frame ごとに 1 回だけ graph を評価する必要はない。

Host の frame loop と Loomlet の evaluation tick は、異なる周期で動作してよい。  
決定論的な振る舞いのために、Loomlet は同期された時刻に基づく固定 timestep で評価されるべきである。

Runtime は、現在の同期時刻に追いつくために、1 つの host frame 内で Loomlet を複数回評価してよい。

Unity の場合、Unity Update と Loomlet tick は次のように分離できる。

- Unity Update は、入力収集、output 適用、描画反映を担当する
- Loomlet tick は、決定論的な graph 評価を担当する

推奨される評価モデルは次の通りである。

1. 入力値と入力イベントを timestamp 付きで収集する
2. 固定 timestep で Loomlet を進める
3. immutable な environment snapshot に対して graph を評価する
4. output command を収集する
5. host main thread 上で、最新または補間された output を host scene に適用する

Loomlet の graph 評価中に host object を直接変更してはならない。  
Host の変更は、収集された output command を適用する段階でのみ行うべきである。

Unity の Transform、GameObject、Renderer などの Unity API は、原則として Unity main thread 上で扱う。  
Loomlet の評価を worker thread 化する場合でも、worker thread は純粋な graph 評価と output command 生成に限定し、Unity API への反映は main thread で行う。

## 決定論の要件

Environment 同期モデルが成立するためには、Loomlet の評価が決定論的である必要がある。

そのため、Loomlet は次のルールに従うべきである。

- 純粋な計算ノードは、隠れた副作用を持たない
- state を持つ振る舞いは、明示的な state ノードとして表現する
- state ノードは安定した識別子を持つ
- 時刻に依存する振る舞いは、ローカルの wall-clock time ではなく、同期された時刻を使用する
- 入力イベントは timestamp を持つ
- 評価順序は明確に定義する
- graph 評価中に host object を直接変更しない
- host 固有の振る舞いは runtime 境界に隔離する
- 非決定的な処理や外部副作用を、通常の graph ノードの中に隠さない

この中心原則をより厳密に書くと、次のようになる。

同じ graph + 同じ environment + 同じ評価規則 = 同じ出力

## State と副作用

Loomlet の多くのノードは、純粋な関係ノードであるべきである。

state を持つ振る舞いは許可するが、それらは明示的でなければならない。  
例として、delay、previous-value、accumulator、low-pass filter、state-machine ノードなどがある。

副作用は output 境界に隔離するべきである。

つまり Loomlet は、次のものを区別するべきである。

- 値を計算すること
- output command を生成すること
- その command を host scene に適用すること

Graph は、何が起きるべきかを記述する。  
Runtime は、それを host 環境にどう適用するかを決定する。

## 結果同期を fallback として扱う

すべてを Loomlet の決定論的モデルに押し込むべきではない。

一部の振る舞いは、host 固有のシステム、物理エンジン、外部サービス、AI 生成、乱数、デバイス固有データ、その他の非決定的な処理に依存する場合がある。

そのような場合、SceneSync または別の host 同期レイヤーが、結果を直接同期してよい。

実用上、Loomlet と SceneSync は次の 2 種類の同期戦略を併用できる。

1. 決定論的な Loomlet の振る舞いには environment 同期を使う
2. host 固有または非決定的な振る舞いには result 同期を使う

Loomlet は、決定論的な関係として記述できる振る舞いに使う。  
SceneSync は、外部結果として同期する必要がある振る舞いを扱う。

例:

- Unity physics の衝突判定結果
- host authority によって確定された hit event
- AI サービスによって生成された結果
- 外部 API の応答
- device 固有の入力や tracking 結果
- 完全な決定論を保証できない random source

これらは Loomlet graph 内に隠すのではなく、environment input または同期済み result として扱う。

## まとめ

Loomlet は、Arrowized FRP に着想を得た、シリアライズ可能な振る舞い graph システムである。

Loomlet は関係を JSON として記述し、environment を分離し、その environment をクライアント間で同期し、各 runtime が結果を独立に計算する。

Scene-level graph は object 間の関係を記述する。  
Object-level graph は個別 object の振る舞いを記述する。  
Runtime は immutable な environment snapshot に対して graph を評価し、output command を収集し、host scene に適用する。

Loomlet の役割は、同期可能な振る舞いを記述することである。  
SceneSync の役割は、environment を同期し、object の生成・削除・識別子・graph attachment を管理し、必要に応じて外部結果を同期することである。

Arrowized FRP や Yampa などの背景概念については、Appendix: Influences を参照する。

# Loomlet 仕様書

## 現在の実装状態

Loomlet はまだ experimental だが、以下のワークフローは実装済みである。

- `.loom` DSL の parser/compiler
- JavaScript runtime
- CLI による compile / format / inspect / run / REPL
- Scene Sync graph compile / run / dev workflow（redeem / saved session / objects probe / graph-compile / graph-run / dev-watch）
- Editor Studio による CodeMirror DSL editor と Rete.js Node Editor の並行編集
- EditorModel / node-editor-core によるノード編集モデル
- hidden editor metadata によるノード位置・label・comment の保存
- Editor Studio の Undo/Redo、Node search/focus、Save/Open
- VS Code拡張による syntax highlighting / metadata-driven completion / parse・compile diagnostics
- `@afjk/loomlet` としての npm package boundary

ただし、API とデータ形式はまだ変更される可能性がある。

## アーキテクチャ

### レイヤー構成

Loomlet は、Core、拡張パック、統合プロダクトの 3 層で構成される。

#### Layer 1: Core

Core はホストに依存しない言語処理系である。

**Core に含めるもの:**

- DSL
- Parser
- Source AST
- Graph AST
- Runtime Graph
- 純粋ランタイム
- 純粋ライブラリ
- state ノード
- 汎用 input / output 抽象

**Core に含めないもの:**

- Scene Sync 固有 API
- DOM 操作
- Unity / Godot 固有 API
- OSC / MIDI / WebSocket / HTTP などの具体的な I/O
- ファイルシステムへの直接依存

Core は、外部世界への副作用を直接実行しない。

Core は `@afjk/loomlet` package として共有できるように public exports を整理中である。

現在の主な export 対象:

- runtime
- DSL parser/compiler
- node editor core
- editor metadata helpers
- canonical DSL helpers
- generated library metadata

ただし、npm 公開と package 安定化はまだ進行中である。

#### Layer 2: 拡張パック

拡張パックは、ホスト固有の source / sink / adapter を提供する薄いレイヤーである。

例:

- loomlet-web
- loomlet-scenesync
- loomlet-osc
- loomlet-unity
- loomlet-godot
- loomlet-fs
- loomlet-console

拡張パックは、`scene.setPosition` や `dom.setText` のような使いやすいノードを提供してよい。ただし、それらは Core そのものではなく、ホスト I/O への変換として扱う。

#### Layer 3: 統合プロダクト

統合プロダクトは、Core と拡張パックを組み合わせてユーザーが使える形にしたものである。

例:

- Loomlet CLI
- Loomlet REPL
- VS Code 拡張
- Web Studio
- Scene Sync 連携
- afjk.jp 上の実験的ツール

統合プロダクトは、UI、保存、ネットワーク、デプロイ、ホスト固有の UX を持ってよい。

### 表現パイプライン

Loomlet は、`.loom` テキスト、ノードエディタ、ランタイム実行、ホスト連携を同じ形式で無理に扱わない。

用途ごとに次の表現へ分ける。

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

Node Editor は `Graph AST` を表示・編集し、座標や選択状態などの UI 情報は `EditorModel / Node Editor ViewModel` として別に持つ。

| 表現 | 主な役割 | 人間 | AI | ランタイム | ノードエディタ |
|---|---|---:|---:|---:|---:|
| DSL Source | `.loom` テキスト。人間・AI・Git が扱う正本 | ◎ | ◎ | × | △ |
| Source AST | DSL の構文情報。コメント、raw literal、source range を保持 | × | △ | × | △ |
| Graph AST | ノード、ポート、エッジ、params、source map を持つ編集向け中間表現 | ○ | ◎ | △ | ◎ |
| Runtime Graph | 実行に必要な最小グラフ。評価器が読む形式 | △ | ○ | ◎ | △ |
| Target Graph | Scene Sync / Unity / Web など各ホスト向けに変換された形式 | △ | ○ | host 側 | △ |
| EditorModel / Node Editor ViewModel | ノード位置、選択、zoom、pan など UI 状態 | △ | × | × | ◎ |

#### 各表現の役割

`DSL Source` は正本である。人間と AI が読み書きしやすく、Git diff でも扱いやすい。

`Source AST` は、DSL を安全に編集するための構文表現である。コメント、元の数値表記、名前付き引数、source range などを保持する。

`Graph AST` は、ノードエディタと AI が構造を理解するための中間表現である。ノード、ポート、エッジ、params、source map を持つ。

`Runtime Graph` は、実行に必要な情報だけを持つ最小表現である。Loomlet runtime は基本的にこれを評価する。

`Target Graph` は、Scene Sync、Unity、Web runtime など、実行先の世界に合わせた形式である。

`EditorModel / Node Editor ViewModel` は、表示上の状態である。ノード座標、選択状態、zoom、pan などはプログラムの意味とは別なので分離する。

現在の実装では、ノードエディタ向けの共有表現として `EditorModel` を使用する。  
`EditorModel` は `Runtime Graph` とは異なり、ノードの編集に必要な情報を含む。  
ただし、ノード位置・label・comment などの実行に不要な情報は `hidden editor metadata` として保存し、Runtime Graph の意味には含めない。

### ホストI/Oモデル

ホストとは、Loomlet Core を載せて動かす外側の実行環境である。

例:

- CLI
- Web ブラウザ
- Scene Sync
- Unity
- Godot
- Node.js
- VS Code 拡張
- Web Studio
- OSC / MIDI 機器

Core はホスト固有の副作用を直接実行しない。

Core は次のような境界 API を通じてホストとやり取りする。

```text
setInput(channel, value)
emitEvent(channel, event)
getOutput(channel)
onOutput(channel, callback)
```

#### 入力

ホストは、現在値やセンサー値を `setInput` で Core に渡す。

例:

- pointer position
- keyboard state
- Scene Sync object state
- Unity Transform
- OSC value
- time value

#### イベント

ホストは、一回性のイベントを `emitEvent` で Core に渡す。

例:

- click
- keyDown
- trigger enter
- OSC message
- Scene Sync event

#### 出力

Core は、外の世界に反映したい結果を output として生成する。

例:

```json
{
  "channel": "scene.position",
  "objectId": "cube",
  "value": [1, 0, 0]
}
```

実際の副作用は Core ではなく、拡張パックまたは host adapter が実行する。

例:

- `loomlet-scenesync` は `scene.position` output を Scene Sync の `scene-delta` に変換する
- `loomlet-unity` は同じ output を Unity の `Transform.position` に反映する
- `loomlet-web` は DOM output を `HTMLElement` に反映する

このモデルにより、同じ Loomlet graph を複数のホストへ移植しやすくする。

### ノードエディタの編集方針

`.loom` の DSL Source を正本とする。

ノードエディタは、DSL から生成された `Graph AST` を表示・編集する UI である。ノードエディタ独自の保存形式を正本にはしない。

#### 基本方針

- DSL Source を parse して Source AST を作る
- Source AST を lower / normalize して Graph AST を作る
- Node Editor は Graph AST を表示する
- 編集可能な操作は、Graph AST の source map を使って DSL Source への patch として適用する
- レイアウトや選択状態は Node Editor ViewModel に分離する

#### 編集レベル

最初から完全な双方向変換を目指さず、編集可能範囲を段階的に広げる。

```text
Level 1: 数値リテラル編集
Level 2: 文字列 / boolean / objectId 編集
Level 3: ノード名 / 変数名変更
Level 4: sink ノード追加
Level 5: compute ノード追加
Level 6: edge 再接続
Level 7: 任意の Graph AST から DSL を再生成
```

当初は Level 1〜2 から始める方針だったが、現在の Editor Studio では、param 編集、node 追加/削除/rename、connection 編集、canonical DSL 再生成、Graph → DSL auto sync まで実験的に実装している。

ただし、任意の DSL 構文を完全に保持したまま双方向編集することは、まだ保証しない。  
Graph 側の編集は、必要に応じて canonical DSL として再生成される。

source map を使った最小差分 patch（Level 1〜6 相当）は設計思想として残すが、現在の実装では canonical regeneration を主経路としている。

例:

```loom
x = math.sine(t, freq: 0.2, amplitude: 2, offset: 0)
```

`freq` をノードエディタで `0.5` に変更した場合、現在の実装では canonical DSL を再生成する（source map patch ではなく）。

```loom
x = math.sine(t, freq: 0.5, amplitude: 2, offset: 0)
```

また、DSL 変更時には layout preservation により、可能な範囲でノード位置を保持する。

この方針により、DSL の可読性、Git diff、AI 編集、ノードエディタの操作性を両立する。

### Hidden editor metadata

Editor Studio は、ノード位置・label・comment など、実行意味に影響しない編集情報を hidden editor metadata として `.loom` ファイル内に保存する。

この metadata は Runtime Graph の意味には含めない。

現在の方針:

- visible DSL には metadata を表示しない
- Save 時に metadata を末尾へ付与する
- Open 時に metadata を読み取り、EditorModel へ反映する
- 重複 metadata は作らない
- metadata が壊れていても、可能な限り DSL 本体は読み込む

metadata の詳細形式は今後変更される可能性があるため、固定しすぎない。

## 1. 概要

Loomlet は、ブラウザで動く**ステートレスなデータフロー実行エンジン**です。JSON でグラフを定義し、毎フレーム値を計算・更新します。

**英語での一行説明：**
> A stateless dataflow engine for the browser. Build reactive visual, audio, and 3D content by composing pure functions.

**日本語での説明：**

ブラウザで動くステートレスなデータフロー実行エンジン。純粋な関数の合成により、リアクティブな視覚・音響・3D コンテンツを構築します。

Loomlet の核は、以下の仕組みです：

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

**注意：** 当初（第ゼロ段階）は DSL とビジュアル UI を実装せず JSON 直書きから始めたが、現在は DSL parser/compiler と Editor Studio が実装済みである。

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

当初（第ゼロ段階）は連続値のみを扱っていたが、現在はイベント型も実装済みである。

**イベント（Event）**

時々瞬間的に発生する「雷」のようなもの。時間的に離散的です。例：

- クリック
- キープレス
- メッセージ受信
- 閾値超え（値が特定の値を越えたとき）

イベントは第一段階（実装済み）で導入された。

### 3.2 ノード（部品）の 5 カテゴリ

部品は次の 5 つのカテゴリに分かれます。

#### ソース部品

入力なしで値を生み出すノード。

**例：** `clock`（時刻）、`constant`（定数）

#### 入力部品

外界から値を受け取るノード。ユーザーの操作やネットワーク通信などが対象。

**例：** `pointerPosition`（マウス位置）、`pointerClick`（クリック）、`webhook`（HTTP リクエスト）

バージョン 0.3.0 では `smoothLerp`、`lowpass`、`delay1`、`integrate` を実装済み。

#### 変換部品

純粋な計算で値を変換する。状態を持ちません。

**例：** `add`（足し算）、`multiply`（掛け算）、`sine`（正弦波）、`map`（配列変換）

#### 状態部品

内部に状態を持つ唯一のカテゴリ。過去の値を記憶し、それに基づいて出力を決定します。

**例：** `smoothLerp`（easing follow）、`lowpass`（平滑化）、`delay1`（1フレーム遅延）、`integrate`（積分）

状態部品は実装済みである（`smoothLerp`、`lowpass`、`delay1`、`integrate`）。

#### シンク部品

外部への副作用を持つノード。値を受け取り、画面・音響・ネットワークなどに影響を与えます。

**例：** `setPosition`（位置変更）、`setText`（テキスト変更）、`setStyle`（スタイル変更）

DOM シンク部品および SceneSync / Three.js アダプタ経由のシンク部品は実装済みである。

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

## 4. 第ゼロ段階のスコープ（履歴）

> 注:
> このセクションは、Loomlet の初期実装時点でのスコープを記録した履歴的な説明です。
> 現在の実装状況を示すものではありません。
> Editor Studio、Node Editor、VS Code拡張、Scene Sync連携など、このセクションで「第一段階以降」としていた機能の一部はすでに実装済みです。
> 現在の実装状況については [現在の実装状態](#現在の実装状態) を参照してください。

### 実装対象

- ✅ 評価器の中核（JSON グラフを受け取り、毎フレーム値を計算する）
- ✅ ノード 5 種類のみ：`clock`、`constant`、`sine`、`add`、`multiply`
- ✅ ブラウザ環境のみ（Node.js 対応は第一段階以降）
- ✅ 単一クライアント（ネットワーク同期なし）
- ✅ JSON でグラフ定義、`engine.getValue()` で外部から値を取得
- ✅ ESM 形式の単一ファイル（`loom.js`）として配布
- ✅ 依存ライブラリゼロ（Three.js などへの依存も持たない）

### 初期時点での実装外（現在は一部実装済み）

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
- ✅ DOM シンクノード7種：`setText`、`setStyle`、`setAttr`、`setClass`、`setCssVar`、`setTransform2D`、`log`
- ✅ 既存ノードはそのまま動作（後方互換）

### 実装外（第二段階以降）

- ❌ DSL とパーサ
- ❌ ビジュアルエディタ
- ❌ マルチクライアント同期
- ❌ Three.js アダプタ

## 5. ノード仕様

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

### 5.5k smoothLerp

**カテゴリ：** 状態部品

**入力：**
- `value`（目標値、未接続時は `params.value`、未指定時は `params.initial`）
  - 型：`number`

**出力：**
- `out`
  - 型：`number`

**パラメータ：**
- `value`（デフォルト 0）
- `rate`（デフォルト 5）
- `initial`（デフォルト 0）

**説明：**

時間ベースの指数追従。`dt` を使って `prevOut` から目標値へ滑らかに収束する。評価式は `prevOut + (value - prevOut) * (1 - exp(-rate * dt))`。

### 5.5l lowpass

**カテゴリ：** 状態部品

**入力：**
- `value`（入力値、未接続時は `params.value`、未指定時は `params.initial`）
  - 型：`number`

**出力：**
- `out`
  - 型：`number`

**パラメータ：**
- `value`（デフォルト 0）
- `tau`（デフォルト 0.2 秒）
- `initial`（デフォルト 0）

**説明：**

時定数ベースの一次ローパスフィルタ。評価式は `prevOut + (value - prevOut) * dt / (tau + dt)`。`tau=0` の場合は即時追従になる。

### 5.5m delay1

**カテゴリ：** 状態部品

**入力：**
- `value`（入力値、未接続時は `params.value`、未指定時は `params.initial`）
  - 型：`number`

**出力：**
- `out`
  - 型：`number`

**パラメータ：**
- `value`（デフォルト 0）
- `initial`（デフォルト 0）

**説明：**

1 フレーム前の入力値を返す。出力 `out` は現在の `prevOut`、次フレームに保存される内部状態は現在フレームの入力値。実装上は evaluate の戻り値で `_newState` を明示する唯一の標準ノード。

### 5.5n integrate

**カテゴリ：** 状態部品

**入力：**
- `value`（積分対象。単位は per-second）
  - 型：`number`

**出力：**
- `out`
  - 型：`number`

**パラメータ：**
- `value`（デフォルト 0）
- `initial`（デフォルト 0）
- `min`（デフォルト `null`）
- `max`（デフォルト `null`）

**説明：**

`prevOut + value * dt` を評価し、必要なら `min` / `max` でクランプする。ゲージ、累積、減衰量の管理などに使う。

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

### 5.12.1 greaterThan

**カテゴリ：** 変換部品

**入力：**
- `value`（型：`number`、デフォルト：`0`）
- `threshold`（型：`number`、デフォルト：`0`）

**出力：**
- `out`（型：`boolean`）

**パラメータ：**
- `value`（型：`number`、デフォルト：`0`）
- `threshold`（型：`number`、デフォルト：`0`）

**説明：**

`value > threshold` を評価し、真偽値を返す。しきい値判定をシンプルに記述するためのノード。

### 5.12.2 lessThan

**カテゴリ：** 変換部品

**入力：**
- `value`（型：`number`、デフォルト：`0`）
- `threshold`（型：`number`、デフォルト：`0`）

**出力：**
- `out`（型：`boolean`）

**パラメータ：**
- `value`（型：`number`、デフォルト：`0`）
- `threshold`（型：`number`、デフォルト：`0`）

**説明：**

`value < threshold` を評価し、真偽値を返す。`greaterThan` と対で使える比較ノード。

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

### 5.14.1 setClass

**カテゴリ：** シンク部品

**入力：**
- `enabled`（型：`boolean`、デフォルト：`true`）

**出力：** なし（シンクノードは副作用専用のため出力を持たない）

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：CSS セレクタ
- `className`（型：`string`、デフォルト：`""`）：付け外しするクラス名

**説明：**

`element.classList.toggle(className, Boolean(enabled))` を実行してクラスを付与/削除する。対象要素がない場合、`className` が空の場合は何もしない。

### 5.14.2 setCssVar

**カテゴリ：** シンク部品

**入力：**
- `value`（型：`any`、デフォルト：`0`）

**出力：** なし（シンクノードは副作用専用のため出力を持たない）

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：CSS セレクタ
- `name`（型：`string`、デフォルト：`""`）：CSS カスタムプロパティ名
- `unit`（型：`string`、デフォルト：`""`）：単位文字列

**説明：**

CSS custom property を更新する。`name` が `--` で始まらない場合は自動で `--` を補う。`value` が `null` / `undefined` の場合や対象要素がない場合は何もしない。

### 5.14.3 setTransform2D

**カテゴリ：** シンク部品

**入力：**
- `x`（型：`number`、デフォルト：`0`）
- `y`（型：`number`、デフォルト：`0`）
- `scale`（型：`number`、デフォルト：`1`）
- `rotate`（型：`number`、デフォルト：`0`）

**出力：** なし（シンクノードは副作用専用のため出力を持たない）

**パラメータ：**
- `target`（型：`string`、デフォルト：`""`）：CSS セレクタ
- `unit`（型：`string`、デフォルト：`"px"`）：translate の単位
- `rotateUnit`（型：`string`、デフォルト：`"deg"`）：rotate の単位

**説明：**

`style.transform` を `translate(...) scale(...) rotate(...)` 形式でまとめて設定する。`setStyle` でも transform は設定できるが、`setTransform2D` は 2D 変形を分かりやすく扱うための専用シンク。対象要素がない場合は何もしない。

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

- `loom`（オプション、文字列）：グラフが対象とする Loomlet 仕様のバージョン。後方互換性チェックなどに使用
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

Loomlet の評価モデルは「指定された時刻のグラフ状態を計算する」ことを中核とします。エンジン本体は時刻を内部で進めるのではなく、外部から `evaluateAt(time)` を呼ぶことで、その時刻におけるすべてのノード出力を確定させます。`start()` / `stop()` は `requestAnimationFrame` を使って `evaluateAt` を毎フレーム呼ぶ便利ラッパーであり、テストや決定論的再生では `evaluateAt` を直接呼ぶ運用が想定されています。

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

`evaluateAt` は Loomlet の中核 API であり、`start()` / `stop()` はこれを `requestAnimationFrame` で繰り返し呼ぶ便利ラッパーです。テストや、外部の時刻ソース（サーバ時刻、録画再生など）に同期したい場合は、`evaluateAt` を直接呼ぶ運用が想定されています。

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

**補足：** 出力ポート名はノード型によって異なります。`clock` の出力ポートは `t`、`pointerPosition` の出力ポートは `pos`、それ以外のノード（状態ノードを含む）のデフォルト出力ポートは `out` です。

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
4. **状態ノードの内部状態は ID ベースで再利用**：同じ `id` の state ノードが新グラフにも残っていれば、その `prevOut` は引き継がれます。消えた `id` の state は破棄されます。新規 `id` の state は `params.initial` から始まります。

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

開始時には `dt` 計算用の前回タイムスタンプをリセットするため、再開直後の最初のフレームは `dt=0` になります。state ノードの内部状態そのものは保持されます。

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

`start()` で開始したリアルタイム評価ループを停止します。state ノードの内部状態は保持されるため、再度 `start()` した場合は続きから動作します。

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
- `dt`：前フレームからの経過秒数。初回は `0`、上限は `0.1`
- `prevOut`：state ノードのみ。前フレームに保存された内部状態。未初期化時は `params.initial`

このコンテキストは、ノード評価時に参照されます（例：`clock` ノードが `time` を出力し、state ノードが `dt` と `prevOut` を参照する）。

### フレームごとの評価

毎フレーム、以下の処理が行われます：

1. 保留中のグラフ（`engine.load()` で渡されたもの）があれば、現行グラフに切り替え
2. `time` を `evaluateAt(time)` の引数で更新し、前回フレームとの差から `dt` を計算する（最大 `0.1` 秒にクランプ）
3. `dispatchEvent` で積まれた保留イベントを、対応する入力ノードの出力に反映する
4. ソース側からシンク側へ向けて、**トポロジカルソートされた順序** に従い、各ノードを順次評価
   - Behavior 型入力：エッジ → params → デフォルトの3段階で値を決定
   - Event 型入力：上流からイベントが届いていればその配列、届いていなければ「発生していない」
   - state ノード：`evaluate(inputs, params, { time, dt, prevOut, engine, ... })` を呼ぶ。戻り値に `_newState` があればそれを、なければ `out` を次フレーム用の内部状態として保存する
   - state ノードで例外が発生した場合はエラーログを出し、内部状態は更新しない
   - 計算結果を Behavior 型出力ポートに書く（毎フレーム）
   - 必要なら Event 型出力ポートにイベントを書く（発生フレームのみ）
5. 評価終了後、Event 型ポートに溜まったイベントは破棄。次フレームに持ち越さない

### 状態ノードの安全性

- `inputs.value` に `NaN` / `Infinity` が入った場合は `0` として扱う
- `prevOut` や計算結果が `NaN` / `Infinity` になった場合は `params.initial` に戻す
- `dt` はエンジン側でクランプし、各 state ノードでは個別にクランプしない

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

Loomlet がスローするエラーは、以下の構造を持つ `Error` オブジェクトです。

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

Loomlet は単一の JSON グラフ表現を真の単一ソースとし、複数の評価環境（JavaScript / C# / その他）で**同一の入力に対し同一の出力**を返すことを保証する。

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

複数クライアントで結果を揃えるには、共有された時刻ソースが必要となる。これは `serverClock` ノード（SceneSync アダプタの `src/loom-scenesync.js` で実装済み）で実現する。`evaluateAt(time)` の `time` を全クライアントで揃えれば、ステートレスグラフの結果は揃う。

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

### 第四段階：DSL とパッチ形式（実装済み）

- ✅ 専用テキスト記法（DSL）の設計とパーサ
- ✅ DSL ↔ JSON の相互変換
- ✅ canonical DSL 再生成
- 部分更新用の source map patch（AI による差分編集を想定）は設計思想として残すが、現在は canonical regeneration を主経路とする

### 第五段階：ビジュアルエディタとプリセット（実装済み）

- ✅ Editor Studio による CodeMirror DSL editor と Rete.js Node Editor の並行編集
- ✅ ノード追加・削除・rename、エッジ接続、パラメータ編集、リアルタイム DSL 同期
- ✅ Undo/Redo、Node search/focus、Save/Open
- ✅ layout preservation（DSL 変更時のノード位置保持）
- 再利用可能なサブグラフ／プリセット機構はまだ未実装

### 第六段階：マルチクライアント同期と各種アダプタ

- 複数クライアントでのグラフ・状態同期
- イベント配信ノードによる broadcast
- ✅（実装済み）3D エンジン連携アダプタ：Three.js Object3D 向けの `src/loom-three.js`（`setPosition`、`setRotation`、`setScale`、`setColor`、`setVisible` シンクノード）
- ✅（実装済み）VS Code 拡張：syntax highlighting、metadata-driven completion、parse/compile diagnostics、current file 実行、Scene Sync dev workflow 起動
- AI 連携用のツール定義

### Phase 1.5：SceneSync アダプタ（実装済み）

現在の Loomlet CLI では、Scene Sync link code の redeem、session 保存、room/object の確認、`.loom` から Scene Sync behavior graph へのcompile/run/dev workflow を実験的に実装している。

- ✅ `src/loom-scenesync.js` の追加（Loomlet リポジトリ側のアダプタ層）
- ✅ `serverClock` ノード追加（クロスクライアント時刻同期）
- ✅ Sink ノード 5 種：`sceneSetPosition`、`sceneSetRotation`、`sceneSetScale`、`sceneSetColor`、`sceneSetVisible`
- ✅ CLI: `redeem` / `objects` / `probe` / `graph-compile` / `graph-run` / `dev` watch
- ✅ `sample-cube` に対する behavior graph 適用

Loomlet の主方向は、Scene Sync 上のオブジェクトに時間変化する振る舞いを与える behavior layer である。

- メッセージプロトコル詳細・グラフライフサイクル管理・配信ポリシーは進行中。

### Phase 1.6：Unity 対応（C# 再実装）

- C# で Loomlet エンジンを再実装（評価コア、ノードレジストリ、`engine.load()` によるランタイム差し替え対応）。
- JSON スキーマと評価セマンティクス（12 章）を JS 版と完全一致させる。
- 制限式 DSL のインタプリタを C# でも実装。
- ノードの C# 実装は JS 版とノード型ごとに対応（仕様変更時は両側更新）。
- DSL（テキスト記法）は JS 版のみで扱い、Unity 側は JSON 中間表現のみ受信。
- SceneSync sink は Unity の `Transform` / `Renderer` に直接書き込む。

### Phase 2 以降：拡張と安定化

- DSL ↔ JSON ↔ ビジュアル の三者双方向変換の安定化（基本機能は実装済み）
- ステートノード（`accum`、`smooth` 等）と Sink ノードの一般化
- npm 公開と package 安定化
- Marketplace 公開（VS Code 拡張）
- real Node Preview（VS Code 拡張）

---

**仕様書のバージョン：** 0.2.0（クロスプラットフォーム仕様確定版）

---

## Unity C# ランタイム補足仕様（v0.1.0）

### 概要

JavaScript 版 Loomlet と同じ JSON グラフ形式を、Unity C# ランタイムでも評価できる。

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

## State nodes (explicit temporal state)

### 動機

Loomlet の通常ノードはステートレスな純粋関数であり、`evaluate(inputs, params)` の結果は入力のみで決まる。これは graph を「時刻 t の関数 f(t)」として扱える純度の高い性質を生むが、一方で smoothing / delay / integrate / easing follow のような「前フレーム値を必要とする挙動」は表現できない。

これらを graph 外の JS に逃がすと、Loomlet graph から挙動が見えなくなり、Loomlet の「graph に挙動を閉じ込める」という思想からむしろ外れてしまう。そこで Loomlet は state を禁止するのでも無制限に許すのでもなく、明示的に隔離されたカテゴリとして導入する。

### 設計原則

1. 通常ノードは純粋関数である。
2. 状態を持てるのは `category: "state"` のノードだけである。
3. state は node id に紐づく。
4. state は graph JSON には保存されない runtime state である。
5. `engine.load()` 時、同じ id の state ノードは state を引き継ぐ。
6. id が変わった state ノードは `params.initial` から始まる。
7. state ノードは同期・再現性に影響するため、必要最小限に使う。
8. AI が graph を生成する場合、state ノードの使用は時間的挙動(smooth / delay / integrate / easing follow)が必要な場合に限定する。

### 用語

- カテゴリ識別子(機械可読)は `state` を使う。
- ドキュメント・説明文では "explicit temporal state" と呼び、「時間方向のふるまいを扱うノード」であることを強調する。
- 「任意のメモリ」「変数」「保存領域」としての拡大解釈は意図的に避ける。

### エンジン契約

- `dt` は秒単位で、フレーム間のタイムスタンプ差から算出される。
- `dt` の上限は 0.1 秒にクランプされる(タブ非アクティブ時の暴走を防ぐため)。
- state ノードの evaluate は `evaluate(inputs, params, { prevOut, dt })` の形で呼ばれる。
- 評価後の出力は engine 側で id ごとに保持され、次フレームの `prevOut` として渡される。
- `engine.load(newGraph)` では、同じ id の state ノードは prevOut を保持し、異なる id は `params.initial` から開始する。
- NaN / Infinity が出た場合は `prevOut` を更新せず、必要に応じて `initial` にリセットする。

### 同期(SceneSync 等)に関する注意

Loomlet の標準的な同期モデルは「全クライアントが同じ graph JSON を受け取り、それぞれ独自に評価する」というものである。state ノードはこのモデル上、各クライアントで独立に進行する。

- 同じ `params.initial` と同じ入力履歴(クロック、pointerClick イベントなど)が両端で揃っていれば、state ノードの値は収束する。
- ジョイン時のキャッチアップ(途中参加クライアントが過去の入力を再生する仕組み)は保証されない。
- したがって SceneSync 越しで state ノードを使う場合は、「収束しても OK な性質(easing follow、低域通過など)」に限定するのが安全である。
- 累積誤差が問題になる挙動(`integrate` で大きなカウントを保持し続ける等)は、必要なら別途 broadcast 機構で値を共有する設計を将来検討する。

### 標準 state ノード

| Node | 用途 | 主なパラメータ | 式 |
|---|---|---|---|
| `smoothLerp` | 目標値への指数的収束(easing follow) | `rate` (1/sec), `initial` | `out = prevOut + (value - prevOut) * (1 - exp(-rate * dt))` |
| `lowpass` | ノイズ除去・平滑化 | `tau` (sec), `initial` | `out = prevOut + (value - prevOut) * (dt / (tau + dt))` |
| `delay1` | 1 フレーム前の入力を出力 | `initial` | `out = prevOut`、内部状態として現在の入力を次フレームへ |
| `integrate` | 入力の時間積分 | `min`, `max`, `initial` | `out = clamp(prevOut + value * dt, min, max)` |


## AST(Abstract Syntax Tree)

### 動機

DSL を「書ける言語」から「編集・生成・変換できる言語」へ拡張するため、Loomlet は Source AST を中間表現として公開する。

- AI 補助編集: LLM に DSL の構造的な部分編集を依頼できる。
- DSL formatter: 保存時の自動整形が可能。
- ビジュアルエディタ基盤: DSL ⇄ graph JSON の中間として AST を介し、書式情報を保ったまま編集できる。
- 将来の文法拡張: pipeline / inline expression / マクロ等を入れる際、AST 拡張だけで API 互換を保てる。

### 二層構造

- **Source AST**: ユーザーが書いた DSL の表層を忠実に表現。AssignmentStatement / RenderStatement / CallExpression / PipeExpression / Identifier / Literal / Comment などで構成。識別子参照・パイプ式・デフォルトポートは脱糖しない。
- **Canonical AST / Graph**: 実行用に正規化された形(NodeDecl + EdgeDecl)。graph JSON はこの層の serialization。

### 公開 API

| 関数 | 役割 |
|---|---|
| `parseDSLToAST(source)` | DSL を Source AST に変換。throw せず errors を返す。 |
| `compileToGraph(ast)` | Source AST を graph JSON に lower する。throw せず errors を返す。 |
| `formatDSL(ast, options?)` | Source AST を整形済み DSL に変換。決定的。 |

### Source AST スキーマ(抜粋)

```ts
type SourceAST = Program;
interface Program { type: "Program"; body: Statement[]; span: Span; }
type Statement = AssignmentStatement | RenderStatement | CommentStatement;
interface AssignmentStatement { type: "AssignmentStatement"; target: Identifier; value: Expression; span: Span; leadingComments?: Comment[]; trailingComment?: Comment; }
interface RenderStatement { type: "RenderStatement"; call: CallExpression; span: Span; leadingComments?: Comment[]; trailingComment?: Comment; }
interface CommentStatement { type: "CommentStatement"; comment: Comment; span: Span; }
type Expression = CallExpression | PipeExpression | Identifier | NumberLiteral | StringLiteral | BooleanLiteral | NullLiteral | ArrayLiteral | ObjectLiteral;
interface CallExpression { type: "CallExpression"; callee: Identifier; args: Argument[]; span: Span; }
interface PipeExpression { type: "PipeExpression"; left: Expression; right: CallExpression; span: Span; }
type Argument = PositionalArg | NamedArg;
interface PositionalArg { type: "PositionalArg"; value: Expression; span: Span; }
interface NamedArg { type: "NamedArg"; name: Identifier; value: Expression; span: Span; }
interface Identifier { type: "Identifier"; name: string; span: Span; }
interface NumberLiteral { type: "NumberLiteral"; value: number; raw: string; span: Span; }
interface StringLiteral { type: "StringLiteral"; value: string; raw: string; span: Span; }
interface BooleanLiteral { type: "BooleanLiteral"; value: boolean; span: Span; }
interface NullLiteral { type: "NullLiteral"; span: Span; }
interface ArrayLiteral { type: "ArrayLiteral"; elements: Expression[]; span: Span; }
interface ObjectLiteral { type: "ObjectLiteral"; entries: ObjectEntry[]; span: Span; }
interface ObjectEntry { type: "ObjectEntry"; key: Identifier | StringLiteral; value: Expression; span: Span; }
interface Comment { type: "Comment"; text: string; variant: "line"; span: Span; }
interface Span { start: { line: number; column: number; offset: number }; end: { line: number; column: number; offset: number }; }
```

### round-trip 契約

`parseDSLToAST → formatDSL → parseDSLToAST` で得られる AST は、初回 AST と span を除いて等価。コメント・引数順・キー順・リテラル raw 表現・パイプ式の構造が保持される。

### 安定性

本章で定義した Source AST 型は後方互換を意識したバージョニングの対象。`_internal` プレフィックスの type は予告なく変更され得る(本バージョンでは未使用)。

### エラーハンドリング(現状)

現在の parser 実装は最初の 1 件の ParseError を errors 配列で返す。将来、error recovery 実装により複数件収集を予定。

### Future work

- `graphToAST(graph): CanonicalAST`
- `patchDSL(originalSource, newGraph): string`
- Canonical AST(NodeDecl / EdgeDecl)の独立公開
- AST バージョニング機構(`astVersion`)
- editor-pro の lint / autocomplete を Source AST ベースに移行
- DSL シンタックス拡張時の Source AST 拡張(InlineEdgeDecl, PipelineDecl 等)
- 書式ヒントフィールドの追加(`CallExpression.multiline`, `Statement.blankLinesBefore`, `PipeExpression.lineBreakBefore`)


## Editor Model

Loomlet は次の 3 つの truth を分離して扱う。

- **Source AST** は DSL の表層構文(配列ベース、順序・コメント保持)。
- **GraphJSON** は Loomlet 実行用の正規形。
- **Editor Model** はノードエディタ用の視覚モデル(id をキーとする Map 構造、CRDT 互換)。

これらを橋渡しする関数として `parseDSLToAST` / `compileToGraph` / `graphToEditorModel` / `editorModelToGraph` / `applyEditorOperation` を提供する。Source AST と Editor Model は構造が異なる(配列ベース vs Map ベース)ため、相互変換は GraphJSON を中継して行うのが基本。

### 型

- `EditorNode`: `{ id, type, category, params, position }`
- `EditorEdge`: `{ id, fromNodeId, fromPort, toNodeId, toPort }`
- `EditorModel`: `{ nodesById, edgesById, order }`
- `EditorOperation`: `addNode` / `removeNode` / `updateParam` / `moveNode` / `addEdge` / `removeEdge`

### API

- `graphToEditorModel(graph)`: GraphJSON を `nodesById` / `edgesById` / `order` に変換。`meta.position` がないノードには `layoutFallback` を適用する。
- `editorModelToGraph(em, originalGraph = null)`: `order` で node 配列を再構築し、position を `meta.position` に保存。edge は edge id 昇順で決定論的に出力し、`originalGraph.render` を継承できる。
- `applyEditorOperation(em, op)`: EditorModel をイミュータブル更新する。`removeNode` は関連 edge も削除し、`removeNode` / `removeEdge` は存在しない id で no-op。
- `layoutFallback(nodes)`: category 別の決定論的グリッド配置を行う。

### `layoutFallback` 仕様

- `input`: x=0
- `transform`: x=300
- `state`: x=600
- `sink`: x=900
- その他: x=1200
- 同カテゴリ内は入力順に y=0,120,240... を割り当てる。
- 既存 `position` を持つノードは再配置しない。

### 現在の実装状態

- Editor Studio では EditorModel → canonical DSL 再生成（graph → DSL auto sync）を実験的に実装している。
- DSL 変更時には layout preservation により可能な範囲でノード位置を保持する。
- 将来の Yjs 統合では `nodesById` / `edgesById` を CRDT マップとしてそのまま扱う方針。


## Function values

Loomlet supports single-expression function literals: `fn(x) => math.multiply(x, 2)`.

Most Loomlet calls allow only the first argument to be positional. Later arguments must be named.

Common binary operator nodes are an exception and may use two positional arguments:
`math.add(1, 2)`
`math.subtract(10, 3)`
`math.multiply(x, 2)`
`math.divide(x, 2)`
`math.mod(x, 3)`

More descriptive or multi-argument calls still require named arguments:
`logic.greaterThan(x, other: 2)`
`math.map(x, inMin: 0, inMax: 1, outMin: 0, outMax: 100)`

Functions can be assigned to variables: `double = fn(x) => math.multiply(x, 2)`.

Functions can capture values from outer scope: `base = 10` and `addBase = fn(x) => math.add(x, base)`.

Functions can be passed to list nodes: `list.map(numbers, fn: double)`.

Current limitations:
- function bodies are single expressions
- block bodies are not supported yet
- recursion is not supported yet


## Embedded Scene Sync 統合（草案）

このセクションは、Scene Sync本体に Loomlet Node Editor を組み込む場合の設計草案である。
現時点では確定仕様ではなく、実装前にさらに検討する。

### 1. 基本方針

Embedded版では、Scene SyncのScene JSONを正本とする。

Loomlet Node Editorは、Scene JSON全体を別形式へ置き換えるのではなく、Scene JSON内のLoomlet behavior graph部分を編集する専用エディタとして扱う。

Scene Sync Dev ToolのJSON editorはScene JSON全体を直接編集し、Loomlet Node Editorはその中のLoomlet graph部分を視覚的に編集する。

### 2. Standalone版との違い

Standalone版:
- GitHub Pagesなど、Scene Sync外部で動作する
- Scene Syncへ接続するにはredeem/link code/session tokenが必要
- `.loom` file + hidden editor metadata を扱う

Embedded版:
- Scene Syncアプリ内で動作する
- 既存のroom/session/contextを親アプリから受け取るためredeemは不要
- Scene JSON内のLoomlet graphを直接編集する

### 3. Scene JSON内での配置案

推奨案として `behaviors.loomlet` を使う案を以下に示す。

Scene-level graph:

```json
{
  "behaviors": {
    "loomlet": {
      "version": 1,
      "graph": {
        "nodes": [],
        "edges": []
      },
      "editor": {
        "version": 1,
        "nodes": {}
      }
    }
  }
}
```

Object-level graph:

```json
{
  "objects": {
    "cube1": {
      "behaviors": {
        "loomlet": {
          "version": 1,
          "graph": {
            "nodes": [],
            "edges": []
          },
          "editor": {
            "version": 1,
            "nodes": {}
          }
        }
      }
    }
  }
}
```

`scene.behaviors.loomlet` はシーン全体のLoomlet graphを表す。
`scene.objects[id].behaviors.loomlet` は特定objectに付与されたLoomlet graphを表す。

### 4. Object graph と owner binding

Object-level graphでは、graphの所有者はScene JSON内の配置場所から決まる。

たとえば `scene.objects["cube1"].behaviors.loomlet` にあるgraphは、`cube1` をownerとする。

このため、object-level graph内では、対象object idをDSLやgraph内に直接書かずに、owner/current objectとして扱える可能性がある。

将来的には `object.setPosition(...)` のようなowner向けのDSL/APIを導入する案がある。
ただし、この名前や構文はまだ確定していない。

### 5. Scene graph と object graph の違い

Scene graph:
- シーン全体に対するbehavior
- 複数objectを操作できる
- object idを明示する操作と相性がよい
- 配置候補: `scene.behaviors.loomlet`

Object graph:
- 1つのobjectに付与されるbehavior
- 同じgraphを別objectに再利用しやすい
- owner objectは配置場所から決まる
- 配置候補: `scene.objects[id].behaviors.loomlet`

### 6. Dev Tool JSON editor との統合

Embedded版では、Scene Sync Dev ToolのJSON editorとLoomlet Node Editorは、同じScene JSONを別の視点から編集する。

- JSON editor: Scene JSON全体を直接編集する
- Loomlet Node Editor: `behaviors.loomlet` 以下を視覚的に編集する

Node Editorでの変更はScene JSONへ反映され、JSON editorにも反映される。
JSON editorでScene JSON内のLoomlet graphを変更した場合、Node Editorもそれを検出して再読み込みまたは競合解決を行う必要がある。

### 7. Editor metadata の扱い

Standalone `.loom` fileでは、ノード位置・label・commentなどの編集情報をhidden editor metadataとして保存する。

一方、Embedded版ではScene JSON内に明示的な `editor` fieldとして保存できる。

この `editor` field は実行意味には含めず、Node Editorの表示・編集補助のためだけに使う。

### 8. Apply model

Node Editorの変更をScene JSONへ反映する方式には、少なくとも2案がある。

Manual Apply:
- Node Editor内でdraftとして編集する
- ApplyボタンでScene JSONへ反映する
- 競合管理が比較的簡単

Auto Apply:
- Node Editorの変更をdebounceしてScene JSONへ反映する
- Dev Tool JSON editorとリアルタイムに同期しやすい
- ノードドラッグやUndo/Redoとの整合に注意が必要

初期実装ではManual Applyを優先し、必要に応じてAuto Applyを追加する案がある。

### 9. 競合解決

JSON editorとNode Editorが同じLoomlet graphを同時に編集する可能性があるため、競合検出が必要になる。

候補:
- Node Editorが読み込んだ時点のgraph hash/versionを保持する
- Apply時にScene JSON側のgraphが変わっていれば警告する
- 選択肢として Reload / Overwrite / Cancel を出す

初期実装では、外部変更を検出したらNode Editor側を再読み込みする簡易方式でもよい。

### 10. Host Bridge

Embedded版では、Node Editorが直接redeemや外部API接続を行うのではなく、Scene Sync側からHost Bridgeを受け取る。

Host Bridgeの役割:
- 現在のScene JSONを取得する
- Scene JSONを更新する
- object listを取得する
- selected objectを取得・変更する
- scene/object graphを取得・設定・削除する
- Scene JSON変更イベントを通知する

擬似interfaceの例:

```ts
type SceneSyncHostBridge = {
  getSceneJson(): Promise<object>;
  updateSceneJson(nextScene: object): Promise<void>;

  getObjects(): Promise<Array<{ id: string; name?: string }>>;
  getSelectedObjectId(): string | null;
  setSelectedObjectId(id: string | null): void;

  getLoomletGraph(scope: { scene?: true; object?: string }): Promise<object | null>;
  setLoomletGraph(scope: { scene?: true; object?: string }, graph: object, editor?: object): Promise<void>;
  clearLoomletGraph(scope: { scene?: true; object?: string }): Promise<void>;

  onSceneJsonChanged(callback: () => void): () => void;
  onSelectionChanged(callback: (objectId: string | null) => void): () => void;
};
```

### 11. 未決事項

未決事項:
- `behaviors.loomlet` という配置で確定するか
- scene-level graphを1つだけにするか、複数持てるようにするか
- object-level graphを1 object 1 graphにするか、複数behaviorにするか
- `object.setPosition(...)` のようなowner向けDSLを導入するか
- Scene Syncの既存scene json schemaとの整合
- Dev Tool JSON editorとの競合解決方式
- Auto Applyを初期実装に含めるか
