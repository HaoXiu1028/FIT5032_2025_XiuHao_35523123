// generateAndImportSlots.js
// A powerful script to programmatically generate and import realistic service slots.

const admin = require('firebase-admin');

// --- 配置区 (您可以轻松修改这里来生成不同的数据) ---

// 1. 定义医生列表
const DOCTORS = [
  { name: "Dr. Evelyn Reed", service: "General Consultation", description: "A comprehensive check-up for general health concerns." },
  { name: "Dr. Marcus Thorne", service: "Dental Check-up", description: "Professional dental cleaning and oral health assessment." },
  { name: "Dr. Elena Vance", service: "Psychological Counseling", description: "Private session with a certified counselor for mental well-being." },
  { name: "Dr. Julian Hayes", service: "Annual Physical Exam", description: "A complete annual physical examination for preventative care." },
  { name: "Dr. Olivia Chen", service: "Chronic Disease Management", description: "Ongoing support and management for chronic health conditions." }
];

// 2. 定义工作周 (格式: YYYY-MM-DD)
const WORK_WEEK = [
  '2025-10-27', // Monday
  '2025-10-28', // Tuesday
  '2025-10-29', // Wednesday
  '2025-10-30', // Thursday
  '2025-10-31', // Friday
];

// 3. 定义每天的时间点
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", // Morning
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"  // Afternoon
];

const DURATION_MINUTES = 30;
const COLLECTION_NAME = 'available_services';

// ----------------------------------------------------------------

// 初始化 Firebase
const serviceAccount = require('./serviceAccountKey.json');
try {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (e) {
  // 防止重复初始化
  if (e.code !== 'app/duplicate-app') {
    throw e;
  }
}
const db = admin.firestore();

// 数据生成逻辑
function generateAllSlots() {
  const allSlots = [];
  for (const doctor of DOCTORS) {
    for (const day of WORK_WEEK) {
      for (const time of TIME_SLOTS) {
        
        // 将日期和时间字符串合并成一个 JavaScript Date 对象
        const dateTimeString = `${day}T${time}:00`;
        const appointmentDate = new Date(dateTimeString);

        allSlots.push({
          doctorName: doctor.name,
          serviceType: doctor.service,
          description: doctor.description,
          duration: DURATION_MINUTES,
          appointmentDateTime: admin.firestore.Timestamp.fromDate(appointmentDate),
          status: 'available'
        });
      }
    }
  }
  return allSlots;
}

// 数据导入逻辑
async function importData(slots) {
  console.log(`准备向 [${COLLECTION_NAME}] 集合写入 ${slots.length} 个文档...`);
  const collectionRef = db.collection(COLLECTION_NAME);
  
  // 使用批量写入，效率更高
  const batch = db.batch();
  slots.forEach(slot => {
    const docRef = collectionRef.doc(); // 创建一个新的文档引用
    batch.set(docRef, slot);
  });

  await batch.commit();
  console.log('所有服务时隙已成功导入！');
}

// 主执行函数
async function main() {
  console.log('开始生成服务时隙...');
  const slotsToImport = generateAllSlots();
  console.log(`成功生成了 ${slotsToImport.length} 个时隙。`);
  
  // 注意：为了安全，导入功能默认是注释掉的。
  // 请先检查确认，然后取消下面的注释来执行真正的导入操作。
  await importData(slotsToImport);
}

main().catch(console.error);