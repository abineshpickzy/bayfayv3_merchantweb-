import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components";
import { Button } from "antd";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function PrintInvoice(props) {
  const [invoice, setInvoice] = useState("");

  useEffect(() => {
    console.log("props", props.history.location.state?.invoice);
    if (props.history.location.state?.invoice) {
      setInvoice(props.history.location.state?.invoice);
    }
  }, [props]);

  const downloadInvoice = () => {
    let input = document.getElementById("Invoice");
    html2canvas(input, { allowTaint: true, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("download.pdf");
    });
  };

  return (
    <div id="PrintInvoice">
      <div
        style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}
      >
        <Button type="primary" size="large" onClick={() => downloadInvoice()}>
          Download
        </Button>
      </div>
      <div
        id="Invoice"
        dangerouslySetInnerHTML={{ __html: invoice }}
        style={{ width: "fit-content", margin: "auto", padding: "10px" }}
      />
    </div>
  );
}
