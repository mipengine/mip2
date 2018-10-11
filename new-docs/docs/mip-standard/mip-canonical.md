# Canonical 使用规范

在某些情况下，站点对于同一个 HTML 页面，可能存在两种，一个是 MIP 页，一个是原页面。搜索引擎会抓取这两个页面，并利用 Canonical 标签将它们联系起来。

## 关联标签

你必须在 MIP 添加`<link rel="canonical">`指向原始页面，以保证 MIP 更好的继承原始页面的权重。

使用规则：

- `<link rel="miphtml">`在移动端页面（H5）使用，指向对应内容的 MIP 页，方便搜索引擎发现对应的 MIP 页。
- `<link rel="canonical">`在 MIP 页中使用, 指向内容对应的移动端页面（H5）。
- 若没有移动端页面（H5），则指向内容对应的 PC 页。
- 若直接在原链接修改 MIP ，则 Canonical 指向当前 URL 。

## 在 head 中添加关联标签让搜索引擎发现你的页面

### MIP 和 非 MIP 页面同时存在

在 MIP 页中添加：

```html
<link rel="canonical" href="https://www.example.com/your/path.html">
```

### 如果只有 MIP 页

同样需要添加，指向自己（当前页面）：

```html
<link rel="canonical" href="https://www.example.com/mip/path.html">
```

## 新建 MIP 页的文件 path 建议

[info] 原网页与 MIP 页的 URL 的对应关系尽量简单、直接。

原网页出现的文档名或文档 ID ，在 MIP 页命名时也要出现。如：原页面 url 为 `https://www.example.com/123.html` 。

例子|是否可用
--|--
`https://mip.example.com/123.html` | <span class="mipengine-doc-green">可用，推荐</span>
`https://www.example.com/mip/123.html` | <span class="mipengine-doc-green">可用，推荐</span>
`https://www.example.com/mip_123.html` | <span class="mipengine-doc-green">可用</span>
`https://mip.example.com/mip_123.html` | <span class="mipengine-doc-green">可用</span>
`https://www.example.com/mip_001.html` | <span class="mipengine-doc-orange">不建议（链接 ID 不对应）</span>
