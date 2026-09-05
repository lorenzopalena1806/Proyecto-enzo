const fs = require('fs');
let content = fs.readFileSync('app/pos/[merchant_id]/EmployeeChargeGenerator.tsx', 'utf8');

const qrMarker = 'QR Estático del Local';
const formMarker = 'FORMULARIO: PREPARAR COBRO';

const idxQR = content.indexOf(qrMarker);
const idxForm = content.indexOf(formMarker);

if (idxQR !== -1 && idxForm !== -1) {
  const startQR = content.lastIndexOf('{/*', idxQR);
  const startForm = content.lastIndexOf('{/*', idxForm);
  const endForm = content.lastIndexOf('<div className="pt-6 border-t');
  
  if (startQR !== -1 && startForm !== -1 && endForm !== -1) {
    if (startQR < startForm) {
      const before = content.substring(0, startQR);
      const qrBlock = content.substring(startQR, startForm);
      const formBlock = content.substring(startForm, endForm);
      const after = content.substring(endForm);
      
      const newContent = before + formBlock + '\n\n      ' + qrBlock + after;
      fs.writeFileSync('app/pos/[merchant_id]/EmployeeChargeGenerator.tsx', newContent);
      console.log('Successfully swapped in EmployeeChargeGenerator!');
    } else {
      console.log('QR is already after form');
    }
  } else {
    console.log('Failed to find start/end indices', startQR, startForm, endForm);
  }
} else {
  console.log('Failed to find markers');
}
