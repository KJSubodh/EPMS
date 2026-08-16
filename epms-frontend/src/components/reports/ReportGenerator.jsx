// src/components/reports/ReportGenerator.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaFileExcel, 
  FaFileCsv, 
  FaFilePdf,
  FaDownload, 
  FaUsers,
  FaFileAlt,
  FaEye,
  FaExternalLinkAlt,
  FaProjectDiagram,
  FaTasks
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportGenerator = () => {
  const { user } = useSelector((state) => state.auth);
  const [reportType, setReportType] = useState('tasks');
  const [format, setFormat] = useState('json');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [generatedFileUrl, setGeneratedFileUrl] = useState(null);
  const [generatedFileType, setGeneratedFileType] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);

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

  const generateReport = async () => {
    setIsLoading(true);
    setGeneratedFileUrl(null);
    setGeneratedFileType(null);
    setFileBlob(null);
    setReportData(null);
    
    try {
      if (format === 'pdf') {
        const response = await api.get(`/reports?type=${reportType}&format=json`);
        const data = response.data;
        
        if (!data.data || data.data.length === 0) {
          toast.warning('No data available for this report');
          setIsLoading(false);
          return;
        }
        
        const pdfBlob = await generatePDFBlob(data.data, reportType);
        const url = URL.createObjectURL(pdfBlob);
        setGeneratedFileUrl(url);
        setGeneratedFileType('pdf');
        setFileBlob(pdfBlob);
        toast.success('PDF report generated successfully!');
      } else if (format === 'excel' || format === 'csv') {
        const response = await api.get(`/reports?type=${reportType}&format=${format}`, {
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        setGeneratedFileUrl(url);
        setGeneratedFileType(format);
        setFileBlob(blob);
        toast.success(`${format.toUpperCase()} report generated successfully!`);
      } else {
        const response = await api.get(`/reports?type=${reportType}&format=json`);
        setReportData(response.data);
        toast.success('Report generated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFBlob = (data, type) => {
    return new Promise((resolve) => {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header - flat solid color
      doc.setFillColor(21, 19, 33);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('TaskFlow Report', 14, 16);
      
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Type: ${type.replace('-', ' ').toUpperCase()}`, 14, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 60, 16);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 28, pageWidth - 14, 28);
      
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
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' }
        },
        didDrawPage: function(data) {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${data.pageNumber} - TaskFlow Report`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });
      
      const finalY = doc.lastAutoTable.finalY + 10;
      if (finalY < doc.internal.pageSize.getHeight() - 20) {
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Records: ${data.length}`, 14, finalY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by TaskFlow', 14, finalY + 6);
      }
      
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
    });
  };

  const downloadFile = () => {
    if (!generatedFileUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedFileUrl;
    const ext = format === 'excel' ? 'xlsx' : format;
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.${ext}`);
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
    
    if (format === 'excel' || format === 'csv') {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Report Preview - ${reportType.toUpperCase()}</title></head>
            <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f5f5;font-family:sans-serif;">
              <div style="text-align:center;padding:40px;background:white;border-radius:8px;border:1px solid #e5e7eb;max-width:500px;">
                <div style="font-size:48px;margin-bottom:16px;color:#7C3AED;">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <h2 style="color:#111827;font-size:18px;font-weight:600;">${reportType.toUpperCase()} Report</h2>
                <p style="color:#6b7280;margin:8px 0;font-size:14px;">File: ${reportType}_report.${format === 'excel' ? 'xlsx' : 'csv'}</p>
                <div style="margin:16px 0;padding:16px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;text-align:left;font-size:13px;">
                  <p><strong>Format:</strong> ${format.toUpperCase()}</p>
                  <p><strong>Records:</strong> ${reportData?.data?.length || 'N/A'}</p>
                  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <button onclick="window.close()" style="padding:8px 24px;background:#111827;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;margin-top:8px;">
                  Close
                </button>
                <p style="margin-top:12px;font-size:11px;color:#9ca3af;">Click download to save the file</p>
              </div>
            </body>
          </html>
        `);
      }
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

  return (
    <div className="space-y-4">
      {/* Report Type Selection - Flat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = reportType === type.value;
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
                  <p className="text-[10px] text-gray-400 mt-0.5">Export in multiple formats</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Controls - Flat */}
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
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
                <p className="text-[10px] text-gray-400 font-mono">{format.toUpperCase()} • {new Date().toLocaleTimeString()}</p>
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
            >
              <FaFileExcel className="w-3 h-3 text-green-600" />
              Tasks → Excel
            </button>
            <button
              onClick={() => { setReportType('projects'); setFormat('pdf'); setTimeout(() => generateReport(), 150); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
            >
              <FaFilePdf className="w-3 h-3 text-red-600" />
              Projects → PDF
            </button>
            <button
              onClick={() => { setReportType('employees'); setFormat('csv'); setTimeout(() => generateReport(), 150); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
            >
              <FaFileCsv className="w-3 h-3 text-cyan-600" />
              Employees → CSV
            </button>
            <button
              onClick={() => { setReportType('tasks'); setFormat('csv'); setTimeout(() => generateReport(), 150); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded hover:bg-gray-100 transition-colors text-[10px] font-medium"
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
                Generated on: {new Date(reportData.generatedAt).toLocaleString()}
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