
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status


class InvoiceAPITests(APITestCase):

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="testuser",
            password="TestPass123!"
        )
        self.client.force_authenticate(user=self.user)

    def test_invoice_list_api(self):
        response = self.client.get("/api/invoices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_nonexistent_invoice_returns_404(self):
        response = self.client.get("/api/invoices/999999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
