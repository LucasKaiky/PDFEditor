import React from 'react';
import './Home.css';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import '@react-pdf-viewer/core/lib/styles/index.css';

function Home() {
  const convertImageToPDF = (imageType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `${imageType}/*`;
    input.onchange = (e) => {
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
    };
    input.click();
  };

  const convertDocxToPDF = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        mammoth.convertToHtml({ arrayBuffer })
          .then(({ value }) => {
            const pdf = new jsPDF();
            pdf.html(value, {
              callback: (pdf) => {
                pdf.save(`${file.name.split('.')[0]}.pdf`);
              },
              x: 10,
              y: 10,
              width: 180
            });
          })
          .catch((err) => console.error(err));
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  const mergePDFs = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = e.target.files;
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          const loadedPdf = await PDFDocument.load(arrayBuffer);
          const copiedPages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
          copiedPages.forEach((page) => {
            pdfDoc.addPage(page);
          });
          if (i === files.length - 1) {
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'merged.pdf';
            link.click();
          }
        };
        reader.readAsArrayBuffer(files[i]);
      }
    };
    input.click();
  };

  const compressPDF = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'compressed.pdf';
        link.click();
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  return (
    <div className="container">
      <img src="logo.png" alt="Logo" className="logo" />
      <button onClick={() => convertImageToPDF('image/jpeg')}>
        <i className="fas fa-file-image"></i>
        Transformar JPG em PDF
      </button>
      <button onClick={() => convertImageToPDF('image/png')}>
        <i className="fas fa-file-image"></i>
        Transformar PNG em PDF
      </button>
      <button onClick={convertDocxToPDF}>
        <i className="fas fa-file-word"></i>
        Transformar arquivo DOCX em PDF
      </button>
      <button onClick={mergePDFs}>
        <i className="fas fa-file-pdf"></i>
        Mesclar PDFs
      </button>
      <button onClick={compressPDF}>
        <i className="fas fa-compress"></i>
        Compactar PDF
      </button>
    </div>
  );
}

export default Home;
