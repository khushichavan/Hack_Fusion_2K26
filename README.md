🚰 AquaFlow – Urban Water Supply Conflict Resolver

Smart, AI-driven system for resolving urban water distribution conflicts with real-time demand, emergency prioritization, and transparent allocation.


🌍 Problem Statement
Urban areas face unequal water distribution, delayed supply, and lack of transparency.
Critical zones like hospitals and high-demand areas often suffer due to inefficient allocation systems.

💡 Solution
AquaFlow is a full-stack intelligent platform that:


Collects real-time water demand from users


Prioritizes allocation using smart scoring


Handles emergency water requests


Tracks tanker delivery in real-time


Ensures fairness and transparency in distribution



🚀 Key Features
📍 1. Live Location-Based Demand


Users can share their current location


Automatically detect area and submit water request


🧠 2. Smart Conflict Resolver


AI-based priority scoring system


Considers:


Population


Shortage level


Emergency priority


Past delays




🚨 3. Emergency Request System


Special categories:


Hospital


Fire emergency


Public health




Admin can approve instantly


📊 4. Predictive Demand Analytics


Forecast future water demand


Risk levels: Low / Medium / High


🚚 5. Tanker Tracking System


Track delivery status:


Assigned → On the way → Delivered




Estimated arrival time


⚖️ 6. Fairness Meter


Shows fairness score of allocation


Detects imbalance and conflict risk


🧾 7. Complaint System


Users can report:


No water


Leakage


Pollution




Upload proof (images)


💧 8. Water Quality Monitoring


Shows:


pH level


TDS


Chlorine level




Status: Safe / Unsafe


🔔 9. Notification System


Real-time updates:


Request approved


Tanker assigned


Delivery completed




📈 10. Public Transparency Dashboard


Open dashboard showing:


Total supply


Area allocation


Pending requests


Fairness score





🏗️ System Architecture
Frontend (React + TypeScript)        ↓API Calls (Axios / React Query)        ↓Backend (FastAPI - Python)        ↓JSON Storage (Users, Requests, Areas, Logs)

🛠️ Tech Stack
🔹 Frontend


React + TypeScript


Vite


TanStack Router


React Query


Tailwind CSS


Radix UI


🔹 Backend


Python (FastAPI)


Uvicorn server


PBKDF2 authentication


🔹 Database


JSON-based storage (lightweight for hackathon)



📁 Project Structure
hackthon/│├── backend/│   ├── app.py│   ├── users.json│   ├── requests.json│   ├── complaints.json│   └── ...│├── frontend/│   ├── src/│   ├── components/│   ├── pages/│   └── ...

⚙️ Installation & Setup
🔹 1. Clone Repository
git clone https://github.com/your-username/AquaFlow.gitcd AquaFlow

🔹 2. Backend Setup
cd backendpip install -r requirements.txtuvicorn app:app --reload --port 8001
👉 API Docs: http://127.0.0.1:8001/docs

🔹 3. Frontend Setup
cd frontendnpm installnpm run dev
👉 Frontend: http://localhost:5173

🔄 Demo Flow


User Signup/Login


Share live location


Submit water demand


Admin views request


Smart allocation applied


Emergency handled (if any)


Tanker assigned


User tracks delivery


Public dashboard shows fairness



🧠 Innovation & Uniqueness


AI-inspired allocation logic


Real-time location-based demand


Emergency-aware system


Fairness scoring (rare in similar projects)


Public transparency dashboard



📸 Screenshots (Add yours)


Login Page


User Dashboard


Admin Dashboard


Tanker Tracking


Public Dashboard



🔮 Future Enhancements


Real-time IoT water sensors


Integration with government APIs


Machine learning model for prediction


Mobile app version


Blockchain for transparency



👩‍💻 Team


Khushi Chavan (BE CSE - VTU)


Team Members



📬 Contact
📧 khushidchavan1@gmail.com

⭐ Support
If you like this project:
👉 Star ⭐ the repo
👉 Share with others

🔥 Built for Hackathon – Smart Cities & Urban Innovation
