import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { globalStyles } from "./theme";
import { NotificationProvider } from "./context/NotificationContext";

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
import RoomSelection from "./students/pages/RoomSelection";
import RoomDetails from "./students/pages/RoomDetails";
import ComplaintRegistration from "./students/pages/ComplaintRegistration";
import RegisteredComplaints from "./students/pages/RegisteredComplaints";
import Feedback from "./students/pages/Feedback";
import PaymentHistory from "./students/pages/PaymentHistory";
import Profile from "./students/pages/Profile";
import Billings from "./students/pages/Billings";
import PayNowPage from "./students/views/PayNow";
import PayRent from "./students/pages/PayRent";
import MyBookings from "./students/views/MyBookings";
import ViewBooking from "./students/views/ViewBooking";
import PaymentSuccess from './students/views/PaymentSuccess';
import PaymentFailure from './students/views/PaymentFailure';
import AllEvents from "./students/views/AllEvents";
import ViewReceipts from "./students/views/ViewReciepts";

/* Admin Panel */
import AdminDashboard from "./admin/components/AdminDashboard";
import ManageHostel from "./admin/views/ManageHostel";
import AddHostel from "./admin/views/AddHostel";
import EditHostel from "./admin/views/EditHostel";
import ManageBlocks from "./admin/views/ManageBlocks";
import AddBlock from "./admin/views/AddBlock";
import AddFloor from "./admin/views/AddFloor";
import ManageFloors from "./admin/views/ManageFloors";
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
import PendingComplaints from "./admin/views/PendingComplaints";
import ResolvedComplaints from "./admin/views/ResolvedComplaints";
import ManageFeedbacks from "./admin/views/ManageFeedbacks";
import ManageEvents from './admin/pages/ManageEvents';
import AddEvent from './admin/pages/AddEvents';
import EditEvent from './admin/pages/EditEvents';
import AdminComplaintDetails from "./admin/views/AdminComplaintDetails";

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
  
    <NotificationProvider>
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
              <Route path="room-selection/:hostelId" element={<RoomSelection />} />
              <Route path="complaints/new" element={<ComplaintRegistration />} />
              <Route path="complaints" element={<RegisteredComplaints />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="payment-history" element={<PaymentHistory />} />
              <Route path="billings" element={<Billings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="pay-rent" element={<PayRent />} />
              <Route path="my-bookings" element={<MyBookings />} />
              <Route path="booking/:bookingId" element={<ViewBooking />} />
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="payment/failure" element={<PaymentFailure />} />
              <Route path="pay/:bookingId" element={<PayNowPage />} />
              <Route path="allevents" element={<AllEvents />} />
              <Route path="receipts/:bookingId" element={<ViewReceipts />} />
            </Route>

            {/* ADMIN Section */}
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
              <Route path="hostels/edit/:id" element={<EditHostel />} />
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
              <Route path="complaints/pending" element={<PendingComplaints />} />
              <Route path="complaints/resolved" element={<ResolvedComplaints />} />
              <Route path="complaint/:complaintId" element={<AdminComplaintDetails />} />
              <Route path="feedbacks" element={<ManageFeedbacks />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="events/add" element={<AddEvent />} />
              <Route path="events/edit/:id" element={<EditEvent />} />
            </Route>
          </Routes>
        </main>
      </div>
    </NotificationProvider>
  );
}