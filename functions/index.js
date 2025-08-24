const functions = require("firebase-functions");
const { jsPDF } = require("jspdf");
require("jspdf-autotable"); // Important for table support
const cors = require("cors")({ origin: true });

// **关键：直接在云端加载字体，无需任何外部文件**
const font = require("./font-base64"); // 我们将创建一个本地字体文件

exports.generatePdfReport = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const data = req.body;
    const { age, gender, height, weight, bmiResult, recommendations } = data;

    const doc = new jsPDF();

    // 加载并设置中文字体
    doc.addFileToVFS("SourceHanSans-Normal.ttf", font.font);
    doc.addFont("SourceHanSans-Normal.ttf", "SourceHanSans", "normal");
    doc.setFont("SourceHanSans", "normal");

    // --- 报告内容 ---
    doc.setFontSize(20);
    doc.text("您的个性化健康预防报告", 105, 22, { align: "center" });
    doc.setFontSize(11);
    doc.text(`报告生成日期: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });
    doc.line(14, 35, 196, 35);

    let yPos = 45;
    doc.setFontSize(14).text("1. 您的健康概况", 14, yPos);
    yPos += 8;
    doc.autoTable({
        startY: yPos,
        theme: 'grid',
        head: [['项目', '您的信息']],
        body: [
            ['年龄段', age],
            ['性别', gender],
            ['身高 (cm)', height],
            ['体重 (kg)', weight],
            ['BMI 指数', `${bmiResult.bmi} (属于: ${bmiResult.category})`],
        ],
        styles: { font: 'SourceHanSans', fontStyle: 'normal' },
    });

    yPos = doc.autoTable.previous.finalY + 15;

    doc.setFontSize(14).text("2. 核心健康预防建议", 14, yPos);
    yPos += 8;
    const bodyData = recommendations.map(item => [item.title, item.desc]);
    doc.autoTable({
        startY: yPos,
        theme: 'striped',
        head: [['建议项目', '详细说明']],
        body: bodyData,
        styles: { font: 'SourceHanSans', fontStyle: 'normal' },
    });

    // 将PDF转换为Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // 设置响应头并发送PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Health-Report.pdf"`);
    res.status(200).send(pdfBuffer);
  });
});