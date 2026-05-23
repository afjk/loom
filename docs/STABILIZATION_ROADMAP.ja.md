# Loomlet 安定化ロードマップ

このロードマップは、Loomletのコアの振る舞いを安定させつつ、集中した実験も続けられるようにするためのものです。

## SPECとの関係

`docs/SPEC.md` は、Loomletの意図する意味論、設計原則、現在の実装モデルを記述します。このロードマップは、実装、テスト、metadata、labs作業をどの順番で安定化していくかを記述します。

両方の文書で扱う領域が重なる場合、安定した意味論の参照元は `docs/SPEC.md`、進行順の参照元はこのロードマップとします。labsのアイデアは、十分に成熟して `docs/SPEC.md` に昇格できるまでは、このロードマップまたはリンクされたdesign noteに留めます。

## Track A: Stabilization

目的: コアを信頼でき、拡張しやすい状態にする。

推奨順序:

1. 用語を明確にする
2. `docs/SPEC.md` で behavior / event の意味論を正式化する
3. examples向けのgolden testを追加する
4. node definition schemaを安定化する
5. input と param の違いを明確にする
6. runtime registration APIを明確にする
7. editor / docs / completion が共有する情報源としてmetadataを明確にする
8. 実用的な範囲で、JS runtime と Unity runtime の互換性を改善する

## Track B: Labs

目的: mainを不安定にせずにアイデアを試す。

実験候補:

- `labs/value-model`
  - vec2 / vec3 / vec4 / record / list
  - `.x`, `.xy`, `.xz` のような成分アクセス / swizzle
- `labs/input-slot`
  - 接続された値
  - ローカル定数
  - ノードのデフォルト値
  - 優先順位
- `labs/node-editor-virtual-ports`
  - 折りたたみ可能な仮想成分ポート
  - 暗黙的な swizzle / get ノード
- `labs/package`
  - package manifest
  - local package loading
  - 将来のnpm / catalog対応
- `labs/ui-graph`
  - UIの値やイベントをLoomlet graphの入力/出力として扱う
- `labs/shader-graph`
  - shader-safe subsetの探索

## labs から main へ昇格するルール

labsのアイデアは、次の条件を満たした場合のみmainへ移動できます。

- 振る舞いが `docs/SPEC.md` またはリンクされたdesign docに記述されている
- runtime testが存在する
- DSLまたはgraph exampleが存在する
- editorへの影響が記録されている
- 互換性への影響が記録されている

## ラウンドトリップとGolden Test戦略

Loomletには複数の表現があります。`.loom` source、Source AST、compiled graph、runtime graph、editor model、canonical DSL、editor metadataなどです。オーサリングパイプライン全体を1つの完全に安定したラウンドトリップとして扱うのではなく、各境界を個別に安定化します。

### 先に安定化するもの

短期的なテストでは、compilerとruntimeの境界における意味的な安定性に注目します。

```text
DSL Source -> Source AST
DSL Source -> Source AST -> Graph
DSL fixture -> compile -> graph semantic snapshot
Runtime graph -> evaluation result for deterministic examples
```

これらのテストでは、examplesが意図通りにparse、compile、evaluateできることを検証します。作者が書いた元の空白、コメント、pipe style、argument style、editor layoutの保持は要求しません。

### Canonical DSL round-trip v1（意味的境界）

Canonical DSL round-trip v1 は、次の意味的境界を指します。

```text
Graph -> Canonical DSL -> Graph
```

現在のテストヘルパーでは実際には次の流れで確認しています。

```text
Graph -> Canonical DSL -> Source AST -> Graph
```

比較は graph normalization 後の semantic equivalence を使います。生成されるcanonical DSLは、ユーザーが書いた元のsource styleではなく、正規化されたstyleを使う場合があります。v1 の目標は次の通りです。

- 生成されたDSLがparse可能である
- 生成されたDSLが意味的に等価なgraphへcompileし直せる
- 元sourceとの完全なテキスト一致は要求しない
- コメント、formatting、pipe syntax、import順序、named-vs-positional argument styleの保持は保証しない
- editor layout metadata と hidden metadata の正確な形式の保持は保証しない

semantic比較では、次の差分を正規化または無視する場合があります。

- 意味的に無関係な node 順序
- 意味的に無関係な edge 順序
- formatting / source 表現の差
- editor-only layout metadata
- hidden metadata の正確な形式

### まだ固定しないもの

まだ実験中、または視覚表現に関する領域には、厳密なgolden snapshotを避けます。

- Node Editorのリアルタイム同期
- 完全な DSL <-> Node Editor の双方向編集
- コメントを保持するsource patch
- 元のformattingの保持
- pipe syntaxの保持
- named argument と positional argument の保持
- import順序の保持
- editor layout metadataのround-trip
- hidden editor metadataの正確な形式
- 編集済みDSLテキストと既存node layout間の双方向patch
- function/subgraph の完全なsource保持
- package-aware source保持
- node coordinates と visual layout
- canonical formattingを意図的にテストする場合を除いた、生成canonical DSLの厳密なテキストレイアウト

### Golden testのレベル

不安定な振る舞いを意図せず固定しないように、テストをレベル分けします。

#### Level 1: Parse fixtures

`.loom` fixtureがerrorなしでparseできる。

#### Level 2: Compile fixtures

`.loom` fixtureがerrorなしでcompileでき、graphに期待される意味的なnodesとedgesが含まれる。

#### Level 3: Graph semantic snapshots

正規化されたgraph outputを期待snapshotと比較する。

正規化では、editor positions、可能な限りgenerated IDs、timestamps、visual-only metadataなど、不安定なfieldを避けるべきです。

#### Level 4: Canonical DSL round-trip v1（Partial）

graphをcanonical DSLへcompileし、再度parse、compileして、semantic graph equivalenceを比較する。

このレベルは `test/stabilization-fixtures.test.mjs` で実施済みです（例: `event-on-event-basic.loom` / `event-on-event-self.loom` / `event-on-event-explicit.loom` / `event-edge-send.loom`）。`onEvent` / `sendEvent` / `risingEdge` / `fallingEdge` のevent-flowも含みます。

#### Level 5: Editor round-trip

editor modelを通したround-tripです。

```text
Node Editor model -> Graph -> Canonical DSL -> Graph -> Editor model
```

これは将来の作業であり、まだ安定したものとして扱いません。

### リリース文言ガイダンス

次リリースを「完全な DSL <-> Node Graph round-trip」とは表現しません（source-preserving保証をまだ提供しないため）。

推奨:

```text
Canonical DSL round-trip v1
DSL / Node Editor semantic round-trip foundation
```

避ける:

```text
Complete DSL <-> Node Graph round-trip
```

### 推奨される次のステップ

1. 小さなparse / compile fixturesを追加する。
2. semantic round-trip向けgraph normalizationの意図を、実装詳細を固定しすぎない形で文書化し続ける。
3. semantic graph snapshot testsを追加する。
4. Canonical DSL round-trip v1 のsemantic fixture coverageを、安定化したノード群へ段階的に広げる。
5. source-preservingな editor round-trip testsは将来作業として扱う。
