
from rest_framework import generics
from .models import Vendor
from .serializers import VendorSerializer


class VendorListCreateAPIView(generics.ListCreateAPIView):
    queryset = Vendor.objects.all().order_by('-created_at')
    serializer_class = VendorSerializer


class VendorDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
