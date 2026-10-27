package com.wtlms.model;

import java.time.LocalDateTime;

public class ReportAuditItem {

    private String action; // GENERATED, SUBMITTED, APPROVED, REJECTED, REVISED
    private String userEmail;
    private String userName;
    private String userRole;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String remarks;

    public ReportAuditItem() {}

    public ReportAuditItem(String action, String userEmail, String userName, String userRole, String remarks) {
        this.action = action;
        this.userEmail = userEmail;
        this.userName = userName;
        this.userRole = userRole;
        this.remarks = remarks;
        this.timestamp = LocalDateTime.now();
    }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
