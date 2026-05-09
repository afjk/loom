# Scoped Reactive Host メモ

このメモは、Loomlet Core の外側にある Host 設計のための短い計画メモです。

Loomlet 単体は、小さな dataflow / FRP graph 言語として保つことができます。一方で、Scene Sync、将来の Grid Host、Agent / Boids Host などでは、Host が複数の scope を管理し、それぞれの scope の中で Loomlet graph を評価します。

この文書は Loomlet Core の正式仕様ではありません。将来の Host contract を検討するための計画メモです。

## Scope

scope は、Host が定義する「Loomlet graph の評価単位」です。

例:

- `scene`: Scene Sync のシーン全体
- `object`: Scene Sync のオブジェクト
- `cell`: grid のセル
- `agent`: boid / particle / entity
- その他、Host が定義する単位

Host は、scope のライフサイクル、scope context、入力 resource、出力の適用、一括反映を管理します。

## 基本実行ルール

graph 同士は、互いの live output を直接読むことで通信しません。

代わりに、各 turn は snapshot / command / commit モデルで進みます。

```text
turn start:
  Host が environment snapshot を固定する

evaluate:
  各 scope graph が snapshot + scope context + host resource を読む
  各 graph が output command を出す

commit:
  Host が command を収集する
  Host が conflict を deterministic に解決する
  Host が next environment を commit する
```

commit された environment は、次回以降の turn で読み取れるようになります。

つまり、別の object / cell / agent を読むということは、別の graph を直接読むことではなく、Host が提供する environment snapshot を読むことです。

## Double-buffered environment

共有 environment は double-buffered なものとして扱います。

- 読み取りは turn 開始時の snapshot から行う
- 書き込みは command または next buffer write として出力する
- 書き込みは同じ turn 中には読み取れない
- すべての書き込みは評価後に commit される

これにより、評価順に依存しにくくなり、即時の循環依存も避けやすくなります。

このモデルは Grid Rule Host の考え方とも一致します。cell は前回の grid 値を読み、次の値を出力します。Scene Sync object rule でも同じ規律を使えます。object は前回の scene snapshot を読み、次の transform / state を出力します。

## デフォルトは self-write

scope-local graph は、原則として self-write only にします。

例:

```text
object scope:
  自分の object state だけを書く

cell scope:
  自分の cell state だけを書く

agent scope:
  自分の agent state だけを書く
```

これにより、多くの write conflict を避けられ、並列実行もしやすくなります。

ある scope が別の scope に影響したい場合は、直接 write するのではなく、intent / event / request を environment に出力し、次回以降の turn で対象 scope、scene scope、または Host-level resolver が処理することを優先します。

scene-level や global な scope は、より広い write 権限を持つことがあります。ただし、それは明示的な Host capability として扱うべきです。

## Scene Sync への対応

Scene Sync は scoped host として見ることができます。

- scene-level Loomlet graph: scene scope のふるまい
- object-level Loomlet graph: object scope のふるまい
- scene snapshot: shared environment
- scene-batch / scene-delta: commit される output command

将来的な shared-rule mode では、1つの compiled graph を、選択された複数の Scene Sync object に毎 turn 適用できます。

これは object ごとに固有の graph を割り当てる方式とは異なりますが、どちらも同じ scope model で扱えます。

## Grid / Agent への対応

同じパターンは次のように一般化できます。

```text
Grid Rule Host:
  scope = cell
  environment = grid snapshot
  output = next cell value/color

Agent / Boids Host:
  scope = agent
  environment = agent collection snapshot
  output = next position/velocity/state

Scene Sync Object Rule Host:
  scope = object
  environment = scene snapshot
  output = next transform/component commands
```

Host は現在の scope の context を提供します。また、neighbor count、近くの object の要約、spatial query result などの集約 input を提供してもよいです。

## 並列化しやすい実装メモ

このモデルは、最初は single-threaded に実装し、後から意味論を変えずに scale できるようにしておきます。

有効そうな実装方針:

- 各 graph shape は一度だけ compile する
- scope ごとの context / state は分離して持つ
- 有効な場合は scope-local state を Structure of Arrays 形式の buffer に持つ
- 同じ graph shape の scope を archetype として batch 評価する
- immutable snapshot から読む
- command buffer または next buffer に書く
- command は worker の完了順ではなく、stable metadata で解決する
- time / random / query input は Host が提供し、turn ごとに deterministic にする

想定する scale path:

```text
1. single-thread reference implementation
2. compile-once + per-scope state buffers
3. archetype-style batch evaluation
4. Web Worker / Worker pool evaluation
5. grid 系 workload 向けの optional GPU/WebGPU backend
```

重要なのは、最初から並列実行することではありません。あとから並列実行を導入しても壊れない deterministic semantics を先に決めることです。

## Conflict resolution

Host は、同じ turn で複数の command が同じ target field に書き込むことを許す前に、deterministic な conflict resolution を定義する必要があります。

推奨するデフォルト:

- scope-local graph は self-write only
- cross-scope effect はデフォルトで intent / event / request として扱う
- global write は明示的に許可された scope に制限する
- それでも conflict が起きる場合は、stable priority と stable source order で解決する

worker の完了順を semantic order として使ってはいけません。

## AI生成への影響

AI が生成する DSL には、対象となる scope が分かっている必要があります。

formal metadata ができるまで、有用な target comment の例:

```text
# Target: scenesync-object-scope
# Scope: object
```

```text
# Target: future-grid-rule-host
# Scope: cell
# Sketch only: not currently runnable
```

```text
# Target: future-agent-rule-host
# Scope: agent
# Sketch only: not currently runnable
```

target / scope がないと、AI は portable Loomlet DSL、VS Code Preview helper、Scene Sync object logic、将来の grid / agent API を混ぜてしまう可能性があります。

## まとめ

有用なメンタルモデルは次の通りです。

```text
Loomlet Core:
  dataflow graph を評価する

Scoped Host:
  多数の scope を管理する
  environment snapshot と scope context を提供する
  output command を収集する
  next environment を commit する
```

この分離により、Loomlet Core を小さく保ちながら、Scene Sync object behavior、grid / cellular automata、boids、その他の創発的な system に拡張する余地を残せます。
