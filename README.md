# AI-Based Local Services Delivery Platform

This is a full-stack platform inspired by UrbanCompany, allowing women professionals to offer local services, and customers to book those services. An AI microservice assigns the best provider based on location distance, availability, rating, and experience.

## 📁 Project Structure

1. **`backend/`**: Java Spring Boot backend handling User Management, Authentication (JWT), Bookings, and business logic.
2. **`ai-service/`**: Python Flask AI Microservice that calculates matching scores and assigns providers.
3. **`frontend/`**: React (Vite) frontend application with TailwindCSS for the user interface.

## 🚀 How to Run the Project

### 1. Database Setup (MySQL)
Ensure MySQL is running on port `3306` with username `root` and password `root`. 
Create a database named `ai_local_services`:
```sql
CREATE DATABASE ai_local_services;
```
*(Spring Boot's Hibernate will automatically create the tables when the application starts.)*

### 2. AI Microservice (Flask)
Start the AI Matching service so the backend can communicate with it.
```bash
cd ai-service
# Activate your virtual environment (if used)
# Windows: .\venv\Scripts\Activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server on port 5000
python app.py
```

### 3. Backend (Spring Boot)
Open the `backend` folder in your preferred Java IDE (IntelliJ IDEA, Eclipse, or VS Code).
Ensure you have **Java 17** installed.

Run the `AiLocalServicesApplication.java` main class.
The application will start on `http://localhost:8080`.

### 4. Frontend (React)
Start the customer and provider web interface.
```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

## 🌟 Usage Guide
1. Open your browser to `http://localhost:5173`.
2. **Register as a Provider**, fill in your details, and log in to add Availability slots in your Dashboard.
3. **Register as a Customer**, grant location access (optional), and browse the available services.
4. **Book a Service** from the Customer Dashboard.
5. The backend will seamlessly contact the `ai-service` to evaluate Provider scores and automatically assign the highest-scoring matching Provider!

## 🧪 Score Algorithm
The AI computes scores as: `(rating * 0.4) + (experience * 0.3) + (availability * 0.2) + (location_score * 0.1)`. Location score uses Geodesic distance calculation if Coordinates are present.
