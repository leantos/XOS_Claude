# CVS - Hotel Revenue Management System
## Comprehensive User Guide

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [System Overview](#system-overview)
4. [Core Features](#core-features)
5. [User Workflows](#user-workflows)
6. [Module Reference](#module-reference)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#frequently-asked-questions)
9. [Reference Materials](#reference-materials)

---

## Introduction

### What is CVS?

CVS (Central Verification System) is a comprehensive enterprise-level hotel revenue management system designed for hospitality businesses. It provides integrated financial operations, automated workflows, and real-time reporting capabilities to streamline daily operations and ensure accurate financial reporting.

### Who Should Use This Guide?

This guide is designed for:
- **Hotel Staff**: Daily operations users
- **Managers**: Approval workflow participants
- **Finance Team**: Revenue reconciliation specialists  
- **IT Administrators**: System setup and maintenance
- **New Users**: Getting started with the system

### Key Benefits

- **Automated Revenue Auditing**: Streamlined Opera PMS integration
- **Bank Reconciliation**: Automated transaction matching
- **Workflow Management**: Multi-level approval processes
- **Real-time Reporting**: Live dashboards and analytics
- **Refund Processing**: BACS-enabled payment management
- **Multi-site Support**: Centralized management across properties

---

## Getting Started

### Prerequisites

Before using CVS, ensure you have:
- Web browser (Chrome, Firefox, Safari, Edge)
- Valid user account with assigned permissions
- Network access to the CVS server
- Basic understanding of hotel operations

### First Time Login

1. **Access the System**
   - Navigate to your CVS URL (provided by your administrator)
   - You'll see the login screen

2. **Enter Credentials**
   - **Username**: Your assigned username
   - **Password**: Your secure password
   - **Site**: Select your property/location

3. **Initial Setup**
   - Complete your profile information
   - Set up notification preferences
   - Review your dashboard permissions

### Dashboard Overview

Upon login, you'll see the main dashboard containing:

- **Pending Tasks**: Items requiring your attention
- **Quick Actions**: Frequently used functions
- **Recent Activity**: Latest transactions and updates
- **System Notifications**: Important alerts and messages
- **Performance Metrics**: Key performance indicators

### Navigation Basics

The system uses a modular navigation structure:

- **Left Sidebar**: Main navigation menu
- **Top Header**: User profile, notifications, logout
- **Breadcrumbs**: Current location within the system
- **Module Tabs**: Switch between related functions

---

## System Overview

### Architecture

CVS is built using modern web technologies:

- **Frontend**: React-based user interface
- **Backend**: ASP.NET Core API
- **Database**: PostgreSQL for data storage
- **Authentication**: JWT-based secure access
- **Real-time Updates**: SignalR for live notifications

### Module Categories

#### CVSM Series - General/Master Configuration
- User management and permissions
- Site configuration and settings
- Workflow and routing setup
- System templates and formats

#### CVST Series - Transaction Processing
- Opera income audit processing
- Bank reconciliation workflows
- Refund management and BACS processing
- F&B void handling

#### CVSR Series - Reports and Analytics
- Revenue reports and analytics
- Audit trail reporting
- Management dashboard metrics
- Reconciliation summaries

### Security Features

- **Multi-factor Authentication**: Enhanced security options
- **Role-based Access Control**: Granular permissions
- **Audit Logging**: Complete activity tracking
- **Data Encryption**: Secure data transmission
- **Session Management**: Automatic timeout protection

---

## Core Features

### 1. Opera Income Audit (CVST020)

**Purpose**: Automate daily revenue auditing from Opera PMS

**Key Functions**:
- Import Opera data files (Excel/CSV)
- Validate revenue figures automatically
- Compare statistics and balances
- Generate variance reports
- Route for approval workflow

**How to Use**:
1. Navigate to **Transaction > Opera Income Audit**
2. Click **Auto Fill Data** to import Opera files
3. Review the imported revenue figures
4. Check for discrepancies in the validation section
5. Add comments for any adjustments
6. Click **Submit for Approval** when ready

**Important Notes**:
- Files must be in the correct format
- Daily processing typically occurs at 6 AM
- Discrepancies over $100 require manager approval

### 2. Bank Reconciliation (CVST005)

**Purpose**: Match bank statements with internal transactions

**Key Functions**:
- Import bank statement files
- Auto-match transactions by amount and date
- Manual matching for complex transactions
- Exception handling for unmatched items
- Generate reconciliation reports

**How to Use**:
1. Navigate to **Transaction > Bank Reconciliation**
2. Click **Import Statement** and select your bank file
3. Review the auto-matched transactions (green indicators)
4. Manually match suggested transactions (yellow indicators)
5. Investigate unmatched items (red indicators)
6. Click **Complete Reconciliation** when finished

**Supported Bank Formats**:
- HSBC: CSV format
- Barclays: CSV format
- Lloyds: PDF or CSV format
- NatWest: CSV format

### 3. Refund Processing (CVST010/CVST011/CVST015)

**Purpose**: Handle guest refunds through approval workflows

**Key Functions**:
- Create refund requests
- Multi-level approval process
- BACS batch processing
- Refund tracking and reporting
- Guest notification management

**How to Use**:

**Creating a Refund** (CVST010):
1. Navigate to **Transaction > Refund Processing**
2. Click **New Refund**
3. Enter guest details and refund amount
4. Select refund method (Credit Card or Bank Transfer)
5. Add justification comments
6. Submit for approval

**Quick Refund** (CVST011):
1. Use for amounts under $100
2. Streamlined single-screen process
3. Immediate processing for authorized users

**BACS Refunds** (CVST015):
1. Bank transfer refunds are automatically queued
2. Daily BACS batch runs at 2 PM
3. Cutoff time is 1:30 PM for same-day processing

### 4. F&B Void Management (CVST016/CVST017/CVST018)

**Purpose**: Handle food & beverage transaction voids

**Key Functions**:
- Create void requests with justification
- Manager approval workflow
- POS system integration
- Void audit trail
- Exception reporting

**How to Use**:
1. Navigate to **Transaction > F&B Voids**
2. Select the transaction to void
3. Enter reason code and comments
4. Submit for manager approval
5. Approved voids are automatically processed in POS

### 5. Workflow Management (CVSM045/CVSM046)

**Purpose**: Manage approval processes and routing

**Key Functions**:
- Configure approval hierarchies
- Set routing rules by amount/type
- Track workflow progress
- Reassign pending approvals
- Performance reporting

**How to Use**:
1. Navigate to **General > Workflow Master**
2. View pending approvals in your queue
3. Click on items to review details
4. Approve, reject, or return with comments
5. Use **Workflow Search** to find specific items

### 6. Dashboard and Reporting (CVSM040/CVSR005)

**Purpose**: Real-time monitoring and reporting

**Key Functions**:
- Live performance metrics
- Pending item alerts
- Revenue trend analysis
- Exception reporting
- Custom report generation

**Dashboard Widgets**:
- **Revenue Summary**: Daily/monthly revenue tracking
- **Pending Approvals**: Items awaiting your action
- **Exception Alerts**: Items requiring attention
- **Performance KPIs**: Key metrics and trends

---

## User Workflows

### Daily Operations Workflow

#### Morning Routine (6:00 AM - 9:00 AM)
1. **Check Dashboard**: Review overnight alerts and pending items
2. **Opera Income Audit**: Process automatic imports or manual uploads
3. **Bank Reconciliation**: Import overnight bank statements
4. **Review Exceptions**: Address any system alerts or discrepancies

#### Business Hours (9:00 AM - 6:00 PM)
1. **Process Refunds**: Handle guest refund requests
2. **Approve Workflows**: Review and approve pending items
3. **Handle F&B Voids**: Process void requests from outlets
4. **Monitor Alerts**: Respond to real-time notifications

#### End of Day (6:00 PM - 11:00 PM)
1. **Final Reconciliation**: Ensure all transactions are processed
2. **Generate Reports**: Run daily revenue and audit reports
3. **Review Tomorrow's Schedule**: Check upcoming automated tasks
4. **System Maintenance**: Review system health and performance

### Approval Workflow Process

#### For Standard Users
1. **Create Request**: Enter transaction details and justification
2. **Submit to Supervisor**: Route to immediate supervisor
3. **Track Progress**: Monitor approval status in real-time
4. **Receive Notification**: Get updates via email/SignalR
5. **Follow Up**: Contact approvers if delays occur

#### For Supervisors/Managers
1. **Review Queue**: Check pending approvals dashboard
2. **Evaluate Request**: Review details and supporting documentation
3. **Make Decision**: Approve, reject, or return for more information
4. **Add Comments**: Provide feedback for decisions
5. **Route Forward**: Send to next level if required

### Exception Handling Workflow

#### When Discrepancies Occur
1. **Identify Issue**: System flags discrepancy or user reports problem
2. **Investigate**: Review transaction history and supporting documents
3. **Research**: Contact relevant departments or external parties
4. **Document**: Record findings and corrective actions
5. **Resolve**: Process corrections and update records
6. **Report**: Generate exception report for management

---

## Module Reference

### General Configuration Modules (CVSM Series)

| Module | Name | Purpose | User Level |
|--------|------|---------|------------|
| CVSM001 | User Management | Manage user accounts and permissions | Admin |
| CVSM005 | Site Configuration | Configure property settings | Admin/Manager |
| CVSM006 | Site Settings | Detailed site parameters | Manager |
| CVSM007 | Department Setup | Define organizational departments | Manager |
| CVSM008 | User Groups | Manage user group permissions | Admin |
| CVSM020 | Routing Master | Configure approval workflows | Admin |
| CVSM025 | Bank Statement Format | Set up bank import formats | Admin |
| CVSM026 | Email Templates | Configure notification templates | Admin |
| CVSM030 | User Access Rights | Individual user permissions | Admin |
| CVSM040 | Dashboard Config | Customize dashboard layouts | Manager |

### Transaction Modules (CVST Series)

| Module | Name | Purpose | User Level |
|--------|------|---------|------------|
| CVST005 | Bank Reconciliation | Match bank transactions | User/Supervisor |
| CVST010 | Refund Processing | Handle guest refunds | User/Supervisor |
| CVST011 | Quick Refund | Fast-track small refunds | User |
| CVST015 | BACS Refund | Bank transfer processing | Supervisor |
| CVST016 | F&B Voids | Process outlet voids | User |
| CVST017 | F&B Void Approval | Approve void requests | Manager |
| CVST020 | Opera Income Audit | Daily revenue validation | User/Supervisor |
| CVST025 | Night Audit Checklist | Complete audit tasks | Night Auditor |

### Reporting Modules (CVSR Series)

| Module | Name | Purpose | User Level |
|--------|------|---------|------------|
| CVSR005 | Revenue Reports | Generate revenue analytics | All Users |
| CVSR010 | Audit Reports | Audit trail and compliance | Manager |
| CVSR015 | Management Flash | Executive summary reports | Manager |
| CVSR020 | Reconciliation Reports | Bank rec summaries | All Users |

---

## Troubleshooting

### Common Issues and Solutions

#### Login Problems

**Issue**: Cannot login to the system
**Symptoms**: 
- Invalid credentials error
- System timeout
- Blank login screen

**Solutions**:
1. **Check Credentials**: Verify username, password, and site selection
2. **Clear Browser Cache**: Delete cookies and cached files
3. **Try Different Browser**: Use Chrome or Firefox
4. **Check Network**: Ensure internet connectivity
5. **Contact IT**: If problem persists, contact system administrator

#### File Upload Issues

**Issue**: Cannot import Opera or bank files
**Symptoms**:
- File upload fails
- Invalid format error
- Timeout during import

**Solutions**:
1. **Check File Format**: Ensure file matches expected format (CSV/Excel)
2. **Verify File Size**: Maximum 10MB for bank statements, 5MB for Opera files
3. **Check File Content**: Ensure file contains valid data with required columns
4. **Close Excel**: Close the file in Excel before uploading
5. **Retry Upload**: Wait 30 seconds and try again

#### Performance Issues

**Issue**: System running slowly
**Symptoms**:
- Long loading times
- Unresponsive pages
- Timeout errors

**Solutions**:
1. **Refresh Browser**: Press F5 or Ctrl+R to reload
2. **Close Other Tabs**: Reduce browser memory usage
3. **Check Internet Speed**: Ensure adequate bandwidth
4. **Clear Browser Data**: Remove temporary files and cookies
5. **Update Browser**: Use latest version of your web browser

#### Report Generation Problems

**Issue**: Reports not generating or displaying
**Symptoms**:
- Report stays in "Processing" status
- Blank or incomplete reports
- Download fails

**Solutions**:
1. **Check Date Range**: Ensure valid date parameters
2. **Reduce Data Volume**: Try smaller date ranges
3. **Wait for Processing**: Large reports may take 2-3 minutes
4. **Check Permissions**: Verify you have access to requested data
5. **Try Different Format**: Switch between PDF/Excel formats

#### Workflow Approval Issues

**Issue**: Approvals not routing correctly
**Symptoms**:
- Items stuck in pending status
- Wrong approver assigned
- Missing notification emails

**Solutions**:
1. **Check Routing Rules**: Verify workflow configuration
2. **Confirm User Status**: Ensure approver is active and available
3. **Review Amount Limits**: Check if amount exceeds approval authority
4. **Manual Reassign**: Use workflow management to reassign
5. **Contact Administrator**: For routing rule modifications

### Error Messages

#### "Invalid Token" or "Authentication Failed"
- **Cause**: Session expired or invalid login
- **Solution**: Logout and login again with valid credentials

#### "Insufficient Permissions"
- **Cause**: User lacks required access rights
- **Solution**: Contact administrator to review permissions

#### "File Format Not Supported"
- **Cause**: Uploaded file doesn't match expected format
- **Solution**: Check format requirements and convert file if needed

#### "Database Connection Error"
- **Cause**: System connectivity issue
- **Solution**: Wait 5 minutes and retry; contact IT if persistent

#### "Validation Failed"
- **Cause**: Data doesn't meet business rules
- **Solution**: Review error details and correct input data

### Getting Help

#### Self-Service Options
1. **System Help**: Click the "?" icon in any module
2. **User Guide**: Access this guide from the Help menu
3. **FAQ Section**: Check frequently asked questions below
4. **Video Tutorials**: Available in the Training section

#### Support Contacts
- **Level 1 Support**: help@cvs-system.com or ext. 1234
- **Technical Issues**: technical@cvs-system.com or ext. 1235
- **Training Requests**: training@cvs-system.com or ext. 1236
- **Emergency Support**: emergency@cvs-system.com or ext. 9999 (24/7)

---

## Frequently Asked Questions

### General System Questions

**Q: How often should I change my password?**
A: Passwords should be changed every 90 days. The system will prompt you when it's time to update.

**Q: Can I access the system from mobile devices?**
A: Yes, the system is mobile-responsive and works on tablets and smartphones through web browsers.

**Q: What browsers are supported?**
A: Chrome (recommended), Firefox, Safari, and Edge. Internet Explorer is not supported.

**Q: How long are user sessions active?**
A: Sessions timeout after 30 minutes of inactivity for security purposes.

### Workflow and Approvals

**Q: Why is my approval request stuck in pending?**
A: Check if the designated approver is active and available. You can also check workflow routing rules or contact the administrator.

**Q: Can I approve my own requests?**
A: No, the system prevents self-approval to maintain proper controls and audit trails.

**Q: How do I know when something needs my approval?**
A: You'll receive email notifications and see items in your dashboard's pending section.

**Q: What happens if an approver is on vacation?**
A: The system supports reassignment and delegation features. Contact your administrator to set up coverage.

### Financial Operations

**Q: How accurate is the auto-matching for bank reconciliation?**
A: The system achieves 85-90% auto-matching accuracy based on amount and date matching within defined tolerances.

**Q: Can I process refunds for any amount?**
A: Refund processing limits depend on your user role. Typically: Users ($0-$500), Supervisors ($0-$2,000), Managers (unlimited).

**Q: When do BACS refunds get processed?**
A: BACS batches run daily at 2:00 PM. The cutoff for same-day processing is 1:30 PM.

**Q: What's the difference between F&B voids and refunds?**
A: F&B voids cancel POS transactions (same-day typically), while refunds return money to guests and can be for any transaction.

### Reports and Data

**Q: How long does report generation take?**
A: Simple reports: 10-30 seconds. Complex reports with large datasets: 2-5 minutes.

**Q: Can I schedule reports to run automatically?**
A: Yes, use the Report Scheduler feature to set up recurring reports with email delivery.

**Q: How far back can I access historical data?**
A: Transaction data is available for 7 years, audit logs for 5 years, and performance data for 1 year.

**Q: Can I export data to Excel?**
A: Yes, most reports and data grids support Excel export functionality.

### Technical Issues

**Q: Why are pages loading slowly?**
A: This could be due to network connectivity, browser performance, or system load. Try refreshing, clearing cache, or using a different browser.

**Q: What should I do if I get a database error?**
A: Database errors are usually temporary. Wait 5 minutes and retry. If persistent, contact technical support.

**Q: Can I work offline?**
A: No, CVS is a web-based system requiring internet connectivity for all functions.

**Q: How do I update my notification preferences?**
A: Go to User Profile > Notification Settings to configure email and in-app notification preferences.

---

## Reference Materials

### System Requirements

#### Minimum System Requirements
- **Operating System**: Windows 10, macOS 10.14, or Linux (Ubuntu 18.04+)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Network**: Stable internet connection (5 Mbps minimum)
- **Screen Resolution**: 1024x768 minimum, 1920x1080 recommended

### File Format Specifications

#### Opera Import Files
- **Format**: Excel (.xlsx) or CSV
- **Size Limit**: 5MB maximum
- **Required Columns**: Date, Revenue Type, Amount, Description
- **Date Format**: DD/MM/YYYY or MM/DD/YYYY

#### Bank Statement Files
- **Supported Banks**: HSBC, Barclays, Lloyds, NatWest
- **Format**: CSV (preferred) or PDF
- **Size Limit**: 10MB maximum
- **Required Columns**: Date, Description, Amount, Balance

#### BACS Export Files
- **Format**: Fixed-width text file
- **Character Set**: ASCII
- **Maximum Records**: 500 per batch
- **Naming Convention**: BACS_YYYYMMDD_HHMMSS.txt

### Keyboard Shortcuts

| Shortcut | Function | Context |
|----------|----------|---------|
| Ctrl + S | Save current form | Data entry screens |
| Ctrl + Enter | Submit for approval | Workflow forms |
| F5 | Refresh page | All screens |
| Ctrl + F | Search within page | Grid views |
| Alt + D | Go to dashboard | All screens |
| Ctrl + L | Logout | All screens |
| F1 | Context help | All screens |

### Business Rules Summary

#### Approval Thresholds
- **Refunds**: $0-$500 (User), $501-$2,000 (Supervisor), $2,001+ (Manager)
- **F&B Voids**: Same day < $50 (Auto), Previous day (Manager), 2+ days (GM)
- **Bank Adjustments**: Any amount requires supervisor approval
- **Opera Corrections**: Discrepancies > $100 require manager approval

#### Processing Times
- **BACS Refunds**: Daily at 2:00 PM (cutoff 1:30 PM)
- **Opera Import**: Daily at 6:00 AM automatic, on-demand manual
- **Report Generation**: 10 seconds (simple) to 5 minutes (complex)
- **Session Timeout**: 30 minutes of inactivity

#### Data Retention
- **Transaction Records**: 7 years
- **Audit Logs**: 5 years
- **User Activity**: 1 year
- **System Logs**: 90 days
- **Report Cache**: 30 days

### Contact Information

#### Development Team
- **Project Manager**: projects@cvs-system.com
- **Technical Lead**: technical@cvs-system.com
- **UI/UX Team**: design@cvs-system.com

#### Support Team
- **Help Desk**: help@cvs-system.com | +1-800-CVS-HELP
- **Training**: training@cvs-system.com
- **Emergency Support**: emergency@cvs-system.com (24/7)

#### Business Contacts
- **Account Manager**: accounts@cvs-system.com
- **Sales Team**: sales@cvs-system.com
- **Billing Support**: billing@cvs-system.com

---

## Appendix

### Glossary

**BACS**: Bankers' Automated Clearing Services - UK electronic payment system
**CVS**: Central Verification System - This hotel revenue management system
**F&B**: Food & Beverage - Hotel restaurant and bar operations
**JWT**: JSON Web Token - Security authentication method
**Opera PMS**: Hotel property management system by Oracle
**POS**: Point of Sale - Transaction processing system
**SignalR**: Real-time communication framework
**Workflow**: Automated business process with approval stages

### Version Information

- **System Version**: 1.0.0
- **User Guide Version**: 1.0
- **Last Updated**: January 2025
- **Compatible Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Legal Notice

This user guide is proprietary information of CVS Hotel Revenue Management System. All rights reserved. No part of this guide may be reproduced or transmitted without written permission.

---

*For the most up-to-date information, please check the system's built-in help documentation or contact your system administrator.*