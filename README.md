# i18n 翻译提示插件

这是一个为项目中的 i18n 翻译提供智能提示的 VSCode 插件。

## 功能特性

### 1. 行内翻译提示
在代码中使用 `t('key')` 时，会在行尾自动显示对应的中文翻译。

**示例：**
```typescript
title: t('business.statistics.column.projectType'), // 项目类型
```

### 2. 悬停提示
鼠标悬停在 `t('key')` 上时，会显示详细的翻译信息，包括：
- 翻译 key
- 中文翻译

### 3. 自动监听文件变化
当翻译文件发生变化时，插件会自动重新加载翻译内容，无需手动刷新。

## 支持的文件类型

- TypeScript (`.ts`)
- Vue (`.vue`)
- JavaScript (`.js`)
- TypeScript React (`.tsx`)
- JavaScript React (`.jsx`)

## 配置选项

在 VSCode 设置中可以配置以下选项：

### `i18nHint.localesPath`
- **类型**: `string`
- **默认值**: `"src/locales/lang"`
- **说明**: 翻译文件所在的相对路径

### `i18nHint.defaultLocale`
- **类型**: `string`
- **默认值**: `"zh-CN"`
- **说明**: 默认显示的语言

### `i18nHint.enableInlineHints`
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 启用/禁用行内提示

### `i18nHint.enableHover`
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 启用/禁用悬停提示

## 使用方法

### 1. 安装插件

在插件目录下执行：

```bash
cd .vscode-extension
npm install
```

### 2. 编译插件

```bash
npm run compile
```

### 3. 调试插件

1. 在 VSCode 中打开 `.vscode-extension` 目录
2. 按 `F5` 启动调试
3. 在新打开的 VSCode 窗口中测试插件功能

### 4. 打包插件（可选）

如果需要打包成 `.vsix` 文件进行分发：

```bash
# 安装 vsce
npm install -g @vscode/vsce

# 打包
vsce package
```

## 项目结构

```
.vscode-extension/
├── src/
│   ├── extension.ts           # 插件入口
│   ├── translationLoader.ts   # 翻译文件加载器
│   ├── inlineHintsProvider.ts # 行内提示提供者
│   └── hoverProvider.ts       # 悬停提示提供者
├── package.json               # 插件配置
├── tsconfig.json              # TypeScript 配置
└── README.md                  # 说明文档
```

## 工作原理

1. **翻译文件加载**: 插件启动时会扫描 `src/locales/lang/zh-CN` 目录下的所有 `.ts` 文件，解析其中的翻译内容
2. **文件监听**: 使用 VSCode 的 FileSystemWatcher 监听翻译文件的变化
3. **行内提示**: 通过 InlayHintsProvider API 在代码中插入翻译提示
4. **悬停提示**: 通过 HoverProvider API 在鼠标悬停时显示翻译信息

## 注意事项

1. 插件会自动解析 TypeScript 格式的翻译文件（`export default { ... }`）
2. 支持嵌套的翻译对象结构
3. 翻译 key 使用点分隔符（如 `business.statistics.column.projectType`）
4. 插件会自动处理注释和 import 语句

## 故障排除

### 翻译不显示

1. 检查翻译文件路径配置是否正确
2. 确认翻译文件格式是否符合要求
3. 查看 VSCode 开发者工具的控制台是否有错误信息（`帮助` -> `切换开发人员工具`）

### 性能问题

如果项目很大，可以考虑：
1. 禁用行内提示，只使用悬停提示
2. 调整翻译文件的组织结构

## 开发者

Wuwen Team

## 许可证

MIT
