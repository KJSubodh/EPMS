package com.project.management.service;

import com.project.management.dao.TaskDao;
// import com.project.management.dao.ProjectDao; // Commented out to clear the unused field warning
import com.project.management.model.Task;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TaskDao taskDao;
    // private final ProjectDao projectDao; // Commented out to clear the unused field warning

    public byte[] generateTaskReportExcel() {
        List<Task> tasks = taskDao.findAll();
        
        // Using try-with-resources handles the cleanup and catches checked IOExceptions
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tasks Report");
            
            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Title", "Status", "Priority", "Project", "Assigned To", "Due Date"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }
            
            // Data
            int rowNum = 1;
            for (Task task : tasks) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(task.getId());
                row.createCell(1).setCellValue(task.getTitle());
                row.createCell(2).setCellValue(task.getStatus().name());
                row.createCell(3).setCellValue(task.getPriority().name());
                row.createCell(4).setCellValue(task.getProject().getName());
                row.createCell(5).setCellValue(task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : "Unassigned");
                row.createCell(6).setCellValue(task.getDueDate().toString());
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            // Converts the checked IOException into an unchecked RuntimeException
            throw new RuntimeException("Failed to generate Excel report due to an I/O error", e);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}