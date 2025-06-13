import * as XLSX from "xlsx";

export const exportToCSV = (data: any[], filename: string) => {
  const csvRows = [];

  // Headers
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  // Rows
  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = String(row[header] ?? "").replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// export const exportToExcel = (data: any[], filename: string) => {
//   const worksheet = XLSX.utils.json_to_sheet(data)
//   const workbook = XLSX.utils.book_new()
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets")

//   const excelBuffer = XLSX.write(workbook, {
//     bookType: "xlsx",
//     type: "array"
//   })

//   const blob = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   })

//   const url = URL.createObjectURL(blob)
//   const a = document.createElement("a")
//   a.href = url
//   a.download = `${filename}.xlsx`
//   a.click()
//   URL.revokeObjectURL(url)
// }

export function exportToExcelWithTitle(
  tickets: {
    "Customer Name": any;
    "User ID": any;
    "Event Name": any;
    "Purchase Date": any;
    Quantity: any;
    Status: any;
    "Total Price": any;
    Venue: any;
  }[],
  filename: string,
  title: string
) {
  const headers = Object.keys(tickets[0]);

  const worksheet: XLSX.WorkSheet = {};

  // Tambahkan judul di baris pertama
  XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });

  // Merge judul sampai lebar kolom
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: headers.length - 1 },
    },
  ];

  // Tambahkan data mulai dari baris ke-3
  XLSX.utils.sheet_add_json(worksheet, tickets, {
    origin: "A3",
    skipHeader: false,
  });

  worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
