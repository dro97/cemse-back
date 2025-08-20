const fs = require('fs');

// Corregir errores específicos en CVController
function fixCVControllerErrors() {
  let content = fs.readFileSync('controllers/CVController.ts', 'utf8');
  
  // Corregir errores de sintaxis en type assertions
  content = content.replace(/profile\.\(education as any\)Level/g, "(profile as any).educationLevel");
  content = content.replace(/profile\.\(education as any\)History/g, "(profile as any).educationHistory");
  content = content.replace(/cvData\.\(education as any\)/g, "(cvData as any).education");
  content = content.replace(/updateData\.\(education as any\)Level/g, "(updateData as any).educationLevel");
  content = content.replace(/updateData\.\(education as any\)History/g, "(updateData as any).educationHistory");
  content = content.replace(/updateData\.\(education as any\)Required/g, "(updateData as any).educationRequired");
  content = content.replace(/updateData\.\(experience as any\)Level/g, "(updateData as any).experienceLevel");
  
  // Corregir errores de sintaxis en instructor
  content = content.replace(/instructor\.\(instructedCourses as any\)/g, "(instructor as any).instructedCourses");
  content = content.replace(/instructor\.\(bio as any\)/g, "(instructor as any).bio");
  content = content.replace(/instructor\.\(experience as any\)/g, "(instructor as any).experience");
  content = content.replace(/instructor\.\(education as any\)/g, "(instructor as any).education");
  
  // Corregir errores de sintaxis en job offer
  content = content.replace(/updateData\.\(experience as any\)Level/g, "(updateData as any).experienceLevel");
  content = content.replace(/updateData\.\(education as any\)Required/g, "(updateData as any).educationRequired");
  
  // Corregir errores de template literals
  content = content.replace(/Mi formación en \$\{profile\.\(education as any\)Level\}/g, "Mi formación en ${(profile as any).educationLevel}");
  
  fs.writeFileSync('controllers/CVController.ts', content, 'utf8');
  console.log('✅ Corregido: controllers/CVController.ts');
}

fixCVControllerErrors();
console.log('✅ Errores de CVController corregidos');
