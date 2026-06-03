import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { globalStyles } from "./theme";

/* Public */
import LandingPage from "./pages/LandingPage";
import SingleHostelPage from "./pages/SingleHostelPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import LoginPortal from "./pages/LoginPortal";
import AdminLogin from "./pages/AdminLoginPage";
import MainLayout from "./layouts/MainLayouts";

/* Student Panel */
import StudentLayout from "./layouts/StudentLayouts";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentHomePage from "./students/components/layouts/HomePage";
import BookHostel from "./students/pages/BookHostel";
import RoomDetails from "./students/pages/RoomDetails";
import ComplaintRegistration from "./students/pages/ComplaintRegistration";
import RegisteredComplaints from "./students/pages/RegisteredComplaints";
import Feedback from "./students/pages/Feedback";
import PaymentHistory from "./students/pages/PaymentHistory";
import Profile from "./students/pages/Profile";
import Billings from "./students/pages/Billings";
import PayRent from "./students/pages/PayRent";
import MyBookings from "./students/views/MyBookings";


/* Admin Panel */
import AdminDashboard from "./admin/components/AdminDashboard";
import ManageHostel from "./admin/views/ManageHostel";
import AddHostel from "./admin/views/AddHostel";
import ManageBlocks from "./admin/views/ManageBlocks";
import AddBlock from "./admin/views/AddBlock";
import AddFloor from "./admin/views/AddFloor";
import ManageRooms from "./admin/views/ManageRooms";
import AddRoom from "./admin/views/AddRoom";
import EditRoom from "./admin/views/EditRoom";
import ManageStudents from "./admin/views/ManageStudents";
import StudentDetail from "./admin/views/StudentDetail";
import ManageBookings from "./admin/views/ManageBookings";
import ApproveBooking from "./admin/views/ApproveBooking";
import ManageAllocations from "./admin/views/ManageAllocations";
import RunAllocation from "./admin/views/RunAllocation";
import ManageComplaints from "./admin/views/ManageComplaints";
import ManageFeedbacks from "./admin/views/ManageFeedbacks";
import ManageFloors from "./admin/views/ManageFloors";


export default function App() {
  useEffect(() => {
    const id = "hostel-mgmt-global-styles";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = globalStyles;
    document.head.prepend(style);

    return () => style.remove();
  }, []);

  const AdminHome = () => {
    return <h2>Admin Dashboard Home</h2>;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1 }}>
        <Routes>

          {/* PUBLIC */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/hostel" element={<SingleHostelPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/loginPortal" element={<LoginPortal />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
          </Route>

        {/* STUDENT Section */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentHomePage />} />
            <Route path="homepage" element={<StudentHomePage />} />
            <Route path="hostels" element={<BookHostel />} />
            <Route path="hostels/:id" element={<RoomDetails />} />
            <Route path="book-hostels" element={<BookHostel />} />
            <Route path="room-details/:id" element={<RoomDetails />} />
            <Route path="complaints/new" element={<ComplaintRegistration />} />
            <Route path="complaints" element={<RegisteredComplaints />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="payment-history" element={<PaymentHistory />} />
            <Route path="billings" element={<Billings />} />''
            <Route path="profile" element={<Profile />} />
            <Route path="pay-rent" element={<PayRent />} />  
            <Route path="/students/my-bookings" element={<MyBookings />} />     
          </Route>

          {/* ADMIN Section*/}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Hostel Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="dashboard" element={<AdminHome />} />
            <Route path="hostels" element={<ManageHostel />} />
            <Route path="hostels/add" element={<AddHostel />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="rooms/add" element={<AddRoom />} />
            <Route path="rooms/edit/:id" element={<EditRoom />} />
            <Route path="blocks" element={<ManageBlocks />} />
            <Route path="blocks/add" element={<AddBlock />} />
            <Route path="floors" element={<ManageFloors />} />
            <Route path="floors/add" element={<AddFloor />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="bookings/:id" element={<ApproveBooking />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="students/allocation" element={<ManageAllocations />} />
            <Route path="students/run-allocation" element={<RunAllocation />} />
            <Route path="complaints" element={<ManageComplaints />} />
            <Route path="feedbacks" element={<ManageFeedbacks />} />
          </Route>

        </Routes>
      </main>
    </div>
  );
}