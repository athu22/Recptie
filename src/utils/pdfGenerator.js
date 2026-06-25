import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import numWords from 'num-words';
import signUrl from '../assets/sign.png';

export const generatePDF = async (receipt, profile, action = 'download') => {
  if (!receipt) return;

  const doc = new jsPDF();
  
  // Colors matching the geometric theme
  const mainBlue = [2, 119, 189]; // #0277bd
  const lightBlue = [3, 169, 244]; // #03a9f4
  const darkGray = [34, 34, 34]; // #222222
  const textColor = [30, 41, 59]; // slate-800
  
  // 1. Geometric Header
  doc.setFillColor(...mainBlue);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Shadow Triangles
  doc.setFillColor(...darkGray);
  doc.triangle(25, 30, 40, 30, 32.5, 40, 'F');
  doc.triangle(45, 30, 60, 30, 52.5, 40, 'F');
  
  // Left Ribbon (Light Blue)
  doc.setFillColor(...lightBlue);
  doc.triangle(0, 0, 20, 0, 40, 40, 'F');
  doc.triangle(0, 0, 40, 40, 20, 40, 'F');
  
  // Middle Ribbon (Main Blue)
  doc.setFillColor(...mainBlue);
  doc.triangle(20, 0, 40, 0, 60, 40, 'F');
  doc.triangle(20, 0, 60, 40, 40, 40, 'F');

  // Company Info Overlay
  try {
    // Fetch the logo from the public folder
    const logoResponse = await fetch('/softspera.png');
    const logoBlob = await logoResponse.blob();
    const logoReader = new FileReader();
    const logoBase64 = await new Promise((resolve) => {
      logoReader.readAsDataURL(logoBlob);
      logoReader.onloadend = () => resolve(logoReader.result);
    });
    
    // Draw the logo image without background
    doc.addImage(logoBase64, 'PNG', 15, 4, 22, 22);
  } catch (error) {
    console.error('Error loading logo image:', error);
    // Fallback to initial
    doc.setFillColor(...lightBlue);
    doc.roundedRect(15, 6, 12, 12, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(profile?.companyName?.charAt(0) || 'C', 21, 15, { align: 'center' });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(profile?.companyName?.toUpperCase() || 'COMPANY NAME', 40, 14);
  
  if (profile?.tagline) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.tagline.toUpperCase(), 40, 19);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let contactY = 10;
  if (profile?.phone) {
    doc.text(`Tel: ${profile.phone}`, 195, contactY, { align: 'right' });
    contactY += 4.5;
  }
  if (profile?.email) {
    doc.text(`Email: ${profile.email}`, 195, contactY, { align: 'right' });
    contactY += 4.5;
  }
  if (profile?.website) {
    doc.text(`Web: ${profile.website}`, 195, contactY, { align: 'right' });
  }

  // 2. Title & Meta
  doc.setTextColor(...mainBlue);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE RECEIPT', 105, 60, { align: 'center' });

  // 3. Info Headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mainBlue);
  doc.text('ISSUED TO:', 15, 80);
  doc.text('RECEIPT NO:', 140, 80);
  doc.text('DATE:', 140, 87);
  
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(receipt.customerName || 'N/A', 15, 87);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(receipt.mobile || 'N/A', 15, 93);
  
  if (receipt.address) {
    const splitAddress = doc.splitTextToSize(receipt.address, 100);
    doc.text(splitAddress, 15, 99);
  }

  // Right side meta values
  doc.text(receipt.receiptNo || 'N/A', 170, 80);
  doc.text(receipt.createdDate || 'N/A', 170, 87);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Payment Mode: ${receipt.paymentMode || 'N/A'}`, 140, 95);
  if (receipt.transactionId) {
    doc.text(`TXN: ${receipt.transactionId}`, 140, 100);
  }

  // 4. Items Table
  const formatCurrency = (amount) => `Rs. ${Number(amount).toFixed(2)}`;
  
  autoTable(doc, {
    startY: 115,
    head: [['FEE DETAILS', 'AMOUNT', 'TOTAL']],
    body: [
      [
        `${receipt.productName || 'Course'}\n${receipt.description || ''}`, 
        formatCurrency(receipt.amount),
        formatCurrency(receipt.amount)
      ],
      // Empty rows for grid effect
      ['', '', ''],
      ['', '', '']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: mainBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 100 },
      1: { halign: 'center', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 40 }
    },
    styles: {
      fontSize: 10,
      textColor: textColor,
      lineColor: mainBlue,
      lineWidth: 0.3
    },
    didParseCell: function(data) {
      if (data.section === 'head') {
        if (data.column.index === 0) data.cell.styles.halign = 'left';
        if (data.column.index === 1) data.cell.styles.halign = 'center';
        if (data.column.index === 2) data.cell.styles.halign = 'right';
      }
    }
  });

  const finalY = doc.lastAutoTable.finalY;

  // 5. Totals Box
  let currentTotalY = finalY + 10;
  doc.setFontSize(10);
  
  if (parseFloat(receipt.gst) > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('SUBTOTAL', 130, currentTotalY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(receipt.amount), 195, currentTotalY, { align: 'right' });
    
    currentTotalY += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`TAX (${receipt.gst}%)`, 130, currentTotalY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(receipt.totalAmount - receipt.amount), 195, currentTotalY, { align: 'right' });
    currentTotalY += 7;
  }
  
  // Amount in words (aligned with Totals Box)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mainBlue);
  doc.text('AMOUNT IN WORDS:', 15, currentTotalY - 2);
  
  let amountWords = '';
  try {
    const totalAmountRounded = Math.round(receipt.totalAmount || 0);
    amountWords = numWords(totalAmountRounded).toUpperCase() + ' RUPEES ONLY';
  } catch (e) {
    amountWords = 'RUPEES ' + (receipt.totalAmount || 0);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.text(amountWords, 15, currentTotalY + 3);

  doc.setFillColor(...mainBlue);
  doc.rect(125, currentTotalY - 5, 70, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', 130, currentTotalY + 2);
  doc.text(formatCurrency(receipt.totalAmount || 0), 190, currentTotalY + 2, { align: 'right' });

  // 6. Bottom Info
  const bottomY = Math.max(finalY + 30, 200); 
  
  // Terms & Conditions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', 15, bottomY + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const terms = [
    '• Fees once paid are non-refundable and non-transferable.',
    '• Enrollment is confirmed only after successful fee payment.',
    '• Certificates and completion documents will be issued only upon successful completion',
    '  of the program and clearance of all dues.',
    '• Students must adhere to the organization\'s rules, policies, and code of conduct.',
    '• Any misconduct may result in termination from the program without a fee refund.',
    '• The organization reserves the right to modify schedules, curriculum, or program',
    '  structure when necessary.',
    '• By making the payment, the student acknowledges and agrees to these terms.'
  ];
  let termY = bottomY + 9;
  terms.forEach(term => {
    doc.text(term, 15, termY);
    termY += 3.5;
  });

  // PAID Stamp
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setTextColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID', 132, bottomY + 20, { angle: 12 });
  doc.rect(128, bottomY + 11, 26, 10, 'S');

  // Signature image
  try {
    const signResponse = await fetch(signUrl);
    const signBlob = await signResponse.blob();
    const signReader = new FileReader();
    const signBase64 = await new Promise((resolve) => {
      signReader.readAsDataURL(signBlob);
      signReader.onloadend = () => resolve(signReader.result);
    });
    // Draw much larger to compensate for transparent padding
    doc.addImage(signBase64, 'PNG', 115, bottomY, 100, 100);
  } catch (error) {
    console.error('Error loading signature image:', error);
  }

  // Signature line and text
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.line(135, bottomY + 60, 195, bottomY + 60);
  
  doc.setTextColor(...mainBlue);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signature', 165, bottomY + 65, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`${profile?.companyName || 'Softspera'}`, 165, bottomY + 68, { align: 'center' });

  // 7. Geometric Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFillColor(...mainBlue);
  doc.rect(0, pageHeight - 15, 210, 15, 'F');
  
  // Shadow Triangles
  doc.setFillColor(...darkGray);
  doc.triangle(150, pageHeight - 15, 165, pageHeight - 15, 157.5, pageHeight - 25, 'F');
  doc.triangle(170, pageHeight - 15, 185, pageHeight - 15, 177.5, pageHeight - 25, 'F');
  
  // Middle Ribbon (Main Blue)
  doc.setFillColor(...mainBlue);
  doc.triangle(150, pageHeight, 170, pageHeight, 165, pageHeight - 25, 'F');
  doc.triangle(150, pageHeight, 165, pageHeight - 25, 145, pageHeight - 25, 'F');
  
  // Rightmost Ribbon (Light Blue)
  doc.setFillColor(...lightBlue);
  doc.triangle(170, pageHeight, 190, pageHeight, 185, pageHeight - 25, 'F');
  doc.triangle(170, pageHeight, 185, pageHeight - 25, 165, pageHeight - 25, 'F');

  // Action
  if (action === 'print') {
    doc.autoPrint();
    const output = doc.output('bloburl');
    window.open(output, '_blank');
  } else {
    doc.save(`${receipt.receiptNo || 'Receipt'}.pdf`);
  }
};
