# LYQON#
LICON AI Casting Assistant

**An intelligent casting tool that empowers directors with objective, data-driven analysis of actor auditions.**

---

## Team Members

| Name              | Role                  | Contact                         |
| ----------------- | --------------------- | ------------------------------- |
| **Ashwin R**      | Project Lead          | `ashwinr10899@gmai.com` / [@github] |
| **Rebin George**  | Frontend Lead         | `rebinforu@gmail.com` / [@github] |
| **Akul Vinod**    | UI/UX Designer        | `etmrakul2@gmail.com` / [@github] |
| **Tarun Girish**  | Project Manager       | `tarun.girish2006gmail.com` / [@github] |

---

## How to Run Locally

### Prerequisites
- Python 3.8+ & Pip
- Node.js & NPM
- Docker & Docker Compose (for containerized setup)

### Step-by-Step Instructions

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/twenty20productionpictures-netizen/LYQON.git
    cd LYQON
    ```

2.  **Backend Setup**
    ```bash
    # Navigate to the backend source directory
    cd src/backend

    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows use: venv\Scripts\activate

    # Install Python dependencies
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    ```bash
    # Navigate to the frontend source directory
    cd src/frontend

    # Install Node.js dependencies
    npm install
    ```

4.  **Run the Development Servers**
    - Open two separate terminal windows.
    - In the first terminal, run the **Backend**:
      ```bash
      # From the src/backend directory
      flask --app app.main run
      ```
    - In the second terminal, run the **Frontend**:
      ```bash
      # From the src/frontend directory
      npm start
      ```
    - The application will be running at `http://localhost:3000`.

### How to Run Tests
To run the backend unit tests:
```bash
# From the root directory
python -m unittest tests/test_api.py
```

---

## Deployment

### Live Demo
**URL:** **[https://preview--licon-ai-cast.lovable.app/dashboard/director](https://preview--licon-ai-cast.lovable.app/dashboard/director)**

### Deployment Instructions (using Docker)
The application is containerized for easy deployment.

1.  **Build and Run with Docker Compose:**
    From the root directory of the project, run:
    ```bash
    docker-compose up --build
    ```
2.  **Accessing the Application:**
    - The **Frontend** will be available at `http://localhost:3000`.
    - The **Backend API** will be available at `http://localhost:5000`.

---

## Environment Variables

The backend requires the following environment variables. You can create a `.env` file in the `src/backend` directory to manage them.

- `FLASK_APP=app.main`: Specifies the main application file for Flask.
- `FLASK_ENV=development`: Sets the environment (e.g., 'development' or 'production').
- `UPLOAD_FOLDER=app/uploads`: (Optional) Path to store temporary uploads.

---

## Known Limitations and TODOs

### Limitations
- **Visual-Only Analysis:** The current model only analyzes visual data (facial expressions). It does not process vocal tone or dialogue sentiment, which are crucial for a complete performance analysis.
- **Basic Emotion Heuristics:** The emotion detection relies on classic OpenCV heuristics rather than a deep learning model, which may limit the accuracy and nuance of the detection.
- **No User Authentication:** The dashboard is currently public and lacks a user login/authentication system.

### Future Work (TODOs)
- **[ ] Integrate Audio Analysis:** Implement a speech-to-text and vocal tone analysis module to create a true multi-modal evaluation.
- **[ ] Upgrade Emotion Model:** Replace the heuristic-based model with a fine-tuned deep learning (CNN) model for superior accuracy.
- **[ ] Implement User Accounts:** Add a full authentication system with project saving and user management.
- **[ ] Database Integration:** Add a database (e.g., PostgreSQL) to store user data, projects, and audition results permanently.

---

## License and Attributions

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

- Face and eye detection models are provided by **OpenCV Haar Cascades**.
- The frontend was built using **[Your Frontend Framework, e.g., React]**.
