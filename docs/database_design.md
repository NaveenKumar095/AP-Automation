# PostgreSQL Database Design

## 1. Overview

The AP Automation application uses PostgreSQL as its relational database.

The database stores user accounts, vendor information, invoice records, approval decisions, and payment details.

The schema also includes Django authentication and administrative tables.

## 2. Main Application Tables

### 2.1 accounts_user

Stores application user information.

| Column       | Data Type    | Description           |
| ------------ | ------------ | --------------------- |
| id           | BIGINT       | Primary key           |
| username     | VARCHAR(150) | Unique username       |
| password     | VARCHAR(128) | Encoded password      |
| first_name   | VARCHAR(150) | First name            |
| last_name    | VARCHAR(150) | Last name             |
| email        | VARCHAR(254) | Email address         |
| is_superuser | BOOLEAN      | Superuser permission  |
| is_staff     | BOOLEAN      | Staff access          |
| is_active    | BOOLEAN      | Account status        |
| last_login   | TIMESTAMPTZ  | Last login time       |
| date_joined  | TIMESTAMPTZ  | Account creation time |

**Constraints:**

- Primary key: id
- Unique: username

### 2.2 vendors_vendor

Stores vendor and supplier information.

| Column         | Data Type    | Description           |
| -------------- | ------------ | --------------------- |
| id             | BIGINT       | Primary key           |
| vendor_code    | VARCHAR(20)  | Unique vendor code    |
| name           | VARCHAR(255) | Vendor name           |
| contact_person | VARCHAR(100) | Contact person        |
| email          | VARCHAR(254) | Vendor email          |
| phone          | VARCHAR(20)  | Contact number        |
| address        | TEXT         | Vendor address        |
| tax_id         | VARCHAR(50)  | Tax identification    |
| payment_terms  | INTEGER      | Payment terms in days |
| status         | VARCHAR(10)  | Vendor status         |
| created_at     | TIMESTAMPTZ  | Creation timestamp    |
| updated_at     | TIMESTAMPTZ  | Last update timestamp |

**Constraints:**

- Primary key: id
- Unique: vendor_code
- Check: payment_terms >= 0

### 2.3 invoices_invoice

Stores invoice details, approval information, and payment records.

| Column           | Data Type     | Description                 |
| ---------------- | ------------- | --------------------------- |
| id               | BIGINT        | Primary key                 |
| invoice_number   | VARCHAR(100)  | Invoice number              |
| invoice_date     | DATE          | Invoice date                |
| due_date         | DATE          | Payment due date            |
| description      | TEXT          | Invoice description         |
| subtotal         | NUMERIC(12,2) | Invoice subtotal            |
| tax_amount       | NUMERIC(12,2) | Tax amount                  |
| total_amount     | NUMERIC(12,2) | Total invoice amount        |
| currency         | VARCHAR(3)    | Currency code               |
| status           | VARCHAR(30)   | Invoice status              |
| invoice_file     | VARCHAR(100)  | Uploaded invoice file path  |
| created_at       | TIMESTAMPTZ   | Creation timestamp          |
| updated_at       | TIMESTAMPTZ   | Last update timestamp       |
| vendor_id        | BIGINT        | Reference to vendor         |
| approved_by_id   | BIGINT        | Reference to approving user |
| decision_at      | TIMESTAMPTZ   | Approval or rejection time  |
| rejection_reason | TEXT          | Reason for rejection        |
| payment_date     | DATE          | Payment date                |

**Constraints:**

- Primary key: id
- Foreign key: vendor_id references vendors_vendor(id)
- Foreign key: approved_by_id references accounts_user(id)
- Unique combination: vendor_id and invoice_number

## 3. Database Relationships

### Vendor and Invoice

- One vendor can have multiple invoices.
- Each invoice belongs to one vendor.
- The relationship is one-to-many.

### User and Invoice

- An application user can be associated with invoice approval decisions.
- The approved_by_id field references accounts_user(id).
- An invoice can have a nullable approving user.

## 4. Django System Tables

The database also contains Django framework tables:

- auth_group
- auth_permission
- auth_group_permissions
- accounts_user_groups
- accounts_user_user_permissions
- django_admin_log
- django_content_type
- django_migrations
- django_session

These tables support authentication, permissions, administration, migrations, and sessions.

## 5. Schema Export

The complete PostgreSQL schema is available in:

`docs/database_schema.sql`

It contains the actual table definitions, primary keys, foreign keys, indexes, and constraints exported from PostgreSQL.
