# APFlow – Accounts Payable Automation

## Project Overview

APFlow is a web-based Accounts Payable (AP) Automation system developed to manage supplier invoices and streamline the accounts payable workflow.

The application provides a centralized workspace for managing vendors, recording invoices, submitting invoices for approval, processing approvals and rejections, tracking payments, and viewing financial reports.

## Technologies Used

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend

- Python 3.12
- Django
- Django REST Framework
- PostgreSQL

## Features

### 1. Dashboard

- Total vendor count
- Total invoice count
- Active vendor count
- Total invoice value
- Pending approval and overdue invoice summaries
- Recent invoice overview

### 2. Vendor Management

- Create vendors
- View vendor details
- Update vendor information
- Delete vendors
- Track active vendors

### 3. Invoice Management

- Create and manage invoices
- Associate invoices with vendors
- Record invoice number, dates, description, subtotal, tax, currency, and total
- Search invoices by invoice number or vendor
- Filter invoices by status
- Sort invoices by date and amount
- View invoice details
- Edit and delete eligible invoices

### 4. Invoice Approval Workflow

- Submit draft invoices for approval
- Display pending approval invoices
- Approve invoices
- Reject invoices with a mandatory rejection reason
- Record decision timestamps
- Track approval and rejection information

### 5. Payment Management

- View approved invoices awaiting payment
- Mark invoices as paid
- Record payment dates
- View payment history

### 6. Financial Reports

- Total invoice count
- Total invoice value
- Paid invoice count
- Pending approval count
- Invoice status summary
- Invoice count and total value by status

## Project Structure

```text
AP-Automation/
│
├── backend/
│   ├── accounts/
│   ├── config/
│   ├── invoices/
│   ├── vendors/
│   ├── manage.py
│   ├── .env
│   └── venv/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3.12
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AP-Automation
```

### 2. Backend Setup

Open a terminal:

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install django djangorestframework psycopg django-cors-headers python-dotenv
```

Configure the PostgreSQL database and environment variables in `backend/.env`, using the variable names expected by the Django settings.

Apply migrations:

```powershell
python manage.py migrate
```

Run the backend:

```powershell
python manage.py runserver
```

Backend URL:

`http://127.0.0.1:8000/`

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5173/`

## API Endpoints

| Method | Endpoint                      | Purpose          |
| ------ | ----------------------------- | ---------------- |
| GET    | `/api/vendors/`               | List vendors     |
| POST   | `/api/vendors/`               | Create vendor    |
| GET    | `/api/invoices/`              | List invoices    |
| POST   | `/api/invoices/`              | Create invoice   |
| GET    | `/api/invoices/{id}/`         | Retrieve invoice |
| PATCH  | `/api/invoices/{id}/`         | Update invoice   |
| DELETE | `/api/invoices/{id}/`         | Delete invoice   |
| POST   | `/api/invoices/{id}/submit/`  | Submit invoice   |
| POST   | `/api/invoices/{id}/approve/` | Approve invoice  |
| POST   | `/api/invoices/{id}/reject/`  | Reject invoice   |

## Testing

Run Django system checks:

```powershell
python manage.py check
```

Check for missing migrations:

```powershell
python manage.py makemigrations --check
```

Run backend tests:

```powershell
python manage.py test invoices
```

Build the frontend for production:

```powershell
cd frontend
npm run build
```

## Development Status

The application has been implemented and tested locally.

- Django system checks completed successfully.
- Database migrations applied successfully.
- Two invoice API tests passed.
- Frontend production build completed successfully.
- Invoice creation, management, approval, rejection, payment tracking, and reporting workflows tested locally.

## Security Notes

- Store database credentials and secret keys in environment variables.
- Never commit `.env` files or expose database passwords.
- Configure authentication and role-based permissions before production deployment.
- Review API permissions, file upload validation, and deployment settings before using real financial data.

**Note:** This project is a development implementation and requires additional security hardening before production use.

## Conclusion

APFlow provides a centralized Accounts Payable workspace that helps manage supplier information, invoice processing, approval decisions, payment tracking, and financial reporting through a web-based application.
