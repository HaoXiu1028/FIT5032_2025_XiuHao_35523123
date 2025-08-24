// importData.js

const admin = require('firebase-admin');
const fs = require('fs');

// 1. 初始化 Firebase Admin SDK
// 确保 serviceAccountKey.json 文件在项目根目录
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. 读取 Mockaroo 生成的 JSON 文件
// 确保文件名与你下载的文件名一致
const dataPath = './appointments.json'; 
const rawData = fs.readFileSync(dataPath);
const appointments = JSON.parse(rawData);

async function importData() {
  console.log(`开始导入 ${appointments.length} 条预约数据...`);

  // 3. 遍历数据并写入 Firestore
  for (const appointment of appointments) {
    try {
      // 关键步骤：将 Mockaroo 的日期字符串转换为 Firestore 的 Timestamp 对象
      const transformedAppointment = {
        ...appointment,
        appointmentDate: admin.firestore.Timestamp.fromDate(new Date(appointment.appointmentDate)),
        createdAt: admin.firestore.Timestamp.now() // 添加创建时间
      };
      
      await db.collection('appointments').add(transformedAppointment);
      
    } catch (error) {
      console.error('导入单条数据时出错:', error, '数据:', appointment);
    }
  }

  console.log('所有数据导入成功！请到 Firebase 控制台查看 `appointments` 集合。');
}

importData().catch(console.error);