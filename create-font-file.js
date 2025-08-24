const fs = require('fs');
const path = require('path');

// --- 配置 ---
// 脚本将读取的字体文件名 (确保它在项目根目录)
const fontFileName = 'NotoSansSC-Regular.ttf';
// 脚本将要创建的目标文件路径
const outputFilePath = path.join(__dirname, 'src', 'utils', 'font.js');
// --- 结束配置 ---

console.log('>> 开始转换字体文件...');

// 1. 构造字体文件的完整路径
const fontFilePath = path.join(__dirname, fontFileName);

// 2. 检查字体文件是否存在，如果不存在则报错并退出
if (!fs.existsSync(fontFilePath)) {
    console.error(`\n[错误!] 字体文件未找到: ${fontFilePath}`);
    console.error(`请确认您已将 '${fontFileName}' 文件放置在项目的根目录中。`);
    process.exit(1); // 带着错误码退出
}

try {
    // 3. 读取字体文件内容
    const fontBuffer = fs.readFileSync(fontFilePath);

    // 4. 将文件内容转换为 Base64 字符串
    const base64String = fontBuffer.toString('base64');
    console.log('>> 字体文件已成功读取并转换为 Base64 字符串。');

    // 5. 准备要写入到新文件中的最终内容
    const fileContent = `// 此文件由 create-font-file.js 自动生成，请勿手动编辑。\n// 生成时间: ${new Date().toISOString()}\n\nexport const font = '${base64String}';\n`;

    // 6. 确保目标文件夹 (src/utils) 存在
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 7. 将内容写入到 src/utils/font.js 文件中
    fs.writeFileSync(outputFilePath, fileContent);

    console.log(`\n[成功!] 文件已成功创建在: ${outputFilePath}`);
    console.log('>> 您现在可以正常运行您的 Vue 应用了。');

} catch (error) {
    console.error('\n[错误!] 在处理过程中发生意外错误:', error);
    process.exit(1);
}