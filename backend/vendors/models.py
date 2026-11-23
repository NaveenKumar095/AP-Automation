
from django.db import models


class Vendor(models.Model):

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    vendor_code = models.CharField(
        max_length=20,
        unique=True
    )

    name = models.CharField(max_length=255)

    contact_person = models.CharField(
        max_length=100,
        blank=True
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    address = models.TextField()

    tax_id = models.CharField(
        max_length=50,
        blank=True
    )

    payment_terms = models.PositiveIntegerField(
        default=30,
        help_text="Payment terms in days"
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor_code} - {self.name}"
