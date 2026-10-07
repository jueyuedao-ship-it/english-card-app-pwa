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

単語ごとの状態は「完璧」「不安」「未挑戦」のいずれか1つです。フラッシュカードと4択クイズの正誤は両モード共通の状態へ反映され、全単語リストでは手動で変更できます。正解は「完璧」、不正解は「不安」に更新されます。状態の絞り込みもできます。

旧版の `mastery` と `known` は「完璧」、`unknown` は「不安」へ移行します。旧形式には記録時刻がないため、同じ単語が複数の状態に含まれていた場合は「不安」を表示し、移行前の配列は新しいバックアップの `wordStatuses.legacy` に保存します。高専モードの旧4択クイズ結果は保存されていなかったため、単語ごとの履歴は復元できません。TOEICの `toeic-N` 順位IDはそのまま使います。旧バックアップは引き続きインポートでき、新しいバックアップには旧版でも読める配列項目も含めます。

## ローカル確認

Service Workerは `file://` では動かないため、開発時はHTTPサーバーを使用します。

```powershell
cd english-vocab-pwa
python -m http.server 8000
```

その後 `http://localhost:8000/` を開きます。

## 更新時

Service Workerのキャッシュ構成を大きく変更した場合は、`sw.js` の `CACHE_NAME` のバージョンを上げてください。

## TOEIC Bridge の意味データ

CEFR-J Wordlist v1.5 の A1・A2・B1、全5,021件を使用しています。
英語見出し・品詞・CEFRの出典と利用条件は `THIRD_PARTY_NOTICES.md` に記載しています。
日本語の意味は、アプリ向けに品詞と基本的な語義を確認して作成した学習用の訳です。

正本は `data/toeic/entries.json` です。`headword`・`pos`・`cefr` が元データの識別キー、
`word` は既存の表示表記、`rank` は既存の順位、`priority` は既存の優先度です。
`fine` の形容詞と名詞、`bear` の名詞と動詞などは別項目として管理します。
短縮形 `s/re/m` の元見出しは `'s/'re/'m`、`TRUE/FALSE` は `true/false` です。

意味を修正するときは正本の `meaning` を編集し、Node.js 22以降で次を実行してください。

```powershell
node scripts/generate-toeic-meanings.mjs
node scripts/generate-toeic-meanings.mjs --check
node --test tests/*.test.mjs
```

生成はローカルの固定された元CSVと品詞別の日本語データだけを使用し、外部辞書への通信や
訳語の自動推測は行いません。`--check` は生成内容と全8ファイルが一致するかを確認します。
エラー値、空の意味、日本語を含まない意味、品詞キーの重複・欠落、順位・CEFR・優先度の変更は
生成時に拒否します。意味を更新したときは `sw.js` のキャッシュバージョンも更新してください。

生成された各行は `[word, meaning, cefr, priority, pos, headword]` です。
従来の最初の4項目と全件の並びを保つため、既存の進捗IDと発音記号の対応は変わりません。
綴り違いは元CSVの `/` 区切りを使って正規化し、`am` のbe動詞と午前の略語は品詞で区別します。
同じ略形が複数の見出しに当たる場合は、曖昧な一致を採用しません。

GitHub Actions は全テストと意味データの再生成一致を確認します。
CIで発音記号を再生成・自動コミットする処理は外し、既存の発音記号を検証する方式にしています。

PlaywrightとChromeが使える環境では、HTTPサーバーを起動してブラウザでの回帰確認も実行できます。

```powershell
node scripts/check-toeic-browser.cjs http://localhost:8000/
```

この確認は専用のブラウザ環境でテスト用進捗を作り、全件表示、意味検索、カード、クイズ、
再読込後の保存内容、フィルター、オフライン復元、高専モードへの切替を確認します。
`TOEIC_BROWSER_MOBILE=1` を指定すると390×844のモバイル画面でも確認します。
実機のiPhone/Safariの検証とは別です。

学習状態の移行・タグ操作・両モードの結果反映・バックアップ互換・再読込をまとめて確認する場合は、
HTTPサーバーを起動した状態で次を実行します。

```powershell
node scripts/check-progress-status.cjs http://localhost:8000/
```

元CSVの `latter / adverb / A2` は一般的な辞書の品詞と一致しないため、元の識別キーを保ちつつ、
意味欄には「後者の／後半の（形容詞の用法）」と記載しています。
[Cambridge Dictionary](https://dictionary.cambridge.org/dictionary/english/latter) と
[Oxford Learner's Dictionary](https://www.oxfordlearnersdictionaries.com/definition/english/latter_1) を確認しました。
