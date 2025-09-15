

# 🎓 School Payment API

A Node.js + Express + MongoDB backend for managing **school fee payments**, with JWT authentication, integration with a payment gateway, and webhook handling.

Live API Base URL (Render):  
```

[https://school-payment-app.onrender.com](https://school-payment-app.onrender.com)

````

---

## 📦 Tech Stack
- **Node.js / Express**
- **MongoDB Atlas (Mongoose)**
- **JWT (JSON Web Tokens) for authentication**
- **Axios** for payment gateway integration
- **UUID** for unique order IDs
- **Deployed on Render**

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

Create a new user.

**Request Body:**
json
{
  "email": "test@example.com",
  "password": "password123"
}


**Response (201):**

json
{
  "_id": "68c662848c3556641b938af6",
  "email": "test@example.com",
  "token": "<JWT_TOKEN>"
}


---

### 2. Login User

**POST** `/api/auth/login`

Authenticate and get a JWT token.

**Request Body:**

json
{
  "email": "test@example.com",
  "password": "password123"
}


**Response (200):**

json
{
  "_id": "68c662848c3556641b938af6",
  "email": "test@example.com",
  "token": "<JWT_TOKEN>"
}


⚠️ Save the token and include it in **Authorization header** as:


Authorization: Bearer <token>


---

## 💳 Payment Endpoints

### 3. Create Payment

**POST** `/api/payment/create`
🔒 Requires JWT Authorization

Creates a new payment request, stores it in DB, and attempts to generate a payment link with the gateway.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

json
{
  "student_info": {
    "name": "Rohit Sharma",
    "email": "rohit@example.com",
    "id": "STU123"
  },
  "order_amount": 1000
}


**Response (Success Example):**

json
{
  "payment_url": "https://sandbox.api.eduvanz.com/redirect/xyz123"
}


**Response (Failure Example):**

json
{
  "message": "Failed to create payment link"
}




### 4. Webhook (Gateway Callback)

**POST** `/api/payment/webhook`

👉 This is **called by the payment gateway**, not by the frontend.
It updates order status in the DB and logs payloads.

**Sample Webhook Payload:**

json
{
  "order_id": "68c6fae8f855dd4de75aad28",
  "transaction_amount": 1000,
  "status": "Success",
  "bank_ref_num": "BANK12345",
  "message": "Payment successful"
}


**Response:**


200 OK
Webhook received successfully.


---

## 📊 Transaction Endpoints

### 5. Get Transactions (Paginated)

**GET** `/api/transactions?page=1&limit=10`
🔒 Requires JWT Authorization

Returns paginated list of transactions.

**Response Example:**

json
{
  "page": 1,
  "limit": 10,
  "total": 1,
  "data": [
    {
      "_id": "68c6fae8f855dd4de75aad28",
      "student_info": { "name": "Rohit Sharma", "email": "rohit@example.com" },
      "order_amount": 1000,
      "status": "success",
      "payment_time": "2025-09-15T12:30:45.000Z"
    }
  ]
}




### 6. Get Transaction Status by Custom Order ID

**GET** `/api/transactions/status/:custom_order_id`
🔒 Requires JWT Authorization

Retrieve status of a specific transaction.

**Example Request:**


GET /api/transactions/status/5d4490aa-fc05-422d-b15b-10201e023584


**Response:**

json
{
  "custom_order_id": "5d4490aa-fc05-422d-b15b-10201e023584",
  "status": "success",
  "order_amount": 1000,
  "transaction_amount": 1000,
  "payment_time": "2025-09-15T12:30:45.000Z"
}




## 🛠️ Local Development

1. Clone repo

bash
git clone https://github.com/y-adit/school-payment-app.git
cd school-payment-app/backend


2. Install dependencies
bash
npm install


3. Create .env file

env
PORT=5000
MONGO_URI=<your_mongo_atlas_uri>
JWT_SECRET=<your_secret>
JWT_EXPIRY=1h
NODE_ENV=development

PG_KEY=edvtest01
PAYMENT_API_KEY=<gateway_key>
SCHOOL_ID=<school_id>
PAYMENT_ENV=sandbox
PAYMENT_GATEWAY_SANDBOX=https://sandbox.api.eduvanz.com/create-collect-request
PAYMENT_GATEWAY_PROD=https://api.eduvanz.com/create-collect-request
```

4. Start server

```bash
npm start
```

---

## 🚀 Deployment

* Hosted on **Render**
* Set all environment variables in Render dashboard
* Server URL: `https://school-payment-app.onrender.com`





* Aditya V. Yadav





