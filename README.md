# CalcReact

React + TypeScript + Viteで作成した電卓Webアプリです。

## 機能

- 四則演算、小数点、符号反転、パーセント
- 連続計算とゼロ除算のエラー処理
- キーボード入力に対応
- レスポンシブUI
- GitHub ActionsによるGitHub Pagesのビルド・デプロイ

## ローカルでの実行

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## GitHub Pages

`main`ブランチにプッシュすると、`.github/workflows/deploy-pages.yml`が`dist`をビルドし、GitHub Pagesへデプロイします。
リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定する必要があります。
