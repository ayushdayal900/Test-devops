# 🧵 Mahalxmi Tailors - Bespoke E-Commerce Platform

![Project Status](https://img.shields.io/badge/status-complete-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech Stack](https://img.shields.io/badge/stack-MERN-green)

> **Where Tradition Meets Technology.**  
> A premium, custom-built e-commerce platform designed for **Mahalxmi Tailors**, specializing in authentic Maharashtrian attire like Paithani, Rajlaxmi, and Mastani sarees.

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🏗️ Project Structure](#️-project-structure)
- [📚 Documentation](#-documentation)
- [🧪 Testing](#-testing)
- [🔮 Future Roadmap](#-future-roadmap)
- [🤝 Contributing](#-contributing)

---

## ✨ Key Features

### 🛍️ Customer Experience
-   **Visual Catalog**: Browse exquisite designs with filtering by category (Rajlaxmi, Peshwai, etc.).
-   **Customization**: Detailed measurement forms for Blouse and Saree stitching.
-   **Real-time Order Tracking**: Visual timeline of order status (Measurements -> Stitching -> Ready).
-   **User Portal**: Manage saved addresses, measurement profiles, and order history.
-   **Secure Payments**: Integrated **Razorpay** checkout for seamless transactions.

### ⚙️ Admin Dashboard
-   **Order Management**: Workflow to track and update order status.
-   **CMS**: Manage banners, testimonials, and FAQs dynamically.
-   **Inventory**: Add/Edit Product designs and manage stock visibility.
-   **Financials**: Track revenue and payment status.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Fast, interactive UI with **Tailwind CSS**. |
| **Backend** | Node.js + Express | Robust RESTful API with **Helmet** security. |
| **Database** | MongoDB Atlas | Scalable Cloud NoSQL database. |
| **Payments** | Razorpay | Secure payment gateway integration. |
| **Testing** | Jest + Supertest | Unit and Integration testing suites. |
| **Docs** | Swagger UI | Interactive API documentation. |

---

## 🚀 Getting Started

### Prerequisites
-   **Node.js** (v18 or higher)
-   **MongoDB** (Local or Atlas URI)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/mahalxmi-tailors.git
    cd mahalxmi-tailors
    ```

2.  **Install Dependencies**
    ```bash
    # Install Root Dependencies (if any)
    npm install

    # Install Backend
    cd backend
    npm install

    # Install Frontend
    cd ../frontend
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the `backend/` directory based on `.env.example`:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_secret
    RAZORPAY_KEY_ID=your_key_id
    RAZORPAY_KEY_SECRET=your_key_secret
    ```

4.  **Seed Database (Important!)**
    Populate the database with initial products and admin user:
    ```bash
    cd backend
    npm run seed
    ```

### Running the Application

To run both Frontend and Backend concurrently:
```bash
# From the root directory
npm start
```
*   **Frontend**: `http://localhost:5173`
*   **Backend**: `http://localhost:5000`
*   **Swagger Docs**: `http://localhost:5000/api/docs`

---

## 🏗️ Project Structure

```bash
mahalxmi-tailors/
├── backend/                # Node.js API
│   ├── config/             # DB & Swagger Config
│   ├── controllers/        # Business Logic
│   ├── models/             # Mongoose Schemas (Order, User, Product)
│   ├── routes/             # API Endpoints
│   └── tests/              # Jest Tests
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── context/        # Auth & Cart Context
│   │   ├── pages/          # Route Pages (Home, Dashboard, etc.)
│   │   └── utils/          # Helpers
├── docs/                   # Detailed Manuals
└── README.md               # You are here
```

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:
-   **[Admin User Guide](docs/AdminUserGuide.md)**: How to manage the store.
-   **[Operations Guide](docs/OperationsGuide.md)**: Deployment and maintenance.
-   **[Database Schema](docs/DatabaseSchema.md)**: Data model reference.
-   **[API Documentation](http://localhost:5000/api/docs)**: Interactive Swagger UI.

---

## 🧪 Testing

We use **Jest** for ensuring code reliability.

**Run Backend Tests:**
```bash
cd backend
npm test
```

**Run Frontend Tests:**
```bash
cd frontend
npm test
```

---

## 🔮 Future Roadmap

We have an exciting roadmap for post-MVP features including **WhatsApp Integration** and **AI Recommendations**.
👉 [View full ROADMAP.md](ROADMAP.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

### 📞 Contact

**Mahalxmi Tailors Dev Team**  
📧 support@mahalxmitailors.com  
🌐 [www.mahalxmitailors.com](http://localhost:5173)
