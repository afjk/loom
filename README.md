# Loom

A stateless dataflow engine for the browser. Build reactive visual, audio, and 3D content by composing pure functions.

---

ブラウザで動くステートレスなデータフロー実行エンジン。純粋な関数の合成により、リアクティブな視覚・音響・3D コンテンツを構築します。

## ステータス

**第一段階：プロトタイプ実装中**

第ゼロ段階のプロトタイプは完了済み。第一段階ではイベント型と入力ノードを導入し、現在プロトタイプ実装フェーズです。イベント型ポート、入力ノード（pointerClick、pointerPosition、keyDown、keyUp）、イベント変換ノード（filter、sample、merge）の実装が進行中です。

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

* テスト：`http://localhost:8000/test/loom.test.html`

## ライセンス

MIT License
