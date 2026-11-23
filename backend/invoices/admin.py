from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number',
        'vendor',
        'invoice_date',
        'due_date',
        'total_amount',
        'status',
    )

    list_filter = ('status', 'invoice_date')
    search_fields = ('invoice_number', 'vendor__name')