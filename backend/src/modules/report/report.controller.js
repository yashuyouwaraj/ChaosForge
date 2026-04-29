const { getMetrics } = require("../../metrics/metrics.store");
const { buildCSV } = require("./report.service");
const PDFDocument = require("pdfkit");

const downloadCSV = (req, res) => {
  const projectId = req.params.projectId;

  const metrics = getMetrics(projectId);

  const csv = buildCSV(metrics);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${projectId}.csv"`,
  );
  res.send(csv);
};

const downloadPDF = (req,res)=>{
    const projectId = req.params.projectId
    const metrics = getMetrics(projectId)

    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="report-${projectId}.pdf"`,
    )

    doc.pipe(res)

    // Title
    doc.fontSize(20).text("Performance Report",{align:"center"})
    doc.moveDown()

    //Project Info
    doc.fontSize(12).text(`Project ID: ${projectId}`)
    doc.text(`Date: ${new Date().toLocaleString()}`)
    doc.moveDown()

    //Metrics
    doc.text(`Total Requests: ${metrics.totalRequests}`)
    doc.text(`Success: ${metrics.success}`)
    doc.text(`Failure: ${metrics.failure}`)
    doc.text(`Avg Latency: ${metrics.avgLatency} ms`)
    doc.text(`P95 Latency: ${metrics.p95Latency} ms`)
    doc.text(`RPS: ${metrics.rps}`)
    doc.moveDown()

    //Section separator
    doc.text("---- End of Report ----")
    
    doc.end()
}

module.exports = { downloadCSV, downloadPDF };
