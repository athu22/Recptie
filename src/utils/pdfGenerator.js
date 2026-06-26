import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import signUrl from '../assets/sign.png';

export const generatePDF = async (receipt, profile, action = 'download') => {
  if (!receipt) return;

  const doc = new jsPDF();
  const formatCurrency = (amount) => Number(amount).toFixed(2);
  const isClient = receipt.receiptType === 'Client';

  // 1. Header (Logo, Company Name, Contact)
  let textStartX = 15;
  try {
    const logoResponse = await fetch('/softspera.png');
    const logoBlob = await logoResponse.blob();
    const logoReader = new FileReader();
    const logoBase64 = await new Promise((resolve) => {
      logoReader.readAsDataURL(logoBlob);
      logoReader.onloadend = () => resolve(logoReader.result);
    });
    
    // Calculate aspect ratio to prevent squashing
    const img = new Image();
    img.src = logoBase64;
    await new Promise(r => {
      img.onload = r;
      img.onerror = r; // Handle error gracefully
    });
    
    const targetHeight = 22;
    const targetWidth = img.width && img.height ? (img.width / img.height) * targetHeight : 22;
    
    doc.addImage(logoBase64, 'PNG', 15, 12, targetWidth, targetHeight);
    textStartX = 15 + targetWidth + 5; // 5 units gap between logo and text
  } catch (error) {
    console.error('Error loading logo image:', error);
  }
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text((profile?.companyName || 'SOFTSPERA').toUpperCase(), textStartX, 25);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  let contactText = [];
  if (profile?.phone) contactText.push(`Ph: ${profile.phone}`);
  if (profile?.email) contactText.push(profile.email);
  if (profile?.website) contactText.push(profile.website);
  
  doc.text(contactText.join('   |   '), textStartX, 32);

  // 2. RECEIPT Title
  doc.setTextColor(242, 107, 28); // Orange
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', 195, 26, { align: 'right' });

  // 4. Customer Info (Left)
  let leftY = 58;
  doc.setTextColor(29, 78, 216); // Blue
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(isClient ? 'BILLED TO:' : 'STUDENT DETAILS:', 15, leftY);
  
  leftY += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  doc.text('Name', 15, leftY);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.customerName || '', 40, leftY);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(40, leftY + 1.5, 95, leftY + 1.5);
  leftY += 7;

  doc.text('Mobile', 15, leftY);
  doc.text(receipt.mobile || '', 40, leftY);
  doc.line(40, leftY + 1.5, 95, leftY + 1.5);
  leftY += 7;

  if (!isClient && receipt.college) {
    doc.text('College', 15, leftY);
    doc.text(receipt.college, 40, leftY);
    doc.line(40, leftY + 1.5, 95, leftY + 1.5);
    leftY += 7;
  }
  
  if (!isClient && receipt.domain) {
    doc.text('Domain', 15, leftY);
    doc.text(receipt.domain, 40, leftY);
    doc.line(40, leftY + 1.5, 95, leftY + 1.5);
    leftY += 7;
  }

  // 5. Receipt Info (Right)
  let rightY = 58;
  doc.setTextColor(29, 78, 216); // Blue
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT INFO:', 110, rightY);

  rightY += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text('Receipt No.', 110, rightY);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.receiptNo || '', 150, rightY);
  doc.setFont('helvetica', 'normal');
  doc.line(150, rightY + 1.5, 195, rightY + 1.5);
  rightY += 7;

  doc.text('Date', 110, rightY);
  doc.text(receipt.createdDate || '', 150, rightY);
  doc.line(150, rightY + 1.5, 195, rightY + 1.5);
  rightY += 7;

  doc.text('Payment Mode', 110, rightY);
  doc.text(receipt.paymentMode || '', 150, rightY);
  doc.line(150, rightY + 1.5, 195, rightY + 1.5);
  rightY += 7;
  
  if (receipt.transactionId) {
    doc.text('Transaction ID', 110, rightY);
    doc.text(receipt.transactionId, 150, rightY);
    doc.line(150, rightY + 1.5, 195, rightY + 1.5);
  }

  // 6. Table
  const termsText = isClient ? 
    'Notes:\nPayments once received are generally non-refundable unless otherwise agreed.\nAdditional work outside the agreed scope will be billed separately.\nSource code and ownership will be transferred after full payment.\nThe client should preserve this receipt for future reference.' :
    'Notes:\nInternship fees are non-refundable and non-transferable.\nEnrollment is confirmed only after successful fee payment.\nCertificates will be issued only upon successful completion.\nAny misconduct may result in termination without refund.';

  const amt = parseFloat(receipt.amount) || 0;
  const tot = parseFloat(receipt.totalAmount) || 0;
  const taxAmount = tot - amt;

  autoTable(doc, {
    startY: Math.max(leftY, rightY) + 10,
    head: [['QUANTITY', 'DESCRIPTION', 'UNIT PRICE', 'SUBTOTAL', 'TAX']],
    body: [
      ['1', `${receipt.productName || ''}\n${receipt.description || ''}`, formatCurrency(amt), formatCurrency(amt), formatCurrency(taxAmount)]
    ],
    foot: [
      [
        { content: termsText, colSpan: 3, styles: { halign: 'left', valign: 'top', fontStyle: 'normal', fontSize: 8 } },
        { content: `SUBTOTAL\nTAX (${receipt.gst}%)\nTOTAL`, styles: { halign: 'left', fontStyle: 'bold', fontSize: 9, cellPadding: {top: 5, bottom: 5, left: 2, right: 2} } },
        { content: `${formatCurrency(amt)}\n${formatCurrency(taxAmount)}\n${formatCurrency(tot)}`, styles: { halign: 'center', fontStyle: 'bold', fontSize: 9, cellPadding: {top: 5, bottom: 5, left: 2, right: 2} } }
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [64, 196, 196], // Cyan matching the image
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 25 },
      1: { halign: 'left', cellWidth: 75 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 25 }
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
      minCellHeight: 8,
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [200, 200, 200],
      lineWidth: 0.2
    }
  });

  // 7. Footer (Signatures & Thank you)
  const finalY = doc.lastAutoTable.finalY + 40;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);

  // Signature line
  doc.line(130, finalY - 5, 195, finalY - 5);
  doc.text('Signature', 130, finalY);

  // Add signature image over the line if available
  try {
    const signResponse = await fetch(signUrl);
    const signBlob = await signResponse.blob();
    const signReader = new FileReader();
    const signBase64 = await new Promise((resolve) => {
      signReader.readAsDataURL(signBlob);
      signReader.onloadend = () => resolve(signReader.result);
    });
    doc.addImage(signBase64, 'PNG', 130, finalY - 25, 40, 20);
  } catch (error) {
    console.error('Error loading signature image:', error);
  }

  doc.setTextColor(242, 107, 28); // Orange
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for the payment!', 105, finalY + 15, { align: 'center' });

  // Page Border
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // 8. Output
  if (action === 'print') {
    doc.autoPrint();
    const output = doc.output('bloburl');
    window.open(output, '_blank');
  } else {
    doc.save(`${receipt.receiptNo || 'Receipt'}.pdf`);
  }
};
