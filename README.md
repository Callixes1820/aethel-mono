# Aethel Mono (Hotel Management System) 🏨

> **⚠️ Work in Progress:** This project is currently under active development. I am continuously refining existing features and have several major updates planned for the future.

**Aethel Mono HMS** is a premium, full-stack Hotel Management System designed to streamline boutique hotel operations. It features a sophisticated dark-themed dashboard built to manage rooms, guests, and reservations with high data integrity and modern UI/UX principles.

## 🛠️ Tech Stack

* **Framework**: Next.js 16.1.1 (App Router)
* **Language**: TypeScript
* **Database**: MySQL with connection pooling via `mysql2`
* **Authentication**: Custom JWT-based sessions using `jose` and password hashing with `bcryptjs`
* **Styling**: Tailwind CSS 4.0 with Radix UI primitives
* **Data Handling**: TanStack Table for complex data grids and Zod for schema validation
* **Visuals**: Recharts for real-time analytics and Framer Motion for advanced UI effects

## ✨ Key Features

* **Intelligent Dashboard**: Real-time visualization of total revenue, occupancy rates, active bookings, and total guest registration.
* **Secure Authentication**: Role-based access control (Admin, Staff, Manager) protected by Next.js Middleware and secure JWT sessions.
* **Advanced Booking Engine**: A reservation system that performs complex SQL checks to prevent room double-booking based on date overlaps.
* **Automated Loyalty System**: A multi-tier loyalty program (Mono, Aethel, Noble) that automatically calculates guest status and unlocks perks based on stay history.
* **Room Operations**: A dynamic grid to manage room status (Available, Occupied, Dirty, Maintenance) with instant database synchronization.
* **Guest Management**: Detailed guest profiles including lifetime spend, average daily rates, and full stay history.

## 📊 Database Architecture

The system utilizes a relational MySQL schema with the following core entities:
* `guests`: Stores contact info and loyalty data.
* `rooms`: Tracks room numbers, types, and real-time status.
* `reservations`: Links guests and rooms with transactional check-in/out logic.
* `users` & `roles`: Manages staff accounts and permission levels.

## 🎨 Brand Identity & Philosophy
The Aethel Mono identity is built on the concept of **"Elite Simplicity."**

### **The Name**
* **Aethel (Noble):** Derived from the Old English root for 'noble,' representing a commitment to high-standard, elite hospitality.
* **Mono (Only One):** Signifying the 'only one' system required—a singular platform standing at the pinnacle of quality and performance.

### **Visual Symbolism**
* **The Logomark:** A bespoke monogram interlocking the letters 'A' and 'M', representing the seamless connection between guest services and operational management.
* **The Crown:** Symbolizes the "Aethel" or noble status of the service.
* **The Archway:** The negative space in the monogram forms an archway, a universal symbol of welcome and transition into a refined experience.

### **Design Assets**
* **Typography:** **Montserrat** was chosen for its clean, geometric, and modern aesthetic.
* **Color Palette:** A sophisticated mix of **Noble Bronze (`#a18460`)** and **Deep Charcoal (`#2c3436`)**.

📄 **[View Full Brand Identity PDF](./docs/aethel_mono.pdf)**

## 🚀 Getting Started

1.  **Clone the Repository**.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Database Setup**:
    * Ensure MySQL is running.
    * Execute the schema found in `database/schema.sql` to build the required tables.
4.  **Configuration**: Configure your database credentials and `JWT_SECRET` in your environment variables.
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔮 Future Roadmap

This project is a baseline for a more comprehensive system. Planned features include:
* **Payment Integration**: Full processing for service charges and guest payments.
* **Expanded Reporting**: Exportable financial reports and deeper occupancy analytics.
* **Staff Scheduling**: Internal tools for managing employee shifts and roles.
* **Automated Communication**: Email integration for booking confirmations and loyalty updates.

## DEMO

- [Youtube Link](https://youtu.be/5p5Z4PO1qsc) - basic early features demo (not final design)

---

## Learn More

To learn more about the technologies used in this project:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) - deployment platform for Next.js.

*Created as part of my professional portfolio and OJT requirements.*