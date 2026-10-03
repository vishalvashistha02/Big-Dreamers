package com.bigdreamers.backend.dto;

import java.util.List;

public class LedgerResponse {
    private LedgerSummaryDto summary;
    private List<LedgerTransactionDto> transactions;

    public LedgerResponse(LedgerSummaryDto summary, List<LedgerTransactionDto> transactions) {
        this.summary = summary;
        this.transactions = transactions;
    }

    public LedgerSummaryDto getSummary() { return summary; }
    public void setSummary(LedgerSummaryDto summary) { this.summary = summary; }

    public List<LedgerTransactionDto> getTransactions() { return transactions; }
    public void setTransactions(List<LedgerTransactionDto> transactions) { this.transactions = transactions; }
}
