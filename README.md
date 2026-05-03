# Loom

[![Tests](https://github.com/afjk/loom/actions/workflows/test.yml/badge.svg)](https://github.com/afjk/loom/actions/workflows/test.yml)

A stateless dataflow engine for the browser. Build reactive visual, audio, and 3D content by composing pure functions.

---

ブラウザで動くステートレスなデータフロー実行エンジン。純粋な関数の合成により、リアクティブな視覚・音響・3D コンテンツを構築します。

## ステータス

**第一段階：プロトタイプ実装完了、仕様確定**

第ゼロ段階および第一段階のプロトタイプ実装が完了。仕様書はバージョン 0.2.0 でクロスプラットフォーム評価セマンティクスを確定し、Phase 1.5（SceneSync アダプタ）および Phase 1.6（Unity 対応）の実装フェーズに進行可能となりました。

## 背景・モチベーション

アート、インタラクティブ作品、ゲームなどのリアルタイムなコンテンツでは、視覚・音響・3D 空間の変化を時々刻々と計算する必要があります。こうしたシステムは状態管理が複雑になりがちで、デバッグや再現が難しいという課題があります。

Loom は、データフロー思想に基づき、現在時刻と入力値だけから出力が決まる「ステートレス」な設計を基本とします。これにより：

- 任意のタイミングで同じ計算を再実行しても、同じ結果が得られる
- 動作が予測可能で、デバッグが容易
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
- ノード 5 種類の詳細仕様
- グラフ定義の JSON フォーマット
- 公開 API（Loom エンジンの使用方法）
- 評価モデル
- ロードマップ

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
* **ライブエディタ**：https://afjk.github.io/loom/editor/
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

* **ライブエディタ**：`http://localhost:8000/editor/`

* テスト：`http://localhost:8000/test/loom.test.html`

* SceneSync アダプタテスト：`http://localhost:8000/test/loom-scenesync.test.html`

## CI と自動テスト

GitHub Actions で自動テストを実行しています。ローカルで `npm test` を実行する場合は、`package.json` が必要ですが、これは CI 自動化専用です。`src/loom.js` は依存ライブラリゼロの単一ファイル配布であり、package.json は開発用ツール（Playwright、http-server）のみを含みます。

## ライセンス

MIT License
