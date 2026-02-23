# Semantic Explorer (Vector Explorer)

## 概要 (Overview)
Semantic Explorerは、テキストデータをベクトル化し、意味的な類似性に基づいて可視化・探索できるReactアプリケーションです。
Xenova Transformersを用いてブラウザ上で直接（クライアントサイドのみで）埋め込み（Embeddings）を生成し、コサイン類似度計算によるクラスタリングや検索機能を提供します。

### 主な機能 (Features)
*   **クライアントサイドAI**: サーバーを介さず、ブラウザ上でテキストをベクトル化。
*   **動的クラスタリング**: 入力されたデータセットを自動的に類似度でグループ化。
*   **セマンティック検索**: キーワードの意味に近いアイテムを検索・ハイライト。
*   **テーマ切り替え**: Neumorphism, Material 2/3, Windows 10風のUIテーマに対応。
*   **レスポンシブデザイン**: Gridレイアウトによる動的なタイル配置。

## デモ (Demo)
GitHub Pagesで公開されています: [Demo Link](https://dma-cmyk.github.io/Semantic-Explorer/)
*(URLはリポジトリ名に応じて変更してください)*

## ローカルでの実行方法 (How to run locally)

1.  リポジトリをクローンします
    ```bash
    git clone https://github.com/dma/Semantic-Explorer.git
    cd Semantic-Explorer
    ```
2.  依存関係をインストールします
    ```bash
    npm install
    ```
3.  開発サーバーを起動します
    ```bash
    npm run dev
    ```

## ビルドとデプロイ (Build & Deploy)

GitHub Actionsを使用して、`main`ブランチへのプッシュ時に自動的にGitHub Pagesへデプロイされるように設定されています。

手動でビルドする場合:
```bash
npm run build
```
`dist`フォルダに静的ファイルが生成されます。

## 技術スタック (Tech Stack)
*   React
*   TypeScript (Vite)
*   Tailwind CSS
*   Lucide React (Icons)
*   @xenova/transformers (Client-side AI models)

## ライセンス (License)
MIT License
