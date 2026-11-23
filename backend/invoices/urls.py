from django.urls import path
from .views import (
    InvoiceListCreateAPIView,
    InvoiceDetailAPIView,
    submit_invoice,
    approve_invoice,
    reject_invoice,
    mark_invoice_paid,
)

urlpatterns = [
    path('', InvoiceListCreateAPIView.as_view(), name='invoice-list-create'),
    path('<int:pk>/', InvoiceDetailAPIView.as_view(), name='invoice-detail'),
    path('<int:pk>/approve/', approve_invoice, name='invoice-approve'),
    path('<int:pk>/reject/', reject_invoice, name='invoice-reject'),
    path('<int:pk>/submit/', submit_invoice, name='invoice-submit'),
    path('<int:pk>/pay/', mark_invoice_paid, name='invoice-pay'),
]