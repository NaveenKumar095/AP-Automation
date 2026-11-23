from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(
        source='vendor.name',
        read_only=True
    )

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = [
            'approved_by',
            'decision_at',
            'rejection_reason',
        ]