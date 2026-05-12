# BKPay Billing System Guide

## Overview
The Smart Parking Management System now includes an integrated **BKPay** payment system designed specifically for student parking fee management. This system automatically calculates parking fees based on usage during predetermined billing cycles and allows students to pay through the school's internal payment platform.

## How It Works

### For Students
1. **Login to System**: Students log in with their credentials
2. **View Dashboard**: Navigate to the Billing panel to see:
   - **Pending Payment**: Total amount owed for unpaid invoices
   - **Total Paid**: Historical payment records
   - **Current Rates**: Hourly parking rate for students (₫/hour)
3. **Invoice List**: See all invoices with details:
   - Invoice ID
   - Invoice Type (Monthly Parking Invoice or Parking Fee)
   - Amount due
   - Billing Period
   - Current Status (Pending, Paid, Overdue)
   - Date issued
4. **Make Payment**: Click the **"Pay via BKPay"** button on any pending invoice
5. **Confirmation**: System confirms payment and updates invoice status

### For Administrators

#### Generating Student Invoices
When ready to bill students for a period, administrators can generate invoices via:

**API Endpoint:**
```
POST /api/billing/generate-student-invoices
```

**Request Body:**
```json
{
  "period": "May 2026"  // Optional, defaults to current month
}
```

**What it does:**
- Retrieves all students (Student, Graduate, Doctoral roles)
- Calculates total parking fees from sessions during the period
- Creates "Monthly Parking Invoice" entries for each student
- Marks invoices as "Pending" with method "BKPay"
- Skips students who already have invoices for that period
- Logs the activity in activity logs

**Response:**
```json
{
  "createdInvoices": 42,
  "period": "May 2026",
  "invoices": [
    {
      "id": "INV-BKPAY-abc12345",
      "userId": "student-123",
      "userName": "Nguyen Van A",
      "type": "Monthly Parking Invoice",
      "amount": 250000,
      "period": "May 2026",
      "status": "Pending",
      "method": "BKPay",
      "sessionsCount": 15
    },
    // ... more invoices
  ]
}
```

#### Pricing Management
Update hourly parking rates for different user categories (Students, Staff, Faculty, Visitors).

**API Endpoint:**
```
PATCH /api/admin/pricing-policies/{category}
```

**Example:**
```json
{
  "hourly": 5000  // ₫ per hour for Students
}
```

### Billing Cycle Process

1. **Usage Phase**: Students park their vehicles, system tracks entry/exit sessions
2. **Calculation Phase**: System automatically calculates fees based on:
   - Duration of parking (rounded up to nearest hour)
   - Applicable hourly rate for student category
3. **Invoice Generation Phase**: 
   - Admin calls `/api/billing/generate-student-invoices`
   - System creates invoices for all students based on their usage
   - Invoices marked as "Pending" until paid
4. **Payment Phase**: 
   - Students see invoices in their dashboard
   - Click "Pay via BKPay" to initiate payment
   - System processes payment and updates invoice status to "Paid"

## API Reference

### Student Endpoints

**Get Student's Invoices**
```
GET /api/billing/student-invoices
```
Returns all invoices for the authenticated student (Pending, Paid, Overdue).

**Request Payment**
```
POST /api/payments/{transactionId}/request
```
Initiates BKPay payment for a specific invoice.

### Administrator Endpoints

**View Billing Overview**
```
GET /api/billing/overview
```
Returns:
- Total Revenue (all-time)
- Daily Revenue
- Current Month Revenue
- Pending amount (unpaid invoices)
- Overdue amount
- Pricing Plans

**View All Transactions**
```
GET /api/billing/transactions
```
Paginated/searchable list of all billing transactions.

**Reset Monthly Revenue**
```
POST /api/billing/reset-monthly
```
Clears all transactions for the current month (for testing/admin purposes).

**Generate Student Invoices**
```
POST /api/billing/generate-student-invoices
```
Creates monthly BKPay invoices for all students based on their usage.

## BKPay Webhook Integration

The system supports BKPay webhook callbacks for payment status updates:

```
POST /api/payments/bkpay/webhook
```

**Request Body:**
```json
{
  "transactionId": "INV-BKPAY-abc12345",
  "paymentStatus": "SUCCESS"  // or "FAILED"
}
```

**Response:**
```json
{
  "ok": true,
  "transactionId": "INV-BKPAY-abc12345",
  "status": "Paid"  // Updated status
}
```

## Removed Features

The following features have been removed as they were not compatible with the required billing cycle system:

- **"Run Monthly Billing Cycle"** button - Replaced with automatic invoice generation via API
- **"Reset Daily Revenue"** button - Not needed with BKPay invoice system

## Removed Backend Endpoints

- `POST /api/billing/reset-daily` - No longer needed
- `POST /api/billing/run-cycle` - Replaced with `/api/billing/generate-student-invoices`

## Benefits of BKPay Integration

1. **Automatic Calculation**: Fees calculated based on actual usage
2. **Transparent Billing**: Students see itemized invoices with session counts
3. **School Integration**: Uses BKPay (internal school payment platform)
4. **Audit Trail**: All transactions logged with timestamps and user details
5. **Flexible Cycles**: Support for any billing period (monthly, semester, etc.)
6. **Dispute Resolution**: Clear records of usage and charges

## Example Workflow

### Month: May 2026

**Week 1-4**: Students park vehicles
- System tracks each entry/exit
- Calculates fees: Duration × Hourly Rate
- Accumulates in daily/monthly totals

**Day 1 of June**: Admin generates May invoices
```bash
POST /api/billing/generate-student-invoices
Body: { "period": "May 2026" }
```

**June 1-30**: Students receive invoices
- Dashboard shows "Pending Payment" totals
- See all invoices in invoice table
- Can pay anytime via BKPay

**Payment**: Student clicks "Pay via BKPay"
- Invoice status changes to "Paid"
- Total Paid amount increases
- Pending Payment decreases

## Support

For questions or issues with BKPay integration, contact the system administrator.
