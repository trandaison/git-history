# Onboarding VS Code Extension (`git-file-history`)

Tài liệu này tập trung vào phiên bản VS Code extension trong repo `git-history`, giúp người mới có thể:
- chạy extension local để debug,
- hiểu luồng dữ liệu end-to-end,
- custom UI/UX,
- thêm feature cá nhân mà không phá kiến trúc hiện có.

---

## 1) Bức tranh tổng quan

Repo này có nhiều "mặt": web public, CLI, browser extension, VS Code extension.  
Riêng VS Code extension sử dụng kiến trúc:

- **Host extension (Node, VS Code API)**: nằm ở `vscode-ext/`.
- **UI webview (React app)**: dùng lại code từ `src/` ở root repo, được build thành static site.

Nói ngắn gọn: khi chạy command trong VS Code, extension mở webview và nhúng bản build React vào panel đó.

---

## 2) Luồng chạy chính (rất quan trọng)

1. User chạy command `Git File History` (`extension.git-file-history`).
2. `vscode-ext/extension.js` lấy file đang mở trong editor (`getCurrentPath()`).
3. Extension tạo `WebviewPanel`, load `vscode-ext/site/index.html` (được build từ root `src/`).
4. Extension inject vào HTML:
   - `window.vscode = acquireVsCodeApi()`
   - `window._PATH = <đường dẫn file hiện tại>`
5. React app chạy trong webview, chọn provider `vscode` (qua env build).
6. Provider `src/git-providers/vscode-provider.js` gửi message `commits` sang extension host.
7. `extension.js` nhận message, gọi `vscode-ext/git.js` để chạy `git log` + `git show`.
8. Extension trả danh sách commits + nội dung file từng commit về webview.
9. React render timeline/slides và diff.

---

## 3) Các file bạn nên đọc theo thứ tự

### 3.1 Extension host
- `vscode-ext/package.json`
  - định nghĩa command, activation event, script build/test/publish.
- `vscode-ext/extension.js`
  - entrypoint extension (`activate`), tạo webview, message bridge.
- `vscode-ext/git.js`
  - lớp truy cập git local bằng `execa`.

### 3.2 Frontend webview (dùng chung ở root `src/`)
- `src/app.js`
  - root component, load versions và render lịch sử.
- `src/git-providers/providers.js`
  - chọn provider theo `REACT_APP_GIT_PROVIDER`.
- `src/git-providers/vscode-provider.js`
  - contract message giữa webview <-> extension host.
- `src/history.js`, `src/slide.js`, `src/scroller.js`
  - phần hiển thị UI timeline/diff.
- `src/app-helpers.js`
  - loading/error UI.

### 3.3 Build config
- `vscode-ext/package.json` script `build-site`
- `craco.config.js`
  - `globalObject: "this"` để hỗ trợ `workerize-loader` (dù provider vscode không dùng worker).

---

## 4) Cách chạy và debug extension local

## Yêu cầu
- VS Code
- Node/Yarn tương thích repo hiện tại
- Git có sẵn trong máy (extension gọi trực tiếp lệnh `git`)

## Cài dependencies
Từ root:

```bash
yarn
```

Trong `vscode-ext/`:

```bash
yarn
```

## Build webview cho VS Code
Từ `vscode-ext/`:

```bash
yarn build
```

Script này sẽ:
- chạy build React ở root với env `REACT_APP_GIT_PROVIDER=vscode`,
- copy output vào `vscode-ext/site/`.

## Debug extension
- Mở folder `vscode-ext` trong VS Code.
- Nhấn `F5` với launch config `Extension` (`vscode-ext/.vscode/launch.json`).
- Trong Extension Development Host:
  - mở một file trong repo git,
  - mở Command Palette -> chạy `Git File History`.

Nếu panel mở và có lịch sử commit thì luồng đã OK.

## Workflow dev thuận tiện (gần hot reload)

Từ `vscode-ext/` chạy:

```bash
yarn dev-site
```

Script này sẽ:
- build site lần đầu,
- watch thay đổi ở `../src`, `../public`, `../craco.config.js`,
- tự build lại `vscode-ext/site` khi có thay đổi.

`extension.js` đã được bổ sung watcher cho thư mục `site`, nên webview panel sẽ tự refresh sau mỗi lần rebuild (không cần đóng/mở command liên tục).

---

## 5) Hợp đồng message giữa webview và extension

### Từ webview -> extension
- command: `commits`
- payload: `{ path, last }`

### Từ extension -> webview
- mảng commit objects, mỗi object có:
  - `hash`
  - `author.login`
  - `date`
  - `message`
  - `content` (nội dung file tại commit đó)

Khi thêm feature mới (ví dụ "load by branch", "show parent diff"), đây là chỗ mở rộng contract trước tiên.

---

## 6) Điểm custom UI/UX nên bắt đầu

Nếu mục tiêu là cải tiến trải nghiệm:

- **Header commit/timeline**: `src/history.js`
  - cách hiển thị tác giả, ngày, commit message, điều hướng trái/phải.
- **Hiển thị code và diff**: `src/slide.js`, `src/scroller.js`, `src/scroller.css`.
- **Loading/Error/Empty states**: `src/app-helpers.js`.
- **Theme/colors/fonts**:
  - hiện tại có styles inline + CSS file rải rác (`src/*.css`).
  - nên gom token/theme để custom nhất quán.

Gợi ý roadmap UI/UX:
1. Chuẩn hóa design token (màu, spacing, typography).
2. Tách inline styles lớn sang CSS module hoặc style system.
3. Cải thiện keyboard UX + accessibility (focus state, aria, contrast).
4. Thêm commit metadata rõ hơn (branch/tag, short hash copy, relative time).

---

## 7) Điểm mở rộng feature (backend logic của extension)

Khi thêm feature cá nhân, thường đụng:

- `vscode-ext/git.js`:
  - thêm dữ liệu commit (author email, refs, parent hash, file status, ...).
  - thay đổi chiến lược query git.
- `vscode-ext/extension.js`:
  - nhận command mới từ webview.
  - gọi git layer tương ứng và trả dữ liệu về panel.
- `src/git-providers/vscode-provider.js`:
  - thêm method mới gọi `vscode.postMessage(...)`.
- `src/app.js` hoặc các component con:
  - render dữ liệu mới.

Pattern hiện tại là request/response 1 bước qua `window.postMessage`, dễ mở rộng.

---

## 8) Các giới hạn kỹ thuật hiện tại (nên biết sớm)

1. **Không dùng web worker trong VS Code webview provider**  
   `providers.js` đã tắt worker cho provider `vscode`.

2. **Git query theo tên file (`basename`) trong thư mục hiện tại**  
   `vscode-ext/git.js` dùng:
   - `cwd = dirname(path)`
   - file target = `basename(path)`  
   Nghĩa là logic phụ thuộc thư mục hiện tại của file, không phải full repo root.

3. **Chưa có test thực chất cho extension logic**  
   `vscode-ext/test/extension.test.js` đang là sample test mặc định.

4. **Bridge message chưa có correlation id**  
   provider đang `window.addEventListener(..., { once: true })`, nếu sau này có nhiều request song song cần protocol rõ hơn.

---

## 9) Đề xuất kế hoạch onboarding cho dev mới (1-2 ngày)

### Ngày 1
- Chạy build + debug extension thành công.
- Đọc 6 file cốt lõi:
  - `vscode-ext/package.json`
  - `vscode-ext/extension.js`
  - `vscode-ext/git.js`
  - `src/app.js`
  - `src/git-providers/providers.js`
  - `src/git-providers/vscode-provider.js`
- Làm thay đổi UI nhỏ (ví dụ footer/header) để quen luồng build.

### Ngày 2
- Thêm 1 field mới vào commit payload (ví dụ author email hoặc full hash).
- Hiển thị field đó trên UI.
- Ghi lại mini ADR: thay đổi ở đâu, contract message mới là gì, backward compatibility ra sao.

---

## 10) Checklist trước khi merge thay đổi

- `yarn build` trong `vscode-ext/` chạy thành công.
- Mở được panel từ command `Git File History`.
- Không crash khi:
  - không có active editor,
  - file không thuộc git repo,
  - file có lịch sử ít commit.
- UI không bị vỡ ở cửa sổ VS Code hẹp.
- Nếu đổi message contract: cập nhật cả 2 đầu (webview + extension host).

---

Nếu bạn muốn, bước tiếp theo mình có thể viết thêm:
- một **bản kiến trúc dạng sơ đồ** (sequence + component),
- hoặc một **task breakdown theo milestone UI/UX + feature cá nhân** để triển khai tuần tự.
