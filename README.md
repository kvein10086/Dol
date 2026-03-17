# Dol

## 部署说明（GitHub Actions → Cloudflare Workers + R2）

本仓库包含超大单文件 HTML（例如 [`Degrees of Lewdity.html`](Degrees%20of%20Lewdity.html:1)）与静态资源目录 [`img/`](img:1)。由于 Cloudflare Pages 对**单文件 25MiB 限制**，本仓库采用 **GitHub Actions 一键部署**：
- Actions 自动上传 HTML + `img/` 到 **R2**；
- **Worker** 作为入口与回源层，对外提供访问。

### 1. 部署前检查清单
- 已创建 R2 Bucket，名称与 [`wrangler.toml`](wrangler.toml:1) 中 `bucket_name` 一致（示例：`dol-assets`）。
- GitHub 仓库已设置 `main` 分支作为发布分支（Actions 默认监听）。
- 已准备好 Cloudflare Account ID 与 API Token。
- GitHub Actions Secrets 已完成配置（见下文）。

### 2. 前置条件
1) Cloudflare 账号（可创建 R2、Worker）。
2) GitHub 仓库管理权限（可新增 Secrets、触发 Actions）。
3) 仅需 GitHub Actions 侧执行部署，本地不要求安装 Node 或 Wrangler。

### 3. Token 权限最小集
创建 Cloudflare API Token 时，**最小权限集**建议如下：
- Account → Workers Scripts: Edit
- Account → R2 Storage: Edit

如需通过 API 管理 Worker 路由/自定义域名，再额外添加：
- Account → Workers Routes: Edit

### 4. 配置 GitHub Secrets
在 GitHub 仓库 → Settings → Secrets and variables → Actions 中新增：
- `CLOUDFLARE_API_TOKEN`：Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账号 ID
- `CLOUDFLARE_R2_BUCKET`：R2 桶名（需与 Cloudflare 控制台一致）

### 5. 仓库内已包含的部署文件
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml:1)
- [`wrangler.toml`](wrangler.toml:1)
- [`src/worker.js`](src/worker.js:1)

### 6. 触发一键部署
- 推送到 `main` 分支会自动触发 GitHub Actions。
- 或在 GitHub Actions 手动运行 `Deploy to Cloudflare Workers + R2`。

部署流程会自动执行：
1) 上传 [`Degrees of Lewdity.html`](Degrees%20of%20Lewdity.html:1) 到 R2：`site/Degrees of Lewdity.html`
2) 递归上传 [`img/`](img:1) 到 R2：`site/img/*`
3) 发布 Worker 脚本作为入口

### 7. 访问入口与资源路径
- 根路径 `/` 或 `/index.html` 会返回 R2 中的 `site/Degrees of Lewdity.html`
- 静态资源路径如 `/img/...` 会直接从 R2 读取

### 8. 部署后验证
- 在 GitHub Actions 中确认 `Deploy to Cloudflare Workers + R2` 运行成功。
- 在 Cloudflare 控制台检查 Worker 已发布，获取默认访问地址 `https://<worker-subdomain>.workers.dev/`。
- 验证入口与静态资源：
  - `curl -I https://<worker-subdomain>.workers.dev/`
  - `curl -I https://<worker-subdomain>.workers.dev/img/blueblock.png`
- 在 R2 控制台确认对象存在：
  - `site/Degrees of Lewdity.html`
  - `site/img/...`

### 9. 自定义域名（可选）
在 Cloudflare 控制台 → Workers → Triggers 中绑定自定义域名即可。

### 10. 常见问题
- **Pages 报错 “Files up to 25 MiB”**：这是 Pages 限制，不适合超大单文件 HTML，故采用 Workers + R2。
- **Actions 提示 401/403**：确认 `CLOUDFLARE_API_TOKEN` 权限包含 Workers Scripts: Edit 与 R2 Storage: Edit。
- **入口 404**：确认 R2 中存在 `site/Degrees of Lewdity.html`，并且上传步骤未被修改。
- **资源 404**：确认 R2 中 `site/` 前缀与仓库目录结构一致，且 `site/img/...` 已递归上传。
