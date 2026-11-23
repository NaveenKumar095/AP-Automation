from django.db import models
from django.conf import settings


class Invoice(models.Model):

    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("PENDING_APPROVAL", "Pending Approval"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("PAID", "Paid"),
        ("OVERDUE", "Overdue"),
    ]

    vendor = models.ForeignKey(
        "vendors.Vendor", on_delete=models.PROTECT, related_name="invoices"
    )

    invoice_number = models.CharField(max_length=100)
    invoice_date = models.DateField()
    due_date = models.DateField()

    description = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    currency = models.CharField(max_length=3, default="INR")

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="DRAFT")

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_invoices",
    )

    decision_at = models.DateTimeField(null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)

    rejection_reason = models.TextField(blank=True)
    invoice_file = models.FileField(upload_to="invoices/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["vendor", "invoice_number"]

    def __str__(self):
        return f"{self.invoice_number} - {self.vendor.name}"
