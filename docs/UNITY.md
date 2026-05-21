# Loomlet Unity 対応ガイド

Unity 向け C# ランタイムを `unity/com.afjk.loom` に追加しています。

## 概要

Unity 版 Loomlet は JavaScript 版と同じ JSON グラフを評価します。  
グラフ DSL は Unity 側では直接扱わず、DSL をパースした後の JSON グラフを入力とします。

```text
Graph DSL → JSON graph → Web Loomlet / Unity Loomlet で評価
```

IL2CPP 互換を想定しており、Roslyn・動的コンパイル・外部 NuGet 依存は不要です。

## Unity パッケージの配置

```text
unity/com.afjk.loom/
  package.json
  Runtime/
    Loom.asmdef
    Loom/
      LoomEngine.cs            — メインエンジン
      LoomGraph.cs             — グラフモデル + JSON パーサ
      LoomNode.cs              — ノード型定義・ヘルパー
      LoomError.cs             — LoomException
      LoomExpressionDsl.cs     — filter.predicate 式 DSL
      LoomSceneSyncAdapter.cs  — SceneSync メッセージ処理
      Nodes/
        CoreNodes.cs           — clock, constant, sine, add, multiply
        EventNodes.cs          — filter, sample, merge, pointerClick, pointerPosition, keyDown, keyUp
        SceneSyncNodes.cs      — serverClock, sceneSetPosition, sceneSetRotation, ...
      Unity/
        ILoomTargetResolver.cs
        LoomUnityTargetResolver.cs
        LoomSceneSyncBehaviour.cs
  Tests/
    EditMode/
      Loom.Tests.asmdef
      LoomEngineTests.cs
      LoomExpressionDslTests.cs
      LoomSceneSyncAdapterTests.cs
      LoomUnityTargetResolverTests.cs
```

## インポート方法

### 方法 1: ローカルパス参照（開発時）

Unity Package Manager を開き、**「+ > Add package from disk...」** で `unity/com.afjk.loom/package.json` を選択します。

### 方法 2: Git URL

`Packages/manifest.json` に以下を追加します。

```json
{
  "dependencies": {
    "com.afjk.loom": "https://github.com/afjk/loomlet.git?path=unity/com.afjk.loom"
  }
}
```

## LoomSceneSyncBehaviour の使い方

### 基本設定

1. シーン内の適当な GameObject に `LoomSceneSyncBehaviour` コンポーネントを追加します。
2. WebSocket などで `scene-graph-*` メッセージを受信したら `HandleJsonMessage(json)` を呼び出します。

```csharp
// WebSocket メッセージ受信コールバックの例
void OnWebSocketMessage(string json)
{
    GetComponent<LoomSceneSyncBehaviour>().HandleJsonMessage(json);
}
```

### 毎フレームの更新

`Update()` は `MonoBehaviour` のライフサイクルで自動的に呼ばれます。  
手動で呼び出す必要はありません。

## scene-graph-set JSON の例

以下の JSON を `HandleJsonMessage` に渡すと、"Cube" という名前の GameObject の X 位置が正弦波で動きます。

```json
{
  "type": "scene-graph-set",
  "scope": "scene",
  "graph": {
    "nodes": [
      { "id": "clock", "type": "serverClock" },
      { "id": "wave",  "type": "sine",            "params": { "freq": 1, "amplitude": 2 } },
      { "id": "move",  "type": "sceneSetPosition", "params": { "target": "Cube" } }
    ],
    "edges": [
      { "from": "clock.t",   "to": "wave.t" },
      { "from": "wave.out",  "to": "move.x" }
    ]
  }
}
```

### オブジェクト単位のグラフ

`scope` を `{ "object": "targetId" }` にすると、特定オブジェクトのみに適用されるグラフを管理できます。

```json
{
  "type": "scene-graph-set",
  "scope": { "object": "Cube1" },
  "graph": {
    "nodes": [
      { "id": "clock", "type": "serverClock" },
      { "id": "wave",  "type": "sine",            "params": { "freq": 0.5 } },
      { "id": "move",  "type": "sceneSetPosition", "params": { "target": "Cube1" } }
    ],
    "edges": [
      { "from": "clock.t",  "to": "wave.t" },
      { "from": "wave.out", "to": "move.y" }
    ]
  }
}
```

## 実装済みノード

### Phase 0 コアノード

| ノード     | 入力                  | 出力  | 説明                                |
|------------|----------------------|-------|-------------------------------------|
| `clock`    | —                    | `t`   | 現在の engine 時刻（秒）            |
| `constant` | —                    | `out` | 固定値（`params.value`）            |
| `sine`     | `t`, `freq`, `amplitude`, `phase`, `offset` | `out` | `amplitude * sin(t * freq * 2π + phase) + offset` |
| `add`      | `a`, `b`             | `out` | `a + b`                             |
| `multiply` | `a`, `b`             | `out` | `a * b`                             |

### Phase 1 イベントノード

| ノード            | 説明                                        |
|-------------------|---------------------------------------------|
| `filter`          | `predicate` を満たすイベントのみ通過         |
| `sample`          | `trigger` 発火時に `value` の現在値を出力    |
| `merge`           | 2 つのイベントストリームを合流               |
| `pointerClick`    | クリックイベント入力ノード                   |
| `pointerPosition` | ポインター位置 behavior ノード（`pos` 出力：`{x, y}`）。初期値 `{x: 0, y: 0}`。`LoomEngine.SetPointerPosition(x, y)` で更新可能。 |
| `keyDown`         | キー押下イベント入力ノード                   |
| `keyUp`           | キー離しイベント入力ノード                   |

#### `pointerPosition` の利用例

```csharp
// 毎フレーム入力システムからポインター位置を更新する
void Update()
{
    var mousePos = Input.mousePosition;
    sceneSyncBehaviour.Engine.SetPointerPosition(mousePos.x, mousePos.y);
}
```

> **Note:** `value.z` は JavaScript Phase 1 仕様に含まれていないため、式 DSL では使用できません。`value.x` / `value.y` のみサポートします。使用すると `EXPRESSION_PARSE_ERROR` がスローされます。

### SceneSync ノード

| ノード             | 説明                                              |
|--------------------|---------------------------------------------------|
| `serverClock`      | `getServerTime()` を `t` として出力               |
| `sceneSetPosition` | `Transform.position` を更新（`target` GameObject） |
| `sceneSetRotation` | `Transform.localEulerAngles` を更新（ラジアン入力 → 度変換） |
| `sceneSetScale`    | `Transform.localScale` を更新                    |
| `sceneSetColor`    | `Renderer.material.color` を更新（alpha 維持）    |
| `sceneSetVisible`  | `GameObject.SetActive(bool)` を呼び出す           |

### Coordinate System Mapping

When implementing `sceneSetPosition` and `sceneSetRotation`, the host runtime maps semantic axes (defined in [Semantic Coordinate System](./design/semantic-coordinate-system.md)) to Unity's native coordinate system. The mappings are typically:

```
right  → Transform.position.x
up     → Transform.position.y
front  → Transform.position.z
```

For rotations around semantic axes, the host applies `Quaternion.AngleAxis()` with the mapped axis vector.

## sceneSetRotation の注意事項

`sceneSetRotation` の入力値はラジアンです（JavaScript 版との互換性のため）。  
Unity の `Transform.localEulerAngles` は度数法なので、内部で自動変換されます。

```text
Unity degrees = radians × (180 / π)
```

## target resolver

### デフォルトの `LoomUnityTargetResolver`

`LoomUnityTargetResolver` は以下の動作をします。

1. **明示的な登録を優先** — `RegisterTarget(id, gameObject)` で登録されたオブジェクトは、inactive でも確実に解決できます。
2. **キャッシュ** — 初回検索後は結果をキャッシュし、毎フレーム `GameObject.Find()` を呼ぶコストを回避します。
3. **フォールバック検索** — 未登録・未キャッシュの場合は `Resources.FindObjectsOfTypeAll<GameObject>()` で検索します（inactive なオブジェクトも対象）。

#### 明示的登録 API

```csharp
var resolver = new LoomUnityTargetResolver();

// 明示的に登録（inactive オブジェクトも解決可能）
resolver.RegisterTarget("Cube", gameObject);

// 登録を削除
resolver.UnregisterTarget("Cube");

// すべての登録・キャッシュを削除
resolver.ClearCache();
```

#### `sceneSetVisible` との連携

`sceneSetVisible(false)` で非表示にしたオブジェクトを再び `true` に戻す場合、  
`RegisterTarget()` で事前登録しておくと確実に解決できます。

```csharp
// シーン読み込み時に登録
resolver.RegisterTarget("Cube", cubeGameObject);

// 非表示にしても再表示できる
// sceneSetVisible(false) → sceneSetVisible(true) が正常動作する
```

> **Note:** Unity は GameObject 名の一意性を保証しません。同名オブジェクトが複数ある場合は最初に見つかった方が返されます。一意な解決が必要な場合は `RegisterTarget()` による明示的登録か、独自の `ILoomTargetResolver` 実装を推奨します。

### 独自 target resolver

`ILoomTargetResolver` を実装することで、独自の解決ロジックを使用できます。

```csharp
public sealed class MyCustomResolver : ILoomTargetResolver
{
    public object ResolveTarget(string targetId)
    {
        // 独自の解決ロジック
        return MyObjectRegistry.Find(targetId);
    }
}
```

`LoomSceneSyncAdapter` のコンストラクタにカスタム resolver を渡します。

```csharp
var adapter = new LoomSceneSyncAdapter(
    send: _ => true,
    getServerTime: () => (double)Time.time,
    targetResolver: new MyCustomResolver()
);
```

## Loom 管理オブジェクトの所有権ルール

> Objects controlled by Loom sink nodes should generally be excluded from normal Scene Sync Transform synchronization. Loom motion is synchronized by sharing the graph and evaluating it locally on each client. Synchronizing both the graph and the resulting Transform can cause competing writes, jitter, or last-write-wins behavior.

Loom の sink ノード（`sceneSetPosition` / `sceneSetRotation` / `sceneSetScale` / `sceneSetColor` / `sceneSetVisible`）が書き込むオブジェクトプロパティは、通常の Scene Sync Transform 同期から除外してください。

- Loom はグラフを各クライアントで評価することで動きを同期します
- グラフと Transform 結果の両方を同期すると、競合書き込み・ジッター・最後書き込み優先（last-write-wins）が発生します
- **推奨：** 特定のプロパティへの書き込みは 1 つの機構のみが行うようにしてください

## テスト

`Tests/EditMode/` に Unity Test Runner の EditMode テストを用意しています。

- `LoomEngineTests.cs` — コアノード・イベントノード・`pointerPosition`（テスト 1–14、29–30）
- `LoomExpressionDslTests.cs` — 式 DSL（テスト 15–18 + 追加テスト）
- `LoomSceneSyncAdapterTests.cs` — SceneSync アダプタ・Unity ノード（テスト 19–28）
- `LoomUnityTargetResolverTests.cs` — target resolver 登録・キャッシュ・非表示オブジェクト解決

テスト 1–19、25–30 および `ExtraTest_*` は純 C# で Unity なしでも dotnet で検証済みです（37 テスト全て pass）。  
テスト 20–24（sceneSetPosition 等）と `LoomUnityTargetResolverTests` の Unity テストは Unity Test Runner が必要です。

## 未対応事項

以下は現バージョンでは対応していません。

- WebSocket 接続実装（`HandleJsonMessage` に JSON を直接渡す形で動作確認可）
- グラフ DSL パーサ（JSON グラフを直接使用）
- ビジュアルエディタ
- Unity Editor 拡張
- Unity Package Manager（UPM）への公開
- マルチプレイヤー同期の本実装
- `scene-graph-input` メッセージの処理（Phase 2 以降）

