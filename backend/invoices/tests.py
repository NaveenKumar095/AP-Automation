
from rest_framework.test import APITestCase
from rest_framework import status


class InvoiceAPITests(APITestCase):

    def test_invoice_list_api(self):
        response = self.client.get("/api/invoices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_nonexistent_invoice_returns_404(self):
        response = self.client.get("/api/invoices/999999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
