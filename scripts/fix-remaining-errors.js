const fs = require('fs');

// Corregir errores específicos en archivos
function fixSpecificErrors() {
  // Corregir JobApplicationMessageController.ts
  let content = fs.readFileSync('controllers/JobApplicationMessageController.ts', 'utf8');
  content = content.replace(/\(application as any\)\.\(applicant as any\)\./g, "(application as any).applicant.");
  content = content.replace(/\(application as any\)\.\(jobOffer as any\)\./g, "(application as any).jobOffer.");
  content = content.replace(/application\.\(applicant as any\)\./g, "(application as any).applicant.");
  content = content.replace(/application\.\(jobOffer as any\)\./g, "(application as any).jobOffer.");
  content = content.replace(/message\.application\.\(applicant as any\)\./g, "(message.application as any).applicant.");
  content = content.replace(/message\.application\.\(jobOffer as any\)\./g, "(message.application as any).jobOffer.");
  fs.writeFileSync('controllers/JobApplicationMessageController.ts', content, 'utf8');
  console.log('✅ Corregido: controllers/JobApplicationMessageController.ts');

  // Corregir LessonProgressController.ts
  content = fs.readFileSync('controllers/LessonProgressController.ts', 'utf8');
  content = content.replace(/\(item as any\)\.\(enrollment as any\)\./g, "(item as any).enrollment.");
  content = content.replace(/existingProgress\.\(enrollment as any\)\./g, "(existingProgress as any).enrollment.");
  fs.writeFileSync('controllers/LessonProgressController.ts', content, 'utf8');
  console.log('✅ Corregido: controllers/LessonProgressController.ts');
}

fixSpecificErrors();
console.log('✅ Errores específicos corregidos');
