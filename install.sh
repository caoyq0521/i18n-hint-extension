#!/bin/bash

echo "======================================"
echo "i18n 翻译提示插件 - 安装脚本"
echo "======================================"
echo ""

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"
echo ""

# 安装依赖
echo "📦 正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✓ 依赖安装成功"
echo ""

# 编译插件
echo "🔨 正在编译插件..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo "✓ 编译成功"
echo ""

echo "======================================"
echo "✅ 插件安装完成！"
echo "======================================"
echo ""
echo "下一步操作："
echo "1. 在 VSCode 中按 F5 启动调试"
echo "2. 在新窗口中打开你的项目"
echo "3. 在代码中使用 t('key') 即可看到翻译提示"
echo ""
echo "配置选项（在 VSCode 设置中）："
echo "- i18nHint.localesPath: 翻译文件路径"
echo "- i18nHint.defaultLocale: 默认语言"
echo "- i18nHint.enableInlineHints: 启用行内提示"
echo "- i18nHint.enableHover: 启用悬停提示"
echo ""
