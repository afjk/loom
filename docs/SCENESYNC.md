# Loom SceneSync アダプタ

## 1. 概要

Loom SceneSync アダプタ（`src/loom-scenesync.js`）は、Loom のステートレスなグラフ評価を SceneSync メッセージプロトコルで制御する。

### 特徴

- **WebSocket / サーバ非依存**: メッセージの送受信は外部注入（`send` 関数）
- **複数グラフ対応**: シーン全体グラフとオブジェクト単位グラフを独立管理
- **クライアント評価**: ステートレスなグラフ定義は broadcast、入力は各クライアントでローカル評価
- **拡張可能**: `serverClock` と 5 種の SceneSync sink ノードを提供

### 使用例

```javascript
import { Loom } from "./loom.js";
import { LoomSceneSync } from "./loom-scenesync.js";

const adapter = new LoomSceneSync({
  LoomClass: Loom,
  send: (msg) => socket.send(JSON.stringify(msg)),
  getServerTime: () => syncedClock.now(),
  resolveTarget: (targetId) => objects.get(targetId) ?? null
});

// メッセージ受信
socket.on("message", (data) => {
  adapter.handleMessage(JSON.parse(data));
});

// グラフ実行開始
adapter.start();
```

---

## 2. メッセージプロトコル

### `scene-graph-set`

グラフを設定（または上書き）する。

```json
{
  "type": "scene-graph-set",
  "scope": "scene",
  "graph": {
    "nodes": [
      { "id": "clock", "type": "serverClock" },
      { "id": "pos", "type": "sceneSetPosition", "params": { "target": "cube1" } }
    ],
    "edges": [
      { "from": "clock.t", "to": "pos.x" }
    ]
  }
}
```

**オブジェクト単位グラフの場合:**

```json
{
  "type": "scene-graph-set",
  "scope": { "object": "cube1" },
  "graph": { "nodes": [], "edges": [] }
}
```

**動作:**

- `scope: "scene"` 時：既存シーングラフを停止し、新しいグラフに差し替え。adapter が start 済みなら新グラフを即座に start。
- `scope: { "object": "targetId" }` 時：該当オブジェクトグラフを停止し新グラフに差し替え。

### `scene-graph-clear`

グラフをクリア（削除）する。

```json
{
  "type": "scene-graph-clear",
  "scope": "scene"
}
```

**または:**

```json
{
  "type": "scene-graph-clear",
  "scope": { "object": "cube1" }
}
```

**動作:**

- `scope: "scene"` 時：シーングラフを停止して空グラフに差し替え。
- `scope: { "object": "targetId" }` 時：該当オブジェクトグラフを停止して削除。存在しないなら無視。

### `scene-graph-patch`

差分更新用（Phase 1 では `graph` フィールドがあれば `scene-graph-set` と等価）。

```json
{
  "type": "scene-graph-patch",
  "scope": "scene",
  "graph": { "nodes": [], "edges": [] }
}
```

### `scene-graph-input`

入力イベント broadcast（Phase 1 では no-op）。

```json
{
  "type": "scene-graph-input",
  "scope": "scene",
  "ref": "click.event",
  "payload": { "x": 100, "y": 200 }
}
```

Phase 2 では、サーバから各クライアントへ入力イベントを配信する予定。

---

## 3. scope 仕様

### シーン全体

```json
"scope": "scene"
```

シーン全体グラフに対する操作。ブロードキャスト可能。

### オブジェクト単位

```json
"scope": { "object": "cube1" }
```

`cube1` という ID のオブジェクト専用グラフ。複数オブジェクトの独立制御が可能。

**無効な例（エラー）:**

```json
"scope": { "target": "cube1" }
```

---

## 4. `LoomSceneSync` API

### コンストラクタ

```javascript
const adapter = new LoomSceneSync({
  LoomClass,
  send,
  getServerTime,
  resolveTarget
});
```

**引数:**

- `LoomClass` (Class): Loom クラス本体。インスタンスではなくクラスを渡すこと。
- `send` (Function): メッセージ送信関数。`(msg: Object) => void`
- `getServerTime` (Function): サーバ同期済み時刻を秒で返す。`() => number`
- `resolveTarget` (Function): targetId から対象オブジェクトを取得。`(targetId: string) => Object | null`

### `handleMessage(msg)`

SceneSync メッセージを受け取って処理。

```javascript
adapter.handleMessage({
  type: "scene-graph-set",
  scope: "scene",
  graph: { nodes: [...], edges: [...] }
});
```

対応するメッセージ型：
- `scene-graph-set`
- `scene-graph-clear`
- `scene-graph-patch`
- `scene-graph-input`

不正な `type` / `scope` はエラーをスロー。

### `start()`

すべてのグラフを開始する。

```javascript
adapter.start();
```

- シーングラフと全オブジェクトグラフの `start()` を呼ぶ
- 以降、新しいグラフが設定されると自動的に `start()` される

### `stop()`

すべてのグラフを停止する。

```javascript
adapter.stop();
```

- シーングラフと全オブジェクトグラフの `stop()` を呼ぶ
- 以降、新しいグラフが設定されても自動 `start()` されない

### `sendGraph(scope, graph)` （オプション）

メッセージを送信する。

```javascript
adapter.sendGraph("scene", { nodes: [...], edges: [...] });
adapter.sendGraph({ object: "cube1" }, graph);
```

内部で `send({ type: "scene-graph-set", scope, graph })` を呼ぶ。

### `clearGraph(scope)` （オプション）

クリアメッセージを送信する。

```javascript
adapter.clearGraph("scene");
adapter.clearGraph({ object: "cube1" });
```

---

## 5. オブジェクト単位グラフの利用

複数オブジェクトを独立に制御したい場合、`scope: { object: "targetId" }` を使う。

### 例：複数立方体の個別制御

```javascript
// キューブ A のグラフ
adapter.handleMessage({
  type: "scene-graph-set",
  scope: { object: "cubeA" },
  graph: {
    nodes: [
      { id: "clock", type: "serverClock" },
      { id: "rot", type: "sceneSetRotation", params: { target: "cubeA" } }
    ],
    edges: [
      { from: "clock.t", to: "rot.y" }
    ]
  }
});

// キューブ B のグラフ
adapter.handleMessage({
  type: "scene-graph-set",
  scope: { object: "cubeB" },
  graph: {
    nodes: [
      { id: "clock", type: "serverClock" },
      { id: "sine", type: "sine", params: { freq: 2, amplitude: 1 } },
      { id: "scale", type: "sceneSetScale", params: { target: "cubeB" } }
    ],
    edges: [
      { from: "clock.t", to: "sine.t" },
      { from: "sine.out", to: "scale.x" },
      { from: "sine.out", to: "scale.y" },
      { from: "sine.out", to: "scale.z" }
    ]
  }
});
```

各オブジェクトグラフは独立して評価される。

---

## 6. ノード仕様

### `serverClock`

**category:** `source`

**入力:** なし

**出力:** `t` (number, kind: behavior)

**パラメータ:** `adapterId` (string, auto-injected)

**説明:** 全クライアント同期済みのサーバ時刻。`getServerTime()` の戻り値を返す。

**例:**

```json
{
  "id": "clock",
  "type": "serverClock"
}
```

### `sceneSetPosition`

**category:** `sink`

**入力:**
- `x` (number, default: 0)
- `y` (number, default: 0)
- `z` (number, default: 0)

**パラメータ:**
- `target` (string): オブジェクト ID
- `adapterId` (string, auto-injected)

**説明:** オブジェクトの位置を設定。`obj.position.set(x, y, z)`

### `sceneSetRotation`

**category:** `sink`

**入力:**
- `x` (number, default: 0) - オイラー角 X（ラジアン）
- `y` (number, default: 0) - オイラー角 Y（ラジアン）
- `z` (number, default: 0) - オイラー角 Z（ラジアン）

**パラメータ:**
- `target` (string): オブジェクト ID
- `adapterId` (string, auto-injected)

**説明:** オブジェクトの回転を設定。`obj.rotation.set(x, y, z)`

### `sceneSetScale`

**category:** `sink`

**入力:**
- `x` (number, default: 1)
- `y` (number, default: 1)
- `z` (number, default: 1)

**パラメータ:**
- `target` (string): オブジェクト ID
- `adapterId` (string, auto-injected)

**説明:** オブジェクトのスケールを設定。`obj.scale.set(x, y, z)`

### `sceneSetColor`

**category:** `sink`

**入力:**
- `r` (number, default: 1) - Red (0..1)
- `g` (number, default: 1) - Green (0..1)
- `b` (number, default: 1) - Blue (0..1)

**パラメータ:**
- `target` (string): オブジェクト ID
- `adapterId` (string, auto-injected)

**説明:** マテリアルの色を設定。`material.color.setRGB(r, g, b)`。`material` が配列の場合は最初の要素のみ更新。

### `sceneSetVisible`

**category:** `sink`

**入力:**
- `visible` (boolean, default: true)

**パラメータ:**
- `target` (string): オブジェクト ID
- `adapterId` (string, auto-injected)

**説明:** オブジェクトの表示・非表示を切り替え。`obj.visible = Boolean(visible)`

---

## 7. エラーハンドリング

以下のエラーが発生する可能性がある。

### `INVALID_MESSAGE`

```javascript
// msg が object でない
// type フィールドが不明
```

### `INVALID_SCOPE`

```javascript
// scope が "scene" でも { object: string } でもない
adapter.handleMessage({
  type: "scene-graph-set",
  scope: { target: "cube1" },  // ❌ INVALID_SCOPE
  graph: { nodes: [], edges: [] }
});
```

### `INVALID_GRAPH`

```javascript
// graph フィールドがない、または不正な形式
```

---

## 8. 複数アダプタの管理

同じ `LoomClass` に対して複数の `LoomSceneSync` インスタンスを作成できる。

各アダプタは独立した `getServerTime` / `resolveTarget` を保持する。

```javascript
const adapter1 = new LoomSceneSync({
  LoomClass: Loom,
  send: (msg) => client1.send(JSON.stringify(msg)),
  getServerTime: () => time1,
  resolveTarget: (id) => objects1.get(id)
});

const adapter2 = new LoomSceneSync({
  LoomClass: Loom,
  send: (msg) => client2.send(JSON.stringify(msg)),
  getServerTime: () => time2,
  resolveTarget: (id) => objects2.get(id)
});
```

ノード型登録は冪等であり、複数インスタンスでも重複登録エラーは発生しない。

---

## 9. 未対応事項

以下は Phase 2 以降での実装予定。

- **入力 broadcast**: `scene-graph-input` でサーバからクライアントへのイベント配信
- **差分 patch 適用**: `scene-graph-patch` の効率的な差分更新
- **Unity 連携**: C# 実装との通信
- **afjk.jp 側統合**: ライブコラボレーション機能

---

## 10. 参考リンク

- [Loom SPEC.md](./SPEC.md)
- [Three.js アダプタ](../src/loom-three.js)
