import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; header: string }[],
) {
  const header = columns.map((c) => `"${c.header}"`).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const value = row[c.key];
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportToPdf<T>(
  filename: string,
  title: string,
  rows: T[],
  columns: { key: keyof T; header: string }[],
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 25);

  autoTable(doc, {
    startY: 32,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [56, 189, 248], textColor: 255 },
    alternateRowStyles: { fillColor: [244, 247, 252] },
  });

  doc.save(`${filename}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
