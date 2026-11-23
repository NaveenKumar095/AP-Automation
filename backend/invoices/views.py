from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from django.utils import timezone

from .models import Invoice
from .serializers import InvoiceSerializer
from rest_framework.decorators import api_view, permission_classes


class InvoiceListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Invoice.objects.select_related('vendor').all()
    serializer_class = InvoiceSerializer


class InvoiceDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Invoice.objects.select_related('vendor').all()
    serializer_class = InvoiceSerializer

    def update(self, request, *args, **kwargs):
        invoice = self.get_object()

        # Prevent editing invoices with final statuses
        if invoice.status in ['APPROVED', 'REJECTED', 'PAID']:
            return Response(
                {'error': 'Approved, rejected, or paid invoices cannot be edited.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent direct status changes through the regular update API
        new_status = request.data.get('status')

        if new_status and new_status != invoice.status:
            if new_status in ['APPROVED', 'REJECTED', 'PAID']:
                return Response(
                    {'error': 'Use the appropriate workflow action to change this invoice status.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().update(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_invoice(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)

    if invoice.status != 'DRAFT':
        return Response(
            {'error': 'Only draft invoices can be submitted.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    invoice.status = 'PENDING_APPROVAL'
    invoice.save()

    return Response({
        'message': 'Invoice submitted for approval successfully.',
        'invoice': InvoiceSerializer(invoice).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_invoice(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)

    if invoice.status != 'PENDING_APPROVAL':
        return Response(
            {'error': 'Only pending invoices can be approved.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    invoice.status = 'APPROVED'
    invoice.approved_by = request.user if request.user.is_authenticated else None
    invoice.decision_at = timezone.now()
    invoice.rejection_reason = ''
    invoice.save()

    return Response({
        'message': 'Invoice approved successfully.',
        'invoice': InvoiceSerializer(invoice).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_invoice(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)

    if invoice.status != 'PENDING_APPROVAL':
        return Response(
            {'error': 'Only pending invoices can be rejected.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    rejection_reason = request.data.get('rejection_reason', '').strip()

    if not rejection_reason:
        return Response(
            {'error': 'A rejection reason is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    invoice.status = 'REJECTED'
    invoice.approved_by = request.user if request.user.is_authenticated else None
    invoice.decision_at = timezone.now()
    invoice.rejection_reason = rejection_reason
    invoice.save()

    return Response({
        'message': 'Invoice rejected successfully.',
        'invoice': InvoiceSerializer(invoice).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_invoice_paid(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)

    if invoice.status != 'APPROVED':
        return Response(
            {'error': 'Only approved invoices can be marked as paid.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    invoice.status = 'PAID'
    invoice.payment_date = timezone.now().date()
    invoice.save()

    return Response({
        'message': 'Invoice marked as paid successfully.',
        'invoice': InvoiceSerializer(invoice).data
    })