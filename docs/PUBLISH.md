# Verdaccio への publish 手順

## 前提

`~/.npmrc` に Verdaccio の認証情報が登録されていること。

```bash
npm login --registry https://upm.afjk.jp
```

## publish 手順

### 1. バージョンを bump する

`package.json` の `version` を semver に従って更新します（例: `0.1.0` → `0.1.1`）。

### 2. コミットしてタグを打つ

```bash
git commit -am "chore: bump version to x.y.z"
git tag vx.y.z
git push --follow-tags
```

### 3. publish する

```bash
npm publish
```

`prepublishOnly` フックにより `editor-pro` が自動ビルドされてから publish されます。  
古い `dist/` が混入しないよう、毎回クリーンビルドが走ります。

### 4. 公開を確認する

Verdaccio Web UI でパッケージが登録されたことを確認します。

```
https://upm.afjk.jp/-/web/detail/@afjk/loom
```

## エラー対処

### "scoped packages を publish する権限がない" と言われた場合

Verdaccio の `${VERDACCIO_DATA_DIR}/config/config.yaml` の `packages:` セクションに以下を追加してコンテナを再起動します。

```yaml
'@afjk/*':
  access: $all
  publish: $authenticated
  unpublish: $authenticated
```

```bash
docker compose restart verdaccio
```

既存の `@*/*` パターンが有効であれば追加不要です。

## ローカルでの動作確認（npm pack）

publish 前にパッケージ内容を確認するには `npm pack` を使います。

```bash
npm pack
tar tf afjk-loom-*.tgz
```

期待される top-level エントリ：

```
package/package.json
package/README.md
package/src/
package/editor/
package/editor-pro/dist/
package/examples/
```

> **注意**: `npm pack` は `prepublishOnly` を実行しません（npm v7 以降）。  
> `editor-pro/dist/` の内容を確認したい場合は事前に `npm run build:editor-pro` を実行してください。

## 今後の自動化について

現在は手動 publish ですが、将来的に GitHub Actions による自動 publish（例: `v*` タグ push 時）に移行できます。  
`secrets.VERDACCIO_AUTH_TOKEN` を設定して `npm publish --registry https://upm.afjk.jp` を実行するワークフローを追加するだけで対応可能です（現時点では実装しない）。
