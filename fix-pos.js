const fs = require('fs');
let content = fs.readFileSync('app/dashboard/pos/POSView.tsx', 'utf8');

// The markers to search for
const qrMarker = 'QR DISPLAY';
const formMarker = 'FORMULARIO: PREPARAR COBRO';
const btnMarker = 'Botones auxiliares';

const idxQR = content.indexOf(qrMarker);
const idxForm = content.indexOf(formMarker);
const idxBtn = content.indexOf(btnMarker);

if (idxQR !== -1 && idxForm !== -1 && idxBtn !== -1) {
  // Find the start of the line for each block
  const startQR = content.lastIndexOf('{/*', idxQR);
  const startForm = content.lastIndexOf('{/*', idxForm);
  const startBtn = content.lastIndexOf('{/*', idxBtn);
  
  if (startQR !== -1 && startForm !== -1 && startBtn !== -1) {
    const before = content.substring(0, startQR);
    const qrBlock = content.substring(startQR, startForm);
    const formBlock = content.substring(startForm, startBtn);
    const after = content.substring(startBtn);
    
    // Swap them!
    const newContent = before + formBlock + qrBlock + after;
    fs.writeFileSync('app/dashboard/pos/POSView.tsx', newContent);
    console.log('Successfully swapped!');
  } else {
    console.log('Failed to find comment starts');
  }
} else {
  console.log('Failed to find markers');
}
