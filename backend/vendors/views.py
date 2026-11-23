
from rest_framework import generics
from .models import Vendor
from rest_framework.permissions import IsAuthenticated
from .serializers import VendorSerializer


class VendorListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Vendor.objects.all().order_by('-created_at')
    serializer_class = VendorSerializer


class VendorDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
