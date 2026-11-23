import { useEffect, useMemo, useState } from "react";
import { invoiceAPI, vendorAPI, authAPI } from "./api";

import {
  LayoutDashboard,
  FileText,
  Building2,
  ClipboardCheck,
  CreditCard,
  BarChart3,
  Settings,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Users,
  Wallet,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import "./App.css";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Invoices", icon: FileText },
  { label: "Vendors", icon: Building2 },
  { label: "Approvals", icon: ClipboardCheck },
  { label: "Payments", icon: CreditCard },
  { label: "Reports", icon: BarChart3 },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token")),
  );

  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [invoiceToReject, setInvoiceToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("ALL");

  const [invoiceSort, setInvoiceSort] = useState("NEWEST");

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredInvoices = invoices.filter((invoice) => {
    const search = invoiceSearch.toLowerCase();

    const matchesSearch =
      (invoice.invoice_number || "").toLowerCase().includes(search) ||
      (invoice.vendor_name || "").toLowerCase().includes(search);

    const matchesStatus =
      invoiceStatusFilter === "ALL" || invoice.status === invoiceStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (invoiceSort) {
      case "OLDEST":
        return new Date(a.invoice_date) - new Date(b.invoice_date);

      case "DUE_DATE":
        return new Date(a.due_date) - new Date(b.due_date);

      case "AMOUNT_HIGH":
        return Number(b.total_amount) - Number(a.total_amount);

      case "AMOUNT_LOW":
        return Number(a.total_amount) - Number(b.total_amount);

      case "NEWEST":
      default:
        return new Date(b.invoice_date) - new Date(a.invoice_date);
    }
  });

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false);

  const [invoiceEditOpen, setInvoiceEditOpen] = useState(false);

  const [deleteInvoiceOpen, setDeleteInvoiceOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceSaving, setInvoiceSaving] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    vendor: "",
    invoice_number: "",
    invoice_date: "",
    due_date: "",
    description: "",
    subtotal: "",
    tax_amount: "0",
    currency: "INR",
    status: "DRAFT",
  });

  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(true);

  const [error, setError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(false);

  const [form, setForm] = useState({
    vendor_code: "",
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    tax_id: "",
    payment_terms: 30,
    status: "ACTIVE",
  });

  // Fetch vendors

  async function loadVendors() {
    try {
      const data = await vendorAPI.getAll();

      setError("");
      setVendors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await authAPI.login({
        username: authForm.username,
        password: authForm.password,
      });

      localStorage.setItem("access_token", result.access);
      localStorage.setItem("refresh_token", result.refresh);

      setIsLoggedIn(true);
      setAuthForm({ username: "", email: "", password: "" });

      await loadVendors();
      await loadInvoices();
    } catch (err) {
      setAuthError(err.message || "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      await authAPI.register({
        username: authForm.username,
        email: authForm.email,
        password: authForm.password,
      });

      setAuthForm({
        username: authForm.username,
        email: "",
        password: "",
      });

      setAuthMode("login");
      setAuthError("Registration successful. Please log in.");
    } catch (err) {
      setAuthError(err.message || "Registration failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setIsLoggedIn(false);
    setActivePage("Overview");
    setAuthMode("login");
    setAuthError("");
    setAuthForm({
      username: "",
      email: "",
      password: "",
    });

    setInvoices([]);
    setVendors([]);
  }

  // Fetch invoices
  async function loadInvoices() {
    try {
      const data = await invoiceAPI.getAll();

      setInvoiceError("");
      setInvoices(data);
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setInvoiceLoading(false);
    }
  }

  async function handleCreateInvoice(event) {
    event.preventDefault();

    setInvoiceSaving(true);
    setInvoiceError("");

    try {
      const invoiceData = {
        ...invoiceForm,
        vendor: Number(invoiceForm.vendor),
        subtotal: Number(invoiceForm.subtotal),
        tax_amount: Number(invoiceForm.tax_amount),
        total_amount: invoiceTotal,
      };

      const createdInvoice = await invoiceAPI.create(invoiceData);

      setInvoices((current) => [createdInvoice, ...current]);

      setInvoiceDialogOpen(false);

      setInvoiceForm({
        vendor: "",
        invoice_number: "",
        invoice_date: "",
        due_date: "",
        description: "",
        subtotal: "",
        tax_amount: "0",
        currency: "INR",
        status: "DRAFT",
      });
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setInvoiceSaving(false);
    }
  }

  function handleEditInvoice(invoice) {
    setEditingInvoiceId(invoice.id);

    setInvoiceForm({
      vendor: String(invoice.vendor),
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      description: invoice.description || "",
      subtotal: String(invoice.subtotal),
      tax_amount: String(invoice.tax_amount),
      currency: invoice.currency,
      status: invoice.status,
    });

    setInvoiceEditOpen(true);
  }

  async function handleUpdateInvoice(event) {
    event.preventDefault();

    setInvoiceSaving(true);
    setInvoiceError("");

    try {
      const invoiceData = {
        ...invoiceForm,
        vendor: Number(invoiceForm.vendor),
        subtotal: Number(invoiceForm.subtotal),
        tax_amount: Number(invoiceForm.tax_amount),
        total_amount: invoiceTotal,
      };

      const updatedInvoice = await invoiceAPI.update(
        editingInvoiceId,
        invoiceData,
      );

      setInvoices((current) =>
        current.map((invoice) =>
          invoice.id === editingInvoiceId ? updatedInvoice : invoice,
        ),
      );

      setInvoiceEditOpen(false);
      setEditingInvoiceId(null);
      setSelectedInvoice(null);
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setInvoiceSaving(false);
    }
  }

  async function handleDeleteInvoice() {
    if (!deletingInvoice) return;

    setDeleteLoading(true);

    try {
      await invoiceAPI.remove(deletingInvoice.id);

      setInvoices((current) =>
        current.filter((invoice) => invoice.id !== deletingInvoice.id),
      );

      setDeleteInvoiceOpen(false);
      setDeletingInvoice(null);
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleApproveInvoice(invoice) {
    try {
      await invoiceAPI.approve(invoice.id);
      await loadInvoices();
      setInvoiceError("");
    } catch (err) {
      setInvoiceError(err.message);
    }
  }

  function handleRejectInvoice(invoice) {
    setInvoiceToReject(invoice);
    setRejectionReason("");
    setRejectDialogOpen(true);
  }

  async function confirmRejectInvoice() {
    if (!invoiceToReject || !rejectionReason.trim()) {
      setInvoiceError("Please enter a rejection reason.");
      return;
    }

    try {
      setRejectLoading(true);

      await invoiceAPI.reject(invoiceToReject.id, rejectionReason.trim());

      await loadInvoices();

      setRejectDialogOpen(false);
      setInvoiceToReject(null);
      setRejectionReason("");
      setInvoiceError("");
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setRejectLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return;

    const task = window.setTimeout(() => {
      loadVendors();
      loadInvoices();
    }, 0);

    return () => window.clearTimeout(task);
  }, [isLoggedIn]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const query = search.toLowerCase();

      const matchesSearch = [
        vendor.vendor_code,
        vendor.name,
        vendor.email,
        vendor.contact_person,
      ].some((value) => value?.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" || vendor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  // Vendor form reset
  function resetVendorForm() {
    setForm({
      vendor_code: "",
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      tax_id: "",
      payment_terms: 30,
      status: "ACTIVE",
    });

    setEditingVendor(null);
  }

  // Add or update vendor

  async function handleAddVendor(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const dataToSave = {
        ...form,
        payment_terms: Number(form.payment_terms),
      };

      const data = editingVendor
        ? await vendorAPI.update(editingVendor.id, dataToSave)
        : await vendorAPI.create(dataToSave);

      if (editingVendor) {
        setVendors((current) =>
          current.map((vendor) =>
            vendor.id === editingVendor.id ? data : vendor,
          ),
        );
      } else {
        setVendors((current) => [data, ...current]);
      }

      setDialogOpen(false);
      resetVendorForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Edit vendor
  function handleEditVendor(vendor) {
    setEditingVendor(vendor);

    setForm({
      vendor_code: vendor.vendor_code,
      name: vendor.name,
      contact_person: vendor.contact_person || "",
      email: vendor.email,
      phone: vendor.phone || "",
      address: vendor.address || "",
      tax_id: vendor.tax_id || "",
      payment_terms: vendor.payment_terms,
      status: vendor.status,
    });

    setDialogOpen(true);
  }

  // Delete vendor

  async function handleDeleteVendor(vendor) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vendor.name}?`,
    );

    if (!confirmed) return;

    setDeletingVendor(true);

    try {
      await vendorAPI.remove(vendor.id);

      setVendors((current) => current.filter((item) => item.id !== vendor.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingVendor(false);
    }
  }

  const activeCount = vendors.filter(
    (vendor) => vendor.status === "ACTIVE",
  ).length;

  const totalInvoiceAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total_amount || 0),
    0,
  );

  const pendingApprovalCount = invoices.filter(
    (invoice) => invoice.status === "PENDING_APPROVAL",
  ).length;

  const overdueInvoiceCount = invoices.filter(
    (invoice) =>
      invoice.status !== "PAID" &&
      invoice.status !== "REJECTED" &&
      new Date(invoice.due_date) < new Date() &&
      invoice.status !== "DRAFT",
  ).length;

  const invoiceTotal =
    Number(invoiceForm.subtotal || 0) + Number(invoiceForm.tax_amount || 0);

  const pageDescription = {
    Overview: "Monitor your accounts payable operations.",
    Invoices: "Track, create and manage your invoices.",
    Vendors: "Manage your suppliers and vendor information.",
    Approvals: "Review invoices awaiting approval.",
    Payments: "Monitor and track supplier payments.",
    Reports: "Review your accounts payable performance.",
  };

  const pageEyebrow = {
    Overview: "FINANCE WORKSPACE",
    Invoices: "INVOICE MANAGEMENT",
    Vendors: "SUPPLIER MANAGEMENT",
    Approvals: "APPROVAL WORKFLOW",
    Payments: "PAYMENT MANAGEMENT",
    Reports: "FINANCIAL REPORTING",
  };

  // Show login or registration when the user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <h1>APFlow</h1>
        <p>Accounts Payable Automation</p>

        {authMode === "login" ? (
          <form onSubmit={handleLogin}>
            <h2>Welcome Back</h2>

            <input
              type="text"
              placeholder="Username"
              value={authForm.username}
              onChange={(e) =>
                setAuthForm({ ...authForm, username: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
              required
            />

            <button type="submit" disabled={authLoading}>
              {authLoading ? "Logging in..." : "Login"}
            </button>

            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
              >
                Register
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2>Create Account</h2>

            <input
              type="text"
              placeholder="Username"
              value={authForm.username}
              onChange={(e) =>
                setAuthForm({ ...authForm, username: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) =>
                setAuthForm({ ...authForm, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
              minLength={8}
              required
            />

            <button type="submit" disabled={authLoading}>
              {authLoading ? "Creating account..." : "Register"}
            </button>

            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
              >
                Login
              </button>
            </p>
          </form>
        )}

        {authError && <p role="alert">{authError}</p>}
      </div>
    );
  }

  // Existing dashboard
  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <h2>apflow</h2>
            <span>FINANCE WORKSPACE</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>

              {label === "Approvals" && (
                <span className="nav-count">
                  {
                    invoices.filter(
                      (invoice) => invoice.status === "PENDING_APPROVAL",
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div
            className="profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <Avatar>
              <AvatarFallback>NK</AvatarFallback>
            </Avatar>

            <div className="profile-info">
              <strong>Admin User</strong>
              <span>Administrator</span>
            </div>

            <ChevronDown size={16} />

            {showProfileMenu && (
              <div className="profile-dropdown">
                <strong>Admin User</strong>
                <span>Administrator</span>
                <hr />
                <p>Workspace: AP Automation</p>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleLogout();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Finance Workspace <span>/</span> {activePage}
          </div>

          <div className="topbar-actions">
            <span className="environment">● Development workspace</span>

            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={19} />
              <i />
            </button>

            {showNotifications && (
              <div className="notification-panel">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                  >
                    ×
                  </button>
                </div>

                <div className="notification-content">
                  <div className="notification-item">
                    <strong>Pending approvals</strong>
                    <p>
                      {
                        invoices.filter(
                          (invoice) => invoice.status === "PENDING_APPROVAL",
                        ).length
                      }{" "}
                      invoice(s) awaiting review.
                    </p>
                  </div>

                  <div className="notification-item">
                    <strong>Overdue invoices</strong>
                    <p>
                      {
                        invoices.filter(
                          (invoice) =>
                            invoice.status !== "PAID" &&
                            invoice.status !== "REJECTED" &&
                            invoice.status !== "DRAFT" &&
                            new Date(invoice.due_date) < new Date(),
                        ).length
                      }{" "}
                      overdue invoice(s).
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Avatar className="top-avatar">
              <AvatarFallback>NK</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="page-content">
          {/* Page heading */}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {pageEyebrow[activePage] || "FINANCE WORKSPACE"}
              </div>

              <h1>{activePage}</h1>

              <p>
                {pageDescription[activePage] ||
                  "Manage your workspace settings."}
              </p>
            </div>

            {/* Add vendor button only on Vendors page */}
            {activePage === "Vendors" && (
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetVendorForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="add-button">
                    <Plus size={17} />
                    Add vendor
                  </Button>
                </DialogTrigger>

                <DialogContent className="vendor-dialog">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVendor ? "Edit vendor" : "Add a new vendor"}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleAddVendor} className="vendor-form">
                    {[
                      ["vendor_code", "Vendor code"],
                      ["name", "Company name"],
                      ["contact_person", "Contact person"],
                      ["email", "Email address"],
                      ["phone", "Phone number"],
                      ["address", "Address"],
                      ["tax_id", "Tax identification number"],
                      ["payment_terms", "Payment terms (days)"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}

                        <Input
                          required={
                            !["contact_person", "phone", "tax_id"].includes(key)
                          }
                          type={
                            key === "email"
                              ? "email"
                              : key === "payment_terms"
                                ? "number"
                                : "text"
                          }
                          min={key === "payment_terms" ? 0 : undefined}
                          value={form[key]}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              [key]: event.target.value,
                            })
                          }
                        />
                      </label>
                    ))}

                    <label>
                      Status
                      <select
                        value={form.status}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            status: event.target.value,
                          })
                        }
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </label>

                    {error && <p className="form-error">{error}</p>}

                    <Button type="submit" disabled={saving}>
                      {saving
                        ? "Saving..."
                        : editingVendor
                          ? "Update vendor"
                          : "Save vendor"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* OVERVIEW PAGE */}
          {activePage === "Overview" && (
            <>
              <div className="stats-grid">
                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Total vendors</span>
                      <Users size={19} />
                    </div>
                    <div className="stat-value">{vendors.length}</div>
                    <div className="stat-foot">Registered suppliers</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Total invoices</span>
                      <FileText size={19} />
                    </div>
                    <div className="stat-value">{invoices.length}</div>
                    <div className="stat-foot">Recorded invoices</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Active vendors</span>
                      <CheckCircle2 size={19} />
                    </div>
                    <div className="stat-value">{activeCount}</div>
                    <div className="stat-foot">Currently active</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Invoice value</span>
                      <Wallet size={19} />
                    </div>
                    <div className="stat-value">
                      ₹{totalInvoiceAmount.toLocaleString("en-IN")}
                    </div>
                    <div className="stat-foot">Total recorded value</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Pending approvals</span>
                      <FileText size={19} />
                    </div>
                    <div className="stat-value">{pendingApprovalCount}</div>
                    <div className="stat-foot">Awaiting approval</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Overdue invoices</span>
                      <Wallet size={19} />
                    </div>
                    <div className="stat-value">{overdueInvoiceCount}</div>
                    <div className="stat-foot">Past due date</div>
                  </CardContent>
                </Card>
              </div>

              <section className="vendor-section">
                <div className="section-heading">
                  <div>
                    <h2>Recent invoices</h2>
                    <p>Your latest recorded invoices.</p>
                  </div>

                  <Badge variant="secondary">{invoices.length} invoices</Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>INVOICE</TableHead>
                      <TableHead>VENDOR</TableHead>
                      <TableHead>AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {invoices.slice(0, 5).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.vendor_name}</TableCell>
                        <TableCell>
                          ₹
                          {Number(invoice.total_amount).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge>{invoice.status}</Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setInvoiceDetailsOpen(true);
                              }}
                            >
                              View
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditInvoice(invoice)}
                            >
                              Edit
                            </Button>

                            {invoice.status === "DRAFT" && (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await invoiceAPI.submit(invoice.id);
                                    await loadInvoices();
                                    setInvoiceError("");
                                  } catch (err) {
                                    setInvoiceError(err.message);
                                  }
                                }}
                              >
                                Submit
                              </Button>
                            )}

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeletingInvoice(invoice);
                                setDeleteInvoiceOpen(true);
                              }}
                            >
                              Delete
                            </Button>

                            {invoice.status === "PENDING_APPROVAL" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveInvoice(invoice)}
                                >
                                  Approve
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectInvoice(invoice)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!invoiceLoading && invoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          No invoices recorded yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </section>
            </>
          )}

          {/* VENDORS PAGE */}
          {activePage === "Vendors" && (
            <>
              <div className="stats-grid">
                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Total vendors</span>
                      <Users size={19} />
                    </div>
                    <div className="stat-value">{vendors.length}</div>
                    <div className="stat-foot">Registered suppliers</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Active vendors</span>
                      <CheckCircle2 size={19} />
                    </div>
                    <div className="stat-value">{activeCount}</div>
                    <div className="stat-foot">Currently active</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Inactive vendors</span>
                      <Clock3 size={19} />
                    </div>
                    <div className="stat-value">
                      {vendors.length - activeCount}
                    </div>
                    <div className="stat-foot">Not currently active</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">
                      <span>Payment terms</span>
                      <Wallet size={19} />
                    </div>
                    <div className="stat-value">
                      {vendors.length
                        ? Math.round(
                            vendors.reduce(
                              (sum, vendor) => sum + vendor.payment_terms,
                              0,
                            ) / vendors.length,
                          )
                        : 0}
                      <small> days</small>
                    </div>
                    <div className="stat-foot">Average payment period</div>
                  </CardContent>
                </Card>
              </div>

              <section className="vendor-section">
                <div className="section-heading">
                  <div>
                    <h2>All vendors</h2>
                    <p>View and manage your registered suppliers.</p>
                  </div>

                  <Badge variant="secondary">{vendors.length} vendors</Badge>
                </div>

                <div className="table-toolbar">
                  <div className="search-box">
                    <Search size={17} />

                    <Input
                      placeholder="Search vendors..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="ALL">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>

                  <Button variant="outline" onClick={loadVendors}>
                    Refresh
                  </Button>
                </div>

                {error && <p className="form-error">{error}</p>}

                <div className="table-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>VENDOR</TableHead>
                        <TableHead>CONTACT</TableHead>
                        <TableHead>EMAIL</TableHead>
                        <TableHead>PAYMENT TERMS</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead className="text-right">DETAILS</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="empty-state">
                            Loading vendors...
                          </TableCell>
                        </TableRow>
                      ) : filteredVendors.length ? (
                        filteredVendors.map((vendor) => (
                          <TableRow key={vendor.id}>
                            <TableCell>
                              <div className="vendor-name">
                                <div className="vendor-avatar">
                                  {vendor.name?.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                  <strong>{vendor.name}</strong>
                                  <span>{vendor.vendor_code}</span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              {vendor.contact_person || "—"}
                            </TableCell>

                            <TableCell>{vendor.email}</TableCell>

                            <TableCell>{vendor.payment_terms} days</TableCell>

                            <TableCell>
                              <Badge
                                className={
                                  vendor.status === "ACTIVE"
                                    ? "status-active"
                                    : "status-inactive"
                                }
                              >
                                {vendor.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditVendor(vendor)}
                                >
                                  Edit
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingVendor}
                                  onClick={() => handleDeleteVendor(vendor)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="empty-state">
                            No vendors found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="table-footer">
                  Showing {filteredVendors.length} of {vendors.length} vendors
                </div>
              </section>
            </>
          )}

          {/* INVOICES PAGE */}
          {activePage === "Invoices" && (
            <section className="vendor-section">
              <div className="section-heading">
                <div>
                  <h2>All invoices</h2>
                  <p>View your recorded supplier invoices.</p>
                </div>

                <div className="section-actions">
                  <Badge variant="secondary">{invoices.length} invoices</Badge>

                  <Button onClick={() => setInvoiceDialogOpen(true)}>
                    <Plus size={16} />
                    Create invoice
                  </Button>
                </div>
              </div>

              {invoiceError && <p className="form-error">{invoiceError}</p>}

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Input
                  placeholder="Search by invoice number or vendor..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="max-w-sm"
                />

                <Select
                  value={invoiceStatusFilter}
                  onValueChange={setInvoiceStatusFilter}
                >
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">
                      Pending Approval
                    </SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={invoiceSort} onValueChange={setInvoiceSort}>
                  <SelectTrigger className="w-47.5">
                    <SelectValue placeholder="Sort invoices" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="NEWEST">Newest first</SelectItem>
                    <SelectItem value="OLDEST">Oldest first</SelectItem>
                    <SelectItem value="DUE_DATE">
                      Due date (earliest)
                    </SelectItem>
                    <SelectItem value="AMOUNT_HIGH">
                      Amount (highest)
                    </SelectItem>
                    <SelectItem value="AMOUNT_LOW">Amount (lowest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="table-container">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>INVOICE NUMBER</TableHead>
                      <TableHead>VENDOR</TableHead>
                      <TableHead>INVOICE DATE</TableHead>
                      <TableHead>DUE DATE</TableHead>
                      <TableHead>AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {invoiceLoading ? (
                      <TableRow>
                        <TableCell colSpan={6}>Loading invoices...</TableCell>
                      </TableRow>
                    ) : filteredInvoices.length ? (
                      sortedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.vendor_name}</TableCell>
                          <TableCell>{invoice.invoice_date}</TableCell>
                          <TableCell>{invoice.due_date}</TableCell>
                          <TableCell>
                            {invoice.currency}{" "}
                            {Number(invoice.total_amount).toLocaleString(
                              "en-IN",
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge>{invoice.status}</Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setInvoiceDetailsOpen(true);
                                }}
                              >
                                View
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditInvoice(invoice)}
                              >
                                Edit
                              </Button>

                              {invoice.status === "DRAFT" && (
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await invoiceAPI.submit(invoice.id);
                                      await loadInvoices();
                                      setInvoiceError("");
                                    } catch (err) {
                                      setInvoiceError(err.message);
                                    }
                                  }}
                                >
                                  Submit
                                </Button>
                              )}

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setDeletingInvoice(invoice);
                                  setDeleteInvoiceOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                              {invoice.status === "PENDING_APPROVAL" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApproveInvoice(invoice)
                                    }
                                  >
                                    Approve
                                  </Button>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectInvoice(invoice)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="empty-state">
                          No invoices found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="table-footer">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </div>
            </section>
          )}

          {activePage === "Invoices" && (
            <Dialog
              open={invoiceDialogOpen}
              onOpenChange={setInvoiceDialogOpen}
            >
              <DialogContent className="invoice-dialog">
                <DialogHeader>
                  <DialogTitle>Create invoice</DialogTitle>
                  <DialogDescription>
                    Enter the supplier invoice details below.
                  </DialogDescription>
                </DialogHeader>

                <form
                  id="invoice-create-form"
                  onSubmit={handleCreateInvoice}
                  className="invoice-form"
                >
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Vendor</label>
                      <select
                        required
                        value={invoiceForm.vendor}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            vendor: e.target.value,
                          })
                        }
                      >
                        <option value="">Select vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Invoice number</label>
                      <Input
                        required
                        value={invoiceForm.invoice_number}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            invoice_number: e.target.value,
                          })
                        }
                        placeholder="e.g. INV-2026-001"
                      />
                    </div>

                    <div className="form-field">
                      <label>Invoice date</label>
                      <Input
                        required
                        type="date"
                        value={invoiceForm.invoice_date}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            invoice_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Due date</label>
                      <Input
                        required
                        type="date"
                        min={invoiceForm.invoice_date || undefined}
                        value={invoiceForm.due_date}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            due_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-field full-width">
                      <label>Description</label>
                      <Input
                        value={invoiceForm.description}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Invoice description"
                      />
                    </div>

                    <div className="form-field">
                      <label>Subtotal</label>
                      <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoiceForm.subtotal}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            subtotal: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Tax amount</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoiceForm.tax_amount}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            tax_amount: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Currency</label>
                      <select
                        value={invoiceForm.currency}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            currency: e.target.value,
                          })
                        }
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Status</label>
                      <select
                        value={invoiceForm.status}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="PENDING_APPROVAL">
                          Pending Approval
                        </option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                    </div>
                  </div>

                  <div className="invoice-total-preview">
                    <span>Total amount</span>
                    <strong>
                      {invoiceForm.currency} {invoiceTotal.toFixed(2)}
                    </strong>
                  </div>

                  {invoiceError && <p className="form-error">{invoiceError}</p>}
                </form>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInvoiceDialogOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="invoice-create-form"
                    disabled={invoiceSaving}
                  >
                    {invoiceSaving ? "Saving..." : "Save invoice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={invoiceEditOpen} onOpenChange={setInvoiceEditOpen}>
            <DialogContent className="invoice-dialog">
              <DialogHeader>
                <DialogTitle>Edit invoice</DialogTitle>
                <DialogDescription>
                  Update the existing invoice details.
                </DialogDescription>
              </DialogHeader>

              <form
                id="invoice-edit-form"
                onSubmit={handleUpdateInvoice}
                className="invoice-form"
              >
                <div className="form-grid">
                  <div className="form-field">
                    <label>Vendor</label>
                    <select
                      required
                      value={invoiceForm.vendor}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          vendor: e.target.value,
                        })
                      }
                    >
                      <option value="">Select vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Invoice number</label>
                    <Input
                      required
                      value={invoiceForm.invoice_number}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          invoice_number: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Invoice date</label>
                    <Input
                      required
                      type="date"
                      value={invoiceForm.invoice_date}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          invoice_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Due date</label>
                    <Input
                      required
                      type="date"
                      min={invoiceForm.invoice_date || undefined}
                      value={invoiceForm.due_date}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          due_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Description</label>
                    <Input
                      value={invoiceForm.description}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Subtotal</label>
                    <Input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceForm.subtotal}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          subtotal: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Tax amount</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceForm.tax_amount}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          tax_amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Currency</label>
                    <select
                      value={invoiceForm.currency}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          currency: e.target.value,
                        })
                      }
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Status</label>
                    <select
                      value={invoiceForm.status}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="invoice-total-preview">
                  <span>Updated total amount</span>
                  <strong>
                    {invoiceForm.currency} {invoiceTotal.toFixed(2)}
                  </strong>
                </div>

                {invoiceError && <p className="form-error">{invoiceError}</p>}
              </form>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInvoiceEditOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  form="invoice-edit-form"
                  disabled={invoiceSaving}
                >
                  {invoiceSaving ? "Updating..." : "Update invoice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={rejectDialogOpen}
            onOpenChange={(open) => {
              setRejectDialogOpen(open);
              if (!open) {
                setInvoiceToReject(null);
                setRejectionReason("");
                setInvoiceError("");
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject invoice?</DialogTitle>
                <DialogDescription>
                  Enter a reason for rejecting invoice{" "}
                  <strong>{invoiceToReject?.invoice_number}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="form-field">
                <label htmlFor="rejection-reason">Rejection reason</label>
                <textarea
                  id="rejection-reason"
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this invoice is being rejected..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {invoiceError && <p className="form-error">{invoiceError}</p>}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={rejectLoading}
                  onClick={() => setRejectDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={rejectLoading || !rejectionReason.trim()}
                  onClick={confirmRejectInvoice}
                >
                  {rejectLoading ? "Rejecting..." : "Confirm rejection"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={invoiceDetailsOpen}
            onOpenChange={setInvoiceDetailsOpen}
          >
            <DialogContent className="invoice-dialog invoice-details-dialog">
              <DialogHeader>
                <DialogTitle>Invoice details</DialogTitle>
                <DialogDescription>
                  Complete information about this invoice.
                </DialogDescription>
              </DialogHeader>

              {selectedInvoice && (
                <div className="invoice-details">
                  <div className="invoice-detail-item">
                    <span>Invoice number</span>
                    <strong>{selectedInvoice.invoice_number}</strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Vendor</span>
                    <strong>{selectedInvoice.vendor_name}</strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Invoice date</span>
                    <strong>{selectedInvoice.invoice_date}</strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Due date</span>
                    <strong>{selectedInvoice.due_date}</strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Description</span>
                    <strong>{selectedInvoice.description || "—"}</strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Subtotal</span>
                    <strong>
                      {selectedInvoice.currency}{" "}
                      {Number(selectedInvoice.subtotal).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Tax amount</span>
                    <strong>
                      {selectedInvoice.currency}{" "}
                      {Number(selectedInvoice.tax_amount).toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Total amount</span>
                    <strong>
                      {selectedInvoice.currency}{" "}
                      {Number(selectedInvoice.total_amount).toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Status</span>
                    <strong>{selectedInvoice.status}</strong>
                  </div>
                  {selectedInvoice.rejection_reason && (
                    <div className="invoice-detail-item">
                      <span>Rejection reason</span>
                      <strong>{selectedInvoice.rejection_reason}</strong>
                    </div>
                  )}

                  {selectedInvoice.decision_at && (
                    <div className="invoice-detail-item">
                      <span>Decision date</span>
                      <strong>
                        {new Date(selectedInvoice.decision_at).toLocaleString()}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInvoiceDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteInvoiceOpen}
            onOpenChange={(open) => {
              setDeleteInvoiceOpen(open);
              if (!open) setDeletingInvoice(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete invoice?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete invoice{" "}
                  <strong>{deletingInvoice?.invoice_number}</strong>? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setDeleteInvoiceOpen(false);
                    setDeletingInvoice(null);
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleDeleteInvoice}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete invoice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {activePage === "Approvals" && (
            <section className="vendor-section">
              <div className="section-heading">
                <div>
                  <h2>Pending approvals</h2>
                  <p>Review and process invoices awaiting approval.</p>
                </div>
                <Badge variant="secondary">
                  {
                    invoices.filter(
                      (invoice) => invoice.status === "PENDING_APPROVAL",
                    ).length
                  }{" "}
                  pending
                </Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>INVOICE</TableHead>
                    <TableHead>VENDOR</TableHead>
                    <TableHead>INVOICE DATE</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {invoices
                    .filter((invoice) => invoice.status === "PENDING_APPROVAL")
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.vendor_name}</TableCell>
                        <TableCell>{invoice.invoice_date}</TableCell>
                        <TableCell>
                          {invoice.currency}{" "}
                          {Number(invoice.total_amount).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveInvoice(invoice)}
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectInvoice(invoice)}
                            >
                              Reject
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setInvoiceDetailsOpen(true);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                  {invoices.filter(
                    (invoice) => invoice.status === "PENDING_APPROVAL",
                  ).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="empty-state">
                        No invoices are awaiting approval.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </section>
          )}

          {/* PAYMENTS PAGE */}
          {activePage === "Payments" && (
            <section className="vendor-section">
              <div className="section-heading">
                <div>
                  <h2>Payments</h2>
                  <p>Track and manage supplier payments.</p>
                </div>
                <Badge variant="secondary">
                  {
                    invoices.filter((invoice) => invoice.status === "APPROVED")
                      .length
                  }{" "}
                  awaiting payment
                </Badge>
              </div>

              <h3>Approved invoices — Awaiting payment</h3>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>INVOICE</TableHead>
                    <TableHead>VENDOR</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>DUE DATE</TableHead>
                    <TableHead>ACTION</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {invoices
                    .filter((invoice) => invoice.status === "APPROVED")
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.vendor_name}</TableCell>
                        <TableCell>
                          {invoice.currency}{" "}
                          {Number(invoice.total_amount).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>{invoice.due_date}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await invoiceAPI.pay(invoice.id);
                                await loadInvoices();
                                setInvoiceError("");
                              } catch (err) {
                                setInvoiceError(err.message);
                              }
                            }}
                          >
                            Mark as Paid
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                  {invoices.filter((invoice) => invoice.status === "APPROVED")
                    .length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="empty-state">
                        No approved invoices awaiting payment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="section-heading" style={{ marginTop: "32px" }}>
                <div>
                  <h3>Payment history</h3>
                  <p>Invoices that have already been paid.</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>INVOICE</TableHead>
                    <TableHead>VENDOR</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>PAYMENT DATE</TableHead>
                    <TableHead>STATUS</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {invoices
                    .filter((invoice) => invoice.status === "PAID")
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.vendor_name}</TableCell>
                        <TableCell>
                          {invoice.currency}{" "}
                          {Number(invoice.total_amount).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>{invoice.payment_date || "—"}</TableCell>
                        <TableCell>
                          <Badge>{invoice.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}

                  {invoices.filter((invoice) => invoice.status === "PAID")
                    .length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="empty-state">
                        No payments recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </section>
          )}

          {/* REPORTS PAGE */}

          {activePage === "Reports" && (
            <>
              <div className="stats-grid">
                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">Total invoices</div>
                    <div className="stat-value">{invoices.length}</div>
                    <div className="stat-foot">All recorded invoices</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">Total invoice value</div>
                    <div className="stat-value">
                      ₹
                      {invoices
                        .reduce(
                          (sum, inv) => sum + Number(inv.total_amount || 0),
                          0,
                        )
                        .toLocaleString("en-IN")}
                    </div>
                    <div className="stat-foot">Total recorded amount</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">Paid invoices</div>
                    <div className="stat-value">
                      {invoices.filter((inv) => inv.status === "PAID").length}
                    </div>
                    <div className="stat-foot">Successfully paid</div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent>
                    <div className="stat-top">Pending approvals</div>
                    <div className="stat-value">
                      {
                        invoices.filter(
                          (inv) => inv.status === "PENDING_APPROVAL",
                        ).length
                      }
                    </div>
                    <div className="stat-foot">Awaiting review</div>
                  </CardContent>
                </Card>
              </div>

              <section className="vendor-section">
                <div className="section-heading">
                  <div>
                    <h2>Invoice status summary</h2>
                    <p>Breakdown of invoices by current status.</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STATUS</TableHead>
                      <TableHead>INVOICE COUNT</TableHead>
                      <TableHead>TOTAL VALUE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      "DRAFT",
                      "PENDING_APPROVAL",
                      "APPROVED",
                      "REJECTED",
                      "PAID",
                      "OVERDUE",
                    ].map((status) => {
                      const items = invoices.filter(
                        (inv) => inv.status === status,
                      );
                      const amount = items.reduce(
                        (sum, inv) => sum + Number(inv.total_amount || 0),
                        0,
                      );

                      return (
                        <TableRow key={status}>
                          <TableCell>
                            <Badge>{status}</Badge>
                          </TableCell>
                          <TableCell>{items.length}</TableCell>
                          <TableCell>
                            ₹{amount.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </section>
            </>
          )}

          {/* SETTINGS PAGE */}
          {activePage === "Settings" && (
            <section className="vendor-section">
              <div className="section-heading">
                <div>
                  <h2>Settings</h2>
                  <p>Workspace information and application preferences.</p>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Workspace</h3>
                  <p>Application name</p>
                  <strong>AP Automation</strong>
                </div>

                <div className="settings-card">
                  <h3>Invoice Preferences</h3>
                  <p>Default currency</p>
                  <strong>INR (₹)</strong>
                </div>

                <div className="settings-card">
                  <h3>Approval Workflow</h3>
                  <p>Invoice processing stages</p>
                  <strong>
                    Draft → Pending Approval → Approved / Rejected → Paid
                  </strong>
                </div>

                <div className="settings-card">
                  <h3>About</h3>
                  <p>Developed for</p>
                  <strong>Templegate Technologies</strong>
                  <p>Accounts Payable Automation</p>
                </div>
              </div>
            </section>
          )}

          <footer className="page-footer">
            APFlow <span>•</span> Accounts Payable Workspace
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
