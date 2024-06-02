import React from 'react';
import './Home.css';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import '@react-pdf-viewer/core/lib/styles/index.css';

const Home = () => {
  const handleFileInput = (accept, multiple = false, callback) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = callback;
    input.click();
  };

  const convertImageToPDF = (imageType) => {
    handleFileInput(`${imageType}/*`, false, (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const pdf = new jsPDF();
          pdf.addImage(img, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
          pdf.save(`${file.name.split('.')[0]}.pdf`);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const convertDocxToPDF = () => {
    handleFileInput('.docx', false, async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        mammoth.convertToHtml({ arrayBuffer })
          .then(({ value }) => {
            const container = document.createElement('div');
            container.innerHTML = value;
            const elements = container.getElementsByTagName('*');
            for (let element of elements) {
              element.style.color = 'black';
            }
            const pdf = new jsPDF();
            pdf.html(container, {
              callback: (pdf) => pdf.save(`${file.name.split('.')[0]}.pdf`),
              x: 10,
              y: 10,
              width: 180,
            });
          })
          .catch((err) => console.error(err));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const mergePDFs = async () => {
    handleFileInput('.pdf', true, async (e) => {
      const files = e.target.files;
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const loadedPdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
    });
  };

  const compressPDF = async () => {
    handleFileInput('.pdf', false, async (e) => {
      const file = e.target.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed.pdf';
      link.click();
    });
  };

  const addWatermark = () => {
    handleFileInput('.pdf', false, async (e) => {
      const file = e.target.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const { width, height } = pages[0].getSize();
      pages.forEach((page) => {
        page.drawText('PDFEditor', {
          x: width / 2 - 50,
          y: height / 2,
          size: 50,
          opacity: 0.5,
        });
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'watermarked.pdf';
      link.click();
    });
  };

  const splitPDF = async () => {
    handleFileInput('.pdf', false, async (e) => {
      const file = e.target.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `page_${i + 1}.pdf`;
        link.click();
      }
    });
  };

  return (
    <div className="container">
      <img src="logo.png" alt="Logo" className="logo" />
      <button onClick={() => convertImageToPDF('image/jpeg')}>
        <i className="fas fa-file-image"></i> Transformar JPG em PDF
      </button>
      <button onClick={() => convertImageToPDF('image/png')}>
        <i className="fas fa-file-image"></i> Transformar PNG em PDF
      </button>
      <button onClick={convertDocxToPDF}>
        <i className="fas fa-file-word"></i> Transformar arquivo DOCX em PDF
      </button>
      <button onClick={mergePDFs}>
        <i className="fas fa-file-pdf"></i> Mesclar PDFs
      </button>
      <button onClick={compressPDF}>
        <i className="fas fa-compress"></i> Compactar PDF
      </button>
      <button onClick={addWatermark}>
        <i className="fas fa-water"></i> PDFEditor Marca D'água
      </button>
      <button onClick={splitPDF}>
        <i className="fas fa-file-pdf"></i> Dividir PDF
      </button>
    </div>
  );
};

export default Home;
