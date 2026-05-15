'use strict';

const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

const RECEIPTS_DIR = path.join(process.cwd(), 'receipts');
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

const generateReceiptPDF = ({
  receipt_no,
  payment,
  student,
  parent,
  summary,
}) => {
  return new Promise((resolve, reject) => {
    const fileName    = `${receipt_no}.pdf`;
    const filePath    = path.join(RECEIPTS_DIR, fileName);
    const doc         = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // ── Header ─────────────────────────────────────────────────────────
    doc.rect(0, 0, 612, 110).fill('#1F4E79');
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('SCHOOL MANAGEMENT SYSTEM', 50, 22, { align: 'center' });
    doc.fontSize(12)
       .font('Helvetica')
       .text('Official Fee Payment Receipt', 50, 54, { align: 'center' });
    doc.fontSize(9)
       .text('www.school.edu.gh  |  info@school.edu.gh  |  +233 30 000 0000', 50, 76, { align: 'center' });

    // ── Receipt number and date bar ────────────────────────────────────
    doc.rect(50, 125, 512, 36).fill('#D6E4F0');
    doc.fillColor('#1F4E79')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`Receipt No: ${receipt_no}`, 62, 138);
    doc.text(
      `Date: ${new Date(payment.payment_date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
      })}`,
      62, 138, { align: 'right', width: 488 }
    );

    // ── Student & Parent info ──────────────────────────────────────────
    let y = 178;
    doc.fillColor('#1F4E79')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('STUDENT & PARENT INFORMATION', 50, y);
    doc.moveTo(50, y + 15)
       .lineTo(562, y + 15)
       .strokeColor('#2E75B6')
       .lineWidth(1)
       .stroke();

    y += 24;

    const infoRows = [
      ['Student Name',      `${student.first_name} ${student.last_name}`],
      ['Student Code',      student.student_code || 'N/A'],
      ['Class',             student.class_name   || 'N/A'],
      ['Parent / Guardian', parent
        ? `${parent.first_name} ${parent.last_name}`
        : 'N/A'],
      ['Parent Phone',      parent ? parent.phone : 'N/A'],
      ['Relationship',      parent ? (parent.relation || 'Guardian') : 'N/A'],
    ];

    infoRows.forEach(([label, value], i) => {
      if (i % 2 === 0) doc.rect(50, y, 512, 22).fill('#F8FBFD');
      doc.fillColor('#555555')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(label + ':', 62, y + 6);
      doc.fillColor('#111111')
         .font('Helvetica')
         .text(value, 220, y + 6);
      y += 22;
    });

    // ── Payment details ────────────────────────────────────────────────
    y += 14;
    doc.fillColor('#1F4E79')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('PAYMENT DETAILS', 50, y);
    doc.moveTo(50, y + 15)
       .lineTo(562, y + 15)
       .strokeColor('#2E75B6')
       .lineWidth(1)
       .stroke();

    y += 24;

    const payRows = [
      ['Fee Structure',  payment.fee_structure_name || 'N/A'],
      ['Term',           payment.term               || 'N/A'],
      ['Academic Year',  payment.academic_year      || 'N/A'],
      ['Payment Method', payment.payment_method
        ? payment.payment_method.replace('_', ' ').toUpperCase()
        : 'N/A'],
      ['Reference No',   payment.reference          || 'N/A'],
      ['Recorded By',    payment.recorded_by_name   || 'N/A'],
    ];

    payRows.forEach(([label, value], i) => {
      if (i % 2 === 0) doc.rect(50, y, 512, 22).fill('#F8FBFD');
      doc.fillColor('#555555')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(label + ':', 62, y + 6);
      doc.fillColor('#111111')
         .font('Helvetica')
         .text(value, 220, y + 6);
      y += 22;
    });

    // ── Payment summary — most important section ────────────────────────
    y += 18;

    // Section label
    doc.fillColor('#1F4E79')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('PAYMENT SUMMARY', 50, y);
    doc.moveTo(50, y + 15)
       .lineTo(562, y + 15)
       .strokeColor('#2E75B6')
       .lineWidth(1)
       .stroke();

    y += 24;

    // Total fee row
    doc.rect(50, y, 512, 26).fill('#EAF4FB');
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Total Term Fee:', 62, y + 7);
    doc.fillColor('#1F4E79')
       .font('Helvetica-Bold')
       .text(
         `GHS ${Number(summary.total_fee).toFixed(2)}`,
         62, y + 7, { align: 'right', width: 488 }
       );
    y += 26;

    // Amount paid previously row
    const previouslyPaid = Number(summary.total_paid) - Number(payment.amount_paid);
    doc.rect(50, y, 512, 26).fill('#FFFFFF');
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text('Previously Paid:', 62, y + 7);
    doc.fillColor('#333333')
       .text(
         `GHS ${previouslyPaid > 0 ? previouslyPaid.toFixed(2) : '0.00'}`,
         62, y + 7, { align: 'right', width: 488 }
       );
    y += 26;

    // ── Amount paid THIS payment — highlighted prominently ─────────────
    doc.rect(50, y, 512, 38).fill('#1E7145');
    doc.fillColor('#FFFFFF')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(
         `Amount Paid by ${parent
           ? parent.first_name + ' ' + parent.last_name
           : 'Parent / Guardian'}:`,
         62, y + 10
       );
    doc.fillColor('#FFFFFF')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(
         `GHS ${Number(payment.amount_paid).toFixed(2)}`,
         62, y + 8, { align: 'right', width: 488 }
       );
    y += 38;

    // Total paid so far row
    doc.rect(50, y, 512, 26).fill('#EBF5EB');
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text('Total Paid So Far:', 62, y + 7);
    doc.fillColor('#1E7145')
       .font('Helvetica-Bold')
       .text(
         `GHS ${Number(summary.total_paid).toFixed(2)}`,
         62, y + 7, { align: 'right', width: 488 }
       );
    y += 26;

    // ── Outstanding balance — highlighted prominently ───────────────────
    const balance    = Number(summary.balance);
    const isCleared  = balance <= 0;
    const balanceBg  = isCleared ? '#1E7145' : '#C00000';

    doc.rect(50, y, 512, 38).fill(balanceBg);
    doc.fillColor('#FFFFFF')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Outstanding Balance:', 62, y + 10);
    doc.fillColor('#FFFFFF')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(
         isCleared ? 'FULLY CLEARED' : `GHS ${balance.toFixed(2)}`,
         62, y + 8, { align: 'right', width: 488 }
       );
    y += 38;

    // Due date if set
    if (payment.due_date) {
      doc.rect(50, y, 512, 22).fill('#FFF3CD');
      doc.fillColor('#856404')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(
           `Payment Due Date: ${new Date(payment.due_date).toLocaleDateString('en-GB', {
             day: '2-digit', month: 'long', year: 'numeric',
           })}`,
           62, y + 6, { align: 'center', width: 488 }
         );
      y += 22;
    }

    // ── Notes ──────────────────────────────────────────────────────────
    if (payment.notes) {
      y += 8;
      doc.fillColor('#555555')
         .fontSize(9)
         .font('Helvetica-Oblique')
         .text(`Notes: ${payment.notes}`, 62, y);
      y += 16;
    }

    // ── Footer ─────────────────────────────────────────────────────────
    const footerY = 768;
    doc.moveTo(50, footerY)
       .lineTo(562, footerY)
       .strokeColor('#CCCCCC')
       .lineWidth(0.5)
       .stroke();

    doc.fillColor('#999999')
       .fontSize(8)
       .font('Helvetica')
       .text(
         'This is an electronically generated receipt and does not require a physical signature.',
         50, footerY + 8, { align: 'center' }
       );
    doc.text(
      `Generated on ${new Date().toLocaleString('en-GB')}`,
      50, footerY + 20, { align: 'center' }
    );
    doc.text(
      'School Management System — Confidential',
      50, footerY + 32, { align: 'center' }
    );

    doc.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error',  reject);
  });
};

module.exports = { generateReceiptPDF };