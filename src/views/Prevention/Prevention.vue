<template>
  <div class="prevention-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Core Prevention Knowledge</span>
        </div>
      </template>
      <el-collapse v-model="activeCollapse" accordion>
        <el-collapse-item name="1" title="✅ Essential Health Screenings">
          <div><strong>Goal:</strong> To detect potential health problems early.</div>
          <ul>
            <li><strong>Blood Pressure Check:</strong> Recommended at least every two years for adults over 18. Annually for high-risk groups.</li>
            <li><strong>Cholesterol Check:</strong> Recommended at least every five years for adults over 20.</li>
            <li><strong>Diabetes Screening:</strong> Recommended for adults who are overweight or have a family history.</li>
            <li><strong>Women's Health:</strong> Regular Pap tests and mammograms are recommended based on age.</li>
            <li><strong>Men's Health:</strong> Discuss the necessity of prostate cancer screening with your doctor.</li>
          </ul>
        </el-collapse-item>
        <el-collapse-item name="2" title="💉 Important Vaccinations">
          <div><strong>Goal:</strong> To prevent serious infectious diseases.</div>
          <ul>
            <li><strong>Flu Vaccine:</strong> Recommended for all age groups, once a year in the fall.</li>
            <li><strong>Tdap (Tetanus, Diphtheria, Pertussis):</strong> Adults should get a booster shot every 10 years.</li>
            <li><strong>HPV Vaccine:</strong> Recommended for all adolescents and young adults to prevent related cancers.</li>
            <li><strong>Pneumonia Vaccine:</strong> Recommended for adults over 65 or those with chronic conditions.</li>
          </ul>
        </el-collapse-item>
        <el-collapse-item name="3" title="🥗 Healthy Lifestyle">
           <div><strong>Goal:</strong> To build and maintain a foundation for long-term health.</div>
           <ul>
            <li><strong>Balanced Diet:</strong> Eat plenty of vegetables, fruits, and whole grains. Reduce processed foods, sugar, and saturated fats.</li>
            <li><strong>Regular Exercise:</strong> Aim for at least 150 minutes of moderate-intensity aerobic exercise (like brisk walking or swimming) per week.</li>
            <li><strong>Sufficient Sleep:</strong> Ensure 7-9 hours of quality sleep per night.</li>
            <li><strong>Stress Management:</strong> Practice meditation, deep breathing, or hobbies to relieve stress.</li>
            <li><strong>Quit Smoking & Limit Alcohol:</strong> One of the most important things you can do for your health.</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
       <template #header>
          <span>Personalized Prevention Plan (PDF)</span>
       </template>
       <el-form :model="checklistForm" label-width="100px">
         <el-form-item label="Age Group">
            <el-select v-model="checklistForm.age" placeholder="Select age group">
                <el-option label="18-39 years" value="young_adult"></el-option>
                <el-option label="40-64 years" value="middle_aged"></el-option>
                <el-option label="65+ years" value="senior"></el-option>
            </el-select>
         </el-form-item>
         <el-form-item label="Gender">
            <el-select v-model="checklistForm.gender" placeholder="Select gender">
                <el-option label="Male" value="male"></el-option>
                <el-option label="Female" value="female"></el-option>
            </el-select>
         </el-form-item>
         <el-form-item label="Height (cm)">
            <el-input-number v-model="checklistForm.height" :min="100" :max="250"></el-input-number>
         </el-form-item>
         <el-form-item label="Weight (kg)">
            <el-input-number v-model="checklistForm.weight" :min="30" :max="300"></el-input-number>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" @click="generateChecklistPDF" :loading="pdfLoading">
              {{ pdfLoading ? 'Generating...' : 'Generate & Download PDF Report' }}
            </el-button>
         </el-form-item>
       </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { jsPDF } from "jspdf";
import { font } from '@/utils/font.js';

const checklistForm = ref({ age: 'young_adult', gender: 'male', height: 175, weight: 70 });
const activeCollapse = ref('1');
const pdfLoading = ref(false);

const generateChecklistPDF = () => {
  pdfLoading.value = true;
  try {
    const doc = new jsPDF();
    doc.addFileToVFS("NotoSansSC-Regular.ttf", font);
    doc.addFont("NotoSansSC-Regular.ttf", "NotoSansSC", "normal");
    doc.setFont("NotoSansSC", "normal");

    const form = checklistForm.value;
    const bmiResult = calculateBMI(form.height, form.weight);
    const recommendations = getRecommendations(form, bmiResult.category);

    doc.setFontSize(20);
    doc.text("Your Personalized Health Prevention Report", 105, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    doc.line(14, 35, 196, 35);
    let yPos = 45;
    doc.setFontSize(14).text('1. Your Health Profile', 14, yPos);
    yPos += 8;
    doc.setFontSize(11).text(`- Age Group: ${form.age}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(11).text(`- Gender: ${form.gender}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(11).text(`- Height: ${form.height} cm`, 20, yPos);
    yPos += 7;
    doc.setFontSize(11).text(`- Weight: ${form.weight} kg`, 20, yPos);
    yPos += 10;
    doc.setFontSize(11).text(`- Your BMI is: ${bmiResult.bmi} (Category: ${bmiResult.category})`, 20, yPos, { fontStyle: 'bold' });
    yPos += 15;
    doc.line(14, yPos-5, 196, yPos-5);
    doc.setFontSize(14).text('2. Core Prevention Recommendations', 14, yPos);
    yPos += 8;
    recommendations.forEach(item => {
        if(yPos > 270) { doc.addPage(); yPos = 20; }
        doc.setFontSize(12).text(`• ${item.title}`, 20, yPos, {fontStyle: 'bold'});
        yPos += 6;
        doc.setFontSize(10).text(item.desc, 25, yPos);
        yPos += 10;
    });

    doc.save(`Health-Prevention-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    ElMessage.success("PDF report generated successfully!");

  } catch (error) {
    console.error("PDF generation failed:", error);
    ElMessage.error("An unknown error occurred while generating the PDF.");
  } finally {
    pdfLoading.value = false;
  }
};

const calculateBMI = (height, weight) => {
    if (!height || !weight) return { bmi: null, category: 'Unknown' };
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 18.5 && bmi < 24) category = 'Normal';
    else if (bmi >= 24 && bmi < 28) category = 'Overweight';
    else category = 'Obese';
    return { bmi, category };
};

const getRecommendations = (form, bmiCategory) => {
    const { age, gender } = form;
    let list = [
        { title: 'Annual Blood Pressure Check', desc: 'Recommended for all adults to prevent cardiovascular diseases.' },
        { title: 'Flu Vaccine', desc: 'Recommended annually in the fall.' }
    ];
    if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
        list.push({ title: 'Weight Management & Diabetes Screening', desc: 'Your BMI is high. Consider consulting a doctor for weight management and regular blood sugar tests.' });
    }
    if (bmiCategory === 'Underweight') {
         list.push({ title: 'Nutritional Assessment', desc: 'Your BMI is low. Consider consulting a doctor or nutritionist to ensure adequate nutrient intake.' });
    }
    if (age === 'middle_aged' || age === 'senior') {
        list.push({ title: 'Colorectal Cancer Screening', desc: 'Recommended regularly starting from age 45.' });
    }
    if (age === 'senior') {
        list.push({ title: 'Bone Density Test', desc: 'Especially for women, to prevent osteoporosis.' });
    }
    if (gender === 'female') {
        list.push({ title: 'Cervical Cancer Screening (Pap test)', desc: 'Recommended every 3-5 years, depending on age and risk.' });
        if (age === 'middle_aged' || age === 'senior') {
            list.push({ title: 'Breast Cancer Screening (Mammogram)', desc: 'Recommended every 1-2 years, starting from age 40-50.' });
        }
    }
    return list;
}
</script>

<style scoped>
.prevention-container {
  padding: 20px;
}
.card-header {
  font-weight: bold;
}
.box-card {
  margin-bottom: 20px;
}
ul {
  padding-left: 20px;
  line-height: 1.8;
}
</style>