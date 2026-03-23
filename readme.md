# Git File History (Fork)

Fork của dự án `git-history`, tập trung vào trải nghiệm xem lịch sử file nhanh, trực quan và dễ mở rộng cho nhu cầu cá nhân.

Repository: [https://github.com/trandaison/git-history](https://github.com/trandaison/git-history)

## Tính năng chính

- Xem lịch sử commit theo từng file với timeline trực quan
- So sánh nội dung file theo từng mốc commit
- Hỗ trợ luồng local qua VS Code Extension
- Tái sử dụng cùng codebase UI cho cả web và extension

## Cấu trúc repo

- `src/`: giao diện React và logic hiển thị history/diff
- `public/`: static assets cho web app
- `vscode-ext/`: VS Code extension host + webview bundle
- `vscode-ext/site/`: output build để extension nhúng vào webview

## Yêu cầu môi trường

- Node.js (khuyến nghị Node 18+)
- Yarn 1.x
- Git CLI
- VS Code (nếu phát triển extension)

## Chạy local để development

### 1) Clone và cài dependencies

```bash
git clone https://github.com/trandaison/git-history.git
cd git-history
yarn
cd vscode-ext && yarn
```

### 2) Chạy web app local

Từ thư mục root:

```bash
yarn start
```

Web app sẽ chạy ở local dev server (mặc định `http://localhost:3000`).

### 3) Build webview cho VS Code extension

Từ thư mục `vscode-ext/`:

```bash
yarn build
```

Lệnh này sẽ build UI ở root với provider cho VS Code, rồi copy output sang `vscode-ext/site/`.

### 4) Dev extension với chế độ watch

Từ `vscode-ext/`:

```bash
yarn dev-site
```

Script sẽ theo dõi thay đổi ở `src/`, `public/`, `craco.config.js` và tự build lại webview site.

### 5) Debug extension trong VS Code

- Mở thư mục `vscode-ext` bằng VS Code
- Nhấn `F5` (launch config `Extension`)
- Trong cửa sổ Extension Development Host, mở 1 file thuộc git repo
- Mở Command Palette và chạy command `Git File History`

## Đóng gói và publish VS Code extension

Từ `vscode-ext/`:

```bash
npx @vscode/vsce package
```

Định danh extension theo Marketplace format:

- `publisher`: `trandaison`
- `name`: `git-file-history`
- Extension ID: `trandaison.git-file-history`

## Scripts chính

### Root

- `yarn start`: chạy web app local
- `yarn build`: build web app production
- `yarn test`: chạy test

### vscode-ext

- `yarn build`: build webview site cho extension
- `yarn dev-site`: watch và rebuild webview site
- `yarn test`: chạy extension test
- `yarn vscode:prepublish`: build trước khi publish

## License

MIT
