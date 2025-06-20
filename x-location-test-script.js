const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const testEmail = 'test@email.com';
const testProductId = 123;
const testCode = 'TESTCODE';
const testOrderId = 1;
const testPaymentId = 1;
const testCartId = 1;
const testProduct = 999;
const testDiscountCode = 'TESTCODE';

const endpoints = [
  { method: 'PUT', url: `/api/carts/addItems/${testEmail}/${testProductId}/1` },
  { method: 'PUT', url: `/api/carts/addDiscountCode/${testEmail}/${testCode}` },
  { method: 'POST', url: `/api/products/${testProduct}/rating` },
  {
    method: 'PUT',
    url: `/api/customers/addWishlist/${testEmail}/${testProductId}`,
  },
  { method: 'POST', url: `/api/carts/convertToOrder/${testEmail}` },
  { method: 'OPTIONS', url: `/api/something` },
  { method: 'POST', url: `/api/customers/signup` },
  { method: 'POST', url: `/api/discounts` },
  { method: 'POST', url: `/api/products` },
  { method: 'DELETE', url: `/api/discounts/${testDiscountCode}` },
  { method: 'DELETE', url: `/api/orders/${testOrderId}` },
  { method: 'DELETE', url: `/api/products/${testProduct}` },
  { method: 'GET', url: `/api/customers` },
  { method: 'GET', url: `/api/carts/email/${testEmail}` },
  { method: 'GET', url: `/api/carts/${testCartId}` },
  { method: 'GET', url: `/api/carts` },
  { method: 'GET', url: `/api/customers/${testEmail}` },
  { method: 'GET', url: `/api/customers/${testEmail}/wishlist` },
  { method: 'GET', url: `/api/discounts/${testCode}` },
  { method: 'GET', url: `/api/discounts` },
  { method: 'GET', url: `/api/orders/${testOrderId}` },
  { method: 'GET', url: `/api/orders` },
  { method: 'GET', url: `/api/payments/${testPaymentId}` },
  { method: 'GET', url: `/api/payments` },
  { method: 'GET', url: `/api/products/${testProduct}` },
  { method: 'GET', url: `/api/products` },
  { method: 'GET', url: `/api/carts/status` },
  { method: 'POST', url: `/api/customers/login` },
  { method: 'GET', url: `/api/ping` },
  {
    method: 'PUT',
    url: `/api/carts/removeItems/${testEmail}/${testProductId}/1`,
  },
  {
    method: 'PUT',
    url: `/api/carts/removeDiscountCode/${testEmail}/${testCode}`,
  },
  {
    method: 'PUT',
    url: `/api/customers/removeWishlist/${testEmail}/${testProductId}`,
  },
  { method: 'PUT', url: `/api/customers/${testEmail}` },
  { method: 'PUT', url: `/api/discounts/${testCode}` },
  { method: 'PUT', url: `/api/products/${testProduct}` },
];

const baseUrl = 'http://localhost:7071';

(async () => {
  for (const { method, url } of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body:
          method === 'POST' || method === 'PUT'
            ? JSON.stringify({})
            : undefined,
      });

      const hasXLocation = response.headers.has('x-location');
      console.log(
        `${method} ${url} → ${response.status} | X-Location: ${
          hasXLocation ? response.headers.get('x-location') : '❌'
        }`
      );
    } catch (err) {
      console.error(`${method} ${url} → ❌ Request failed:`, err.message);
    }
  }
})();
