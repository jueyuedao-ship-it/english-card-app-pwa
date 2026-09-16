# 英単語単語帳 PWA

元の単一HTMLを、GitHub Pagesで公開しやすいPWA構成へ分割した版です。

## 構成

```text
english-vocab-pwa/
├─ index.html
├─ styles.css
├─ app.js
├─ pwa.js
├─ manifest.webmanifest
├─ sw.js
├─ .nojekyll
├─ icon-192.png
└─ icon-512.png
```

## GitHub Pages

このフォルダの中身をリポジトリの公開対象ディレクトリへ配置してください。
パスは `./` 基準の相対指定なので、`https://<user>.github.io/<repo>/` のようなプロジェクトサイトでもリポジトリ名をコードへ埋め込む必要はありません。

## オフライン動作

初回アクセス時にアプリ本体をService Workerでキャッシュします。以後はネットワークが利用できない場合でも、キャッシュ済みのHTML/CSS/JavaScriptから起動できます。

学習進捗、ページフィルター、最後に開いたタブなどのデータは、元アプリと同じくブラウザの `localStorage` に保存されます。ブラウザデータを削除すると消えるため、必要に応じてアプリ内のエクスポート機能を使用してください。

## ローカル確認

Service Workerは `file://` では動かないため、開発時はHTTPサーバーを使用します。

```powershell
cd english-vocab-pwa
python -m http.server 8000
```

その後 `http://localhost:8000/` を開きます。

## 更新時

Service Workerのキャッシュ構成を大きく変更した場合は、`sw.js` の `CACHE_NAME` のバージョンを上げてください。
