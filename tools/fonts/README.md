# 像素字体子集

《人生通关手册》标题用的两个像素字体的子集，只收书名和统计标签用到的字符，各 2-3 KB：

- `zpix-subset.woff2`：Zpix（最像素）中文子集。来源 github.com/SolidZORO/zpix-pixel-font（v3.3.9 之后任一版本均可，OFL 类免费商用许可，以仓库为准）。
- `pressstart-subset.woff2`：Press Start 2P 英文/数字子集。来源 github.com/google/fonts（OFL）。

## 嵌入方式

`index.html` 和 `tools/og.html` 都用这两个文件：index 走 base64 内嵌（离线单文件版也带着字体），og.html 走相对路径 `fonts/`。**换了书名或要新增字符，必须重新子集化两处同步改。**

## 重新子集化

```bash
# 下载原始字体（放本目录，不入库）
curl -L -o zpix.ttf https://github.com/SolidZORO/zpix-pixel-font/releases/download/v3.3.0/zpix.ttf
curl -L -o PressStart2P-Regular.ttf https://github.com/google/fonts/raw/main/ofl/pressstart2p/PressStart2P-Regular.ttf

# 子集化（需 python3 + fonttools + brotli）
python3 -c "
from fontTools.subset import main as ss
ss(['zpix.ttf','--output-file=zpix-subset.woff2','--flavor=woff2','--no-hinting','--desubroutinize','--text=人生通关手册条建议级证据原始文献链接循证按性价比排序成本收益来源备注攻略指南使用关卡全'])
ss(['PressStart2P-Regular.ttf','--output-file=pressstart-subset.woff2','--flavor=woff2','--no-hinting','--text=LIFE WALKTHROUGH 0123456789 .:/-PLAYER\'S MANUAL'])
"
```

然后把 `zpix-subset.woff2` 转 base64 更新进 `index.html` 的 `@font-face`（`base64 zpix-subset.woff2`）。

## 改 og.png

截图命令在 `tools/og.html` 文件头注释里（Windows/macOS 两条），从仓库根目录执行；og.html 引用本目录的字体，移动时连同 `fonts/` 一起动。
