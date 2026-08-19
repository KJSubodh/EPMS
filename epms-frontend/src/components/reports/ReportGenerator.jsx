// src/components/reports/ReportGenerator.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FaFileExcel, 
  FaFileCsv, 
  FaFilePdf,
  FaDownload, 
  FaUsers,
  FaFileAlt,
  FaEye,
  FaProjectDiagram,
  FaTasks,
  FaSpinner
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const RANGE_LABELS = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year'
};

// Rolling window ending "now" - e.g. 'month' means "created in the last 30
// days", not calendar-month boundaries. Returns null for an unrecognized/
// missing range, which callers treat as "no filtering".
const getRangeStartDate = (range) => {
  const start = new Date();
  switch (range) {
    case 'week':
      start.setDate(start.getDate() - 7);
      return start;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      return start;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      return start;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      return start;
    default:
      return null;
  }
};

const getRangeLabel = (range) => RANGE_LABELS[range] || 'All Time';

const ReportGenerator = ({ dateRange = 'month' }) => {
  const { user } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.admin);
  
  const [reportType, setReportType] = useState('tasks');
  const [format, setFormat] = useState('json');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [generatedFileUrl, setGeneratedFileUrl] = useState(null);
  const [generatedFileType, setGeneratedFileType] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);

  // Filtered count per report type, so the "records available" badge on
  // each type card matches what Generate will actually produce - previously
  // this read the raw unfiltered arrays directly, out of sync with the
  // date-range filter applied in getReportData().
  const getFilteredCount = (type) => {
    const rangeStart = getRangeStartDate(dateRange);
    const raw = type === 'tasks' ? (tasks || []) : type === 'projects' ? (projects || []) : (users || []);
    if (!rangeStart) return raw.length;
    return raw.filter((item) => item.createdAt && new Date(item.createdAt) >= rangeStart).length;
  };

  const reportTypes = [
    { value: 'tasks', label: 'Tasks Report', icon: FaTasks },
    { value: 'projects', label: 'Projects Report', icon: FaProjectDiagram },
    ...(user?.role === 'ADMIN' ? [{ value: 'employees', label: 'Employees Report', icon: FaUsers }] : [])
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FaFileAlt },
    { value: 'excel', label: 'Excel', icon: FaFileExcel },
    { value: 'csv', label: 'CSV', icon: FaFileCsv },
    { value: 'pdf', label: 'PDF', icon: FaFilePdf }
  ];

  // ✅ Get data based on report type, filtered by the selected date range.
  // "Created within the range" is the filtering semantic used here - e.g.
  // "This Month" means tasks/projects created in the last 30 days, not
  // ones due this month. If you want tasks filtered by due date instead,
  // that's a one-line change below (swap createdAt for dueDate on tasks).
  const getReportData = () => {
    let data;
    switch (reportType) {
      case 'tasks':
        data = tasks || [];
        break;
      case 'projects':
        data = projects || [];
        break;
      case 'employees':
        data = users || [];
        break;
      default:
        data = [];
    }

    const rangeStart = getRangeStartDate(dateRange);
    if (!rangeStart) return data;

    return data.filter((item) => {
      if (!item.createdAt) return false;
      return new Date(item.createdAt) >= rangeStart;
    });
  };

  // ✅ Format data for display
  const formatDataForDisplay = (data) => {
    if (!data || data.length === 0) return [];

    switch (reportType) {
      case 'tasks':
        return data.map(task => ({
          ID: task.id,
          Title: task.title,
          Status: task.status,
          Priority: task.priority,
          'Assigned To': task.assignedToName || 'Unassigned',
          'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—',
          Project: task.projectName || '—'
        }));
      case 'projects':
        return data.map(project => ({
          ID: project.id,
          Name: project.name,
          Status: project.status,
          'Start Date': project.startDate ? new Date(project.startDate).toLocaleDateString() : '—',
          'End Date': project.endDate ? new Date(project.endDate).toLocaleDateString() : '—',
          Members: project.memberCount || 0,
          Tasks: project.taskCount || 0
        }));
      case 'employees':
        return data.map(user => ({
          ID: user.id,
          Name: user.fullName,
          Email: user.email,
          Role: user.role,
          Department: user.department || '—',
          Status: user.isActive ? 'Active' : 'Inactive'
        }));
      default:
        return data;
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    setGeneratedFileUrl(null);
    setGeneratedFileType(null);
    setFileBlob(null);
    setReportData(null);
    
    try {
      // ✅ Get actual data from Redux store
      const rawData = getReportData();
      
      if (!rawData || rawData.length === 0) {
        toast.warning(`No data available for ${reportType} report`);
        setIsLoading(false);
        return;
      }

      const formattedData = formatDataForDisplay(rawData);

      if (format === 'pdf') {
        const pdfBlob = await generatePDFBlob(formattedData, reportType);
        const url = URL.createObjectURL(pdfBlob);
        setGeneratedFileUrl(url);
        setGeneratedFileType('pdf');
        setFileBlob(pdfBlob);
        toast.success('PDF report generated successfully!');
      } else if (format === 'excel') {
        const excelBlob = generateExcelBlob(formattedData, reportType);
        const url = URL.createObjectURL(excelBlob);
        setGeneratedFileUrl(url);
        setGeneratedFileType('excel');
        setFileBlob(excelBlob);
        toast.success('Excel report generated successfully!');
      } else if (format === 'csv') {
        const csvBlob = generateCSVBlob(formattedData, reportType);
        const url = URL.createObjectURL(csvBlob);
        setGeneratedFileUrl(url);
        setGeneratedFileType('csv');
        setFileBlob(csvBlob);
        toast.success('CSV report generated successfully!');
      } else {
        // JSON format
        setReportData({
          data: formattedData,
          generatedAt: new Date().toISOString(),
          type: reportType,
          count: formattedData.length
        });
        toast.success('Report generated successfully!');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Generate PDF
  const generatePDFBlob = (data, type) => {
    return new Promise((resolve) => {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Header
      doc.setFillColor(21, 19, 33);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('EPMS Report', 14, 16);
      
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Type: ${type.toUpperCase()} • Range: ${getRangeLabel(dateRange)}`, 14, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 60, 16);
      doc.text(`Records: ${data.length}`, pageWidth - 60, 22);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 28, pageWidth - 14, 28);
      
      if (data.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text('No data available for this report', pageWidth / 2, 50, { align: 'center' });
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
        return;
      }
      
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(key => item[key] || 'N/A'));
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 32,
        theme: 'striped',
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        didDrawPage: function(data) {
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${data.pageNumber} - EPMS Report`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
          );
        }
      });
      
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
    });
  };

  // ✅ Generate Excel
  const generateExcelBlob = (data, type) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type.toUpperCase());
    
    // Auto column widths
    const colWidths = [];
    const headers = Object.keys(data[0] || {});
    headers.forEach((header, index) => {
      let maxLen = header.length;
      data.forEach(row => {
        const val = String(row[header] || '');
        if (val.length > maxLen) maxLen = val.length;
      });
      colWidths[index] = { wch: Math.min(Math.max(maxLen + 2, 12), 30) };
    });
    ws['!cols'] = colWidths;
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });
  };

  // ✅ Generate CSV
  const generateCSVBlob = (data, type) => {
    if (data.length === 0) {
      return new Blob(['No data available'], { type: 'text/csv' });
    }
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    return new Blob([csv], { type: 'text/csv' });
  };

  const downloadFile = () => {
    if (!generatedFileUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedFileUrl;
    const ext = format === 'excel' ? 'xlsx' : format;
    link.setAttribute('download', `${reportType}_report_${dateRange}_${new Date().toISOString().split('T')[0]}.${ext}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('File downloaded successfully!');
  };

  const viewInNewTab = () => {
    if (!generatedFileUrl) return;
    
    if (format === 'pdf') {
      window.open(generatedFileUrl, '_blank');
      return;
    }
    
    // For other formats, show a preview window
    const newWindow = window.open();
    if (newWindow) {
      const data = getReportData();
      const formattedData = formatDataForDisplay(data);
      newWindow.document.write(`
        <html>
          <head><title>Report Preview - ${reportType.toUpperCase()}</title></head>
          <body style="margin:0;padding:40px;font-family:sans-serif;background:#f5f5f5;">
            <div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;border:1px solid #e5e7eb;">
              <h1 style="margin:0 0 8px 0;font-size:24px;color:#111827;">${reportType.toUpperCase()} Report</h1>
              <p style="margin:0 0 20px 0;color:#6b7280;font-size:14px;">Generated: ${new Date().toLocaleString()} • ${getRangeLabel(dateRange)} • ${formattedData.length} records</p>
              <div style="overflow-x:auto;border:1px solid #e5e7eb;border-radius:6px;">
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                  <thead style="background:#f9fafb;">
                    <tr>
                      ${Object.keys(formattedData[0] || {}).map(h => 
                        `<th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;border-bottom:2px solid #e5e7eb;">${h}</th>`
                      ).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${formattedData.slice(0, 20).map(row => `
                      <tr>
                        ${Object.values(row).map(val => 
                          `<td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#4b5563;">${val || '—'}</td>`
                        ).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ${formattedData.length > 20 ? `<p style="margin-top:12px;font-size:12px;color:#9ca3af;">Showing first 20 of ${formattedData.length} records</p>` : ''}
              <div style="margin-top:20px;display:flex;gap:12px;">
                <button onclick="window.close()" style="padding:8px 20px;background:#111827;color:white;border:none;border-radius:6px;cursor:pointer;">Close</button>
                <button onclick="window.location.href='${generatedFileUrl}'" style="padding:8px 20px;background:#7C3AED;color:white;border:none;border-radius:6px;cursor:pointer;">Download File</button>
              </div>
            </div>
          </body>
        </html>
      `);
    }
  };

  const renderReportData = () => {
    if (!reportData || !reportData.data) return null;
    
    const data = reportData.data;
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded bg-white">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-3">
            <FaFileAlt className="text-xl" />
          </div>
          <p className="text-sm text-gray-500">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Try generating a different report</p>
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto mt-4">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.slice(0, 20).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {headers.map((header) => (
                      <td key={header} className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap font-mono">
                        {row[header] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {data.length > 20 && (
          <p className="text-xs text-gray-400 mt-2 text-center font-mono">Showing first 20 of {data.length} records</p>
        )}
      </div>
    );
  };

  const getSelectedReport = () => {
    return reportTypes.find(r => r.value === reportType) || reportTypes[0];
  };

  const getSelectedFormat = () => {
    return formatOptions.find(f => f.value === format) || formatOptions[0];
  };

  // Get data count
  const getDataCount = () => {
    const data = getReportData();
    return data?.length || 0;
  };

  return (
    <div className="space-y-4">
      {/* Report Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = reportType === type.value;
          const count = getFilteredCount(type.value);
          return (
            <button
              key={type.value}
              onClick={() => {
                setReportType(type.value);
                setReportData(null);
                setGeneratedFileUrl(null);
              }}
              className={`p-4 border-2 rounded transition-all duration-150 text-left ${
                isSelected 
                  ? 'border-[#7C3AED] bg-[#7C3AED]/5' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${isSelected ? 'bg-[#7C3AED]' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {type.label}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {count} records available
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1.5">Export Format</label>
            <div className="flex flex-wrap gap-1.5">
              {formatOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = format === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFormat(opt.value);
                      setGeneratedFileUrl(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-medium transition-colors ${
                      isSelected 
                        ? 'border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED]' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={isLoading || getDataCount() === 0}
              className="flex items-center justify-center gap-2 px-4 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaDownload className="w-3 h-3" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Actions */}
        {generatedFileUrl && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded bg-white border border-gray-200 ${
                format === 'excel' ? 'text-green-600' : 
                format === 'pdf' ? 'text-red-600' : 
                format === 'csv' ? 'text-cyan-600' : 
                'text-blue-600'
              }`}>
                {format === 'excel' && <FaFileExcel className="w-4 h-4" />}
                {format === 'pdf' && <FaFilePdf className="w-4 h-4" />}
                {format === 'csv' && <FaFileCsv className="w-4 h-4" />}
                {format === 'json' && <FaFileAlt className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">{reportType.toUpperCase()} Report</p>
                <p className="text-[10px] text-gray-400 font-mono">{format.toUpperCase()} • {getRangeLabel(dateRange)} • {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={viewInNewTab}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <FaEye className="w-3 h-3" />
                View
              </button>
              <button
                onClick={downloadFile}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-gray-900 border border-gray-900 rounded hover:bg-gray-800 transition-colors"
              >
                <FaDownload className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Quick Export */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-2">Quick Export</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setReportType('tasks'); setFormat('excel'); setTimeout(() => generateReport(), 150); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
              disabled={tasks?.length === 0}
            >
              <FaFileExcel className="w-3 h-3 text-green-600" />
              Tasks → Excel
            </button>
            <button
              onClick={() => { setReportType('projects'); setFormat('pdf'); setTimeout(() => generateReport(), 150); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
              disabled={projects?.length === 0}
            >
              <FaFilePdf className="w-3 h-3 text-red-600" />
              Projects → PDF
            </button>
            <button
              onClick={() => { setReportType('employees'); setFormat('csv'); setTimeout(() => generateReport(), 150); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
              disabled={users?.length === 0}
            >
              <FaFileCsv className="w-3 h-3 text-cyan-600" />
              Employees → CSV
            </button>
            <button
              onClick={() => { setReportType('tasks'); setFormat('csv'); setTimeout(() => generateReport(), 150); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
              disabled={tasks?.length === 0}
            >
              <FaFileCsv className="w-3 h-3 text-cyan-600" />
              Tasks → CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && format === 'json' && (
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                {(() => {
                  const selected = getSelectedReport();
                  const Icon = selected.icon;
                  return <Icon className="w-4 h-4 text-[#7C3AED]" />;
                })()}
                Report Preview
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">
                {reportData.count} records • {getRangeLabel(dateRange)} • Generated: {new Date(reportData.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => { setFormat('excel'); setTimeout(() => generateReport(), 150); }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
              >
                <FaFileExcel className="w-3 h-3" />
                Excel
              </button>
              <button
                onClick={() => { setFormat('pdf'); setTimeout(() => generateReport(), 150); }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                <FaFilePdf className="w-3 h-3" />
                PDF
              </button>
            </div>
          </div>
          {renderReportData()}
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;