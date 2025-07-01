package com.fintrack.fintrack.service;

import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.TransactionType;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class ExportService {

    private static final Logger logger = LoggerFactory.getLogger(ExportService.class);

    public byte[] generatePdf(List<Transaction> transactions, String groupName) throws DocumentException, IOException {
        logger.info("Generating PDF for {} transactions in group: {}", transactions.size(), groupName);

        if (transactions == null || transactions.isEmpty()) {
            throw new IllegalArgumentException("No transactions to export");
        }

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("Transaction Report - " + (groupName != null ? groupName : "Unknown Group"), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20f);
            document.add(title);

            Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
            Paragraph dateGen = new Paragraph("Generated on: " + new SimpleDateFormat("dd MMM yyyy HH:mm").format(new Date()), dateFont);
            dateGen.setAlignment(Element.ALIGN_CENTER);
            dateGen.setSpacingAfter(20f);
            document.add(dateGen);

            double totalIncome = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .mapToDouble(Transaction::getAmount)
                    .sum();

            double totalExpense = transactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .mapToDouble(Transaction::getAmount)
                    .sum();

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(60);
            summaryTable.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.setSpacingAfter(20f);

            Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);

            PdfPCell incomeLabel = new PdfPCell(new Phrase("Total Income:", summaryFont));
            incomeLabel.setBorder(Rectangle.NO_BORDER);
            incomeLabel.setHorizontalAlignment(Element.ALIGN_LEFT);
            summaryTable.addCell(incomeLabel);

            PdfPCell incomeValue = new PdfPCell(new Phrase("₹" + String.format("%.2f", totalIncome), summaryFont));
            incomeValue.setBorder(Rectangle.NO_BORDER);
            incomeValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            incomeValue.setBackgroundColor(new BaseColor(220, 255, 220));
            summaryTable.addCell(incomeValue);

            PdfPCell expenseLabel = new PdfPCell(new Phrase("Total Expense:", summaryFont));
            expenseLabel.setBorder(Rectangle.NO_BORDER);
            expenseLabel.setHorizontalAlignment(Element.ALIGN_LEFT);
            summaryTable.addCell(expenseLabel);

            PdfPCell expenseValue = new PdfPCell(new Phrase("₹" + String.format("%.2f", totalExpense), summaryFont));
            expenseValue.setBorder(Rectangle.NO_BORDER);
            expenseValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            expenseValue.setBackgroundColor(new BaseColor(255, 220, 220));
            summaryTable.addCell(expenseValue);

            PdfPCell balanceLabel = new PdfPCell(new Phrase("Net Balance:", summaryFont));
            balanceLabel.setBorder(Rectangle.NO_BORDER);
            balanceLabel.setHorizontalAlignment(Element.ALIGN_LEFT);
            summaryTable.addCell(balanceLabel);

            double balance = totalIncome - totalExpense;
            PdfPCell balanceValue = new PdfPCell(new Phrase("₹" + String.format("%.2f", balance), summaryFont));
            balanceValue.setBorder(Rectangle.NO_BORDER);
            balanceValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            balanceValue.setBackgroundColor(balance >= 0 ? new BaseColor(220, 255, 220) : new BaseColor(255, 220, 220));
            summaryTable.addCell(balanceValue);

            document.add(summaryTable);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 1.5f, 2f, 3f, 1.5f}); // Set column widths

            String[] headers = {"Date", "Type", "Category", "Note", "Amount"};
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(new BaseColor(67, 97, 238)); // Nice blue color
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(8);
                table.addCell(cell);
            }

            SimpleDateFormat dateFormat = new SimpleDateFormat("dd MMM yyyy");
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);

            for (Transaction transaction : transactions) {
                String formattedDate = formatTransactionDate(transaction.getDate(), dateFormat);
                PdfPCell dateCell = new PdfPCell(new Phrase(formattedDate, dataFont));
                dateCell.setPadding(6);
                dateCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(dateCell);

                PdfPCell typeCell = new PdfPCell(new Phrase(transaction.getType().toString(), dataFont));
                typeCell.setPadding(6);
                typeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(typeCell);

                PdfPCell categoryCell = new PdfPCell(new Phrase(transaction.getCategory() != null ? transaction.getCategory() : "-", dataFont));
                categoryCell.setPadding(6);
                table.addCell(categoryCell);

                String note = transaction.getNote() != null && !transaction.getNote().trim().isEmpty()
                        ? transaction.getNote() : "-";
                PdfPCell noteCell = new PdfPCell(new Phrase(note, dataFont));
                noteCell.setPadding(6);
                table.addCell(noteCell);

                PdfPCell amountCell = new PdfPCell(new Phrase("₹" + String.format("%.2f", transaction.getAmount()), dataFont));
                amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                amountCell.setPadding(6);
                amountCell.setBackgroundColor(
                        transaction.getType() == TransactionType.INCOME
                                ? new BaseColor(240, 255, 240)
                                : new BaseColor(255, 240, 240));
                table.addCell(amountCell);
            }

            document.add(table);

            logger.info("PDF generated successfully");

        } catch (Exception e) {
            logger.error("Error generating PDF", e);
            throw e;
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        return outputStream.toByteArray();
    }

    public byte[] generateCsv(List<Transaction> transactions) throws IOException {
        logger.info("Generating CSV for {} transactions", transactions.size());

        if (transactions == null || transactions.isEmpty()) {
            throw new IllegalArgumentException("No transactions to export");
        }

        try {
            StringBuilder csvBuilder = new StringBuilder();

            csvBuilder.append("Date,Type,Category,Note,Amount\n");

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            for (Transaction transaction : transactions) {
                String formattedDate = formatTransactionDate(transaction.getDate(), dateFormat);
                csvBuilder.append(formattedDate).append(",");
                csvBuilder.append(transaction.getType()).append(",");
                csvBuilder.append(escapeCSV(transaction.getCategory())).append(",");
                csvBuilder.append(escapeCSV(transaction.getNote())).append(",");
                csvBuilder.append(String.format("%.2f", transaction.getAmount())).append("\n");
            }

            logger.info("CSV generated successfully");
            return csvBuilder.toString().getBytes("UTF-8");

        } catch (Exception e) {
            logger.error("Error generating CSV", e);
            throw new IOException("Failed to generate CSV", e);
        }
    }

    private String escapeCSV(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "-";
        }

        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }

        return value;
    }


    private String formatTransactionDate(Object dateObj, SimpleDateFormat formatter) {
        if (dateObj == null) {
            return "-";
        }

        try {
            // If it's already a Date object
            if (dateObj instanceof Date) {
                return formatter.format((Date) dateObj);
            }

            if (dateObj instanceof LocalDate) {
                LocalDate localDate = (LocalDate) dateObj;
                Date date = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
                return formatter.format(date);
            }

            if (dateObj instanceof LocalDateTime) {
                LocalDateTime localDateTime = (LocalDateTime) dateObj;
                Date date = Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
                return formatter.format(date);
            }

            if (dateObj instanceof String) {
                String dateStr = (String) dateObj;
                try {
                    LocalDate localDate = LocalDate.parse(dateStr);
                    Date date = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
                    return formatter.format(date);
                } catch (Exception e) {
                    logger.warn("Could not parse date string: {}", dateStr);
                    return dateStr; // Return as-is if parsing fails
                }
            }

            if (dateObj instanceof Long) {
                Date date = new Date((Long) dateObj);
                return formatter.format(date);
            }

            logger.warn("Unknown date type: {}, using toString()", dateObj.getClass().getSimpleName());
            return dateObj.toString();

        } catch (Exception e) {
            logger.error("Error formatting date: {}", dateObj, e);
            return dateObj.toString();
        }
    }
}