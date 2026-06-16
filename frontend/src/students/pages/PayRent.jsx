// src/students/pages/PayRent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import PayNowButton from '../components/PayNowButton';

const PayRent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [unpaidPayments, setUnpaidPayments] = useState([]);
  const [paidPayments, setPaidPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, [user]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get student profile
      const studentRes = await api.get('/students/');
      const students = studentRes.data.results || studentRes.data;
      const currentStudent = students.find(s => s.user === user?.id);

      if (!currentStudent) {
        setError('Student profile not found');
        setLoading(false);
        return;
      }

      // Get payments for this student
      const paymentsRes = await api.get(`/bookings/payments/`);
      const allPayments = paymentsRes.data.results || paymentsRes.data;
      
      // Filter payments for current student
      const studentPayments = allPayments.filter(p => p.student === currentStudent.id);
      
      // Separate paid and unpaid
      const unpaid = studentPayments.filter(p => p.paid_status === 'pending' || p.paid_status === 'overdue');
      const paid = studentPayments.filter(p => p.paid_status === 'paid');

      setPayments(studentPayments);
      setUnpaidPayments(unpaid);
      setPaidPayments(paid);

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchPaymentData(); // Refresh data
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return '✅';
      case 'pending': return '⏳';
      case 'overdue': return '⚠️';
      case 'failed': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Pay Rent</h1>
        <p className="text-gray-400 mt-1">View and pay your hostel rent</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Total Payments</p>
          <p className="text-2xl font-bold text-white mt-1">{payments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{unpaidPayments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Paid Payments</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{paidPayments.length}</p>
        </div>
      </div>

      {/* Unpaid Payments Section */}
      {unpaidPayments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-red-400">⚠️</span> Pending Payments
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({unpaidPayments.length} pending)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unpaidPayments.map((payment) => (
              <div
                key={payment.id}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-semibold">
                        Payment #{payment.id}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Due: {formatDate(payment.due_date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(payment.paid_status)}`}>
                      {getStatusIcon(payment.paid_status)}
                      <span className="capitalize">{payment.paid_status}</span>
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-white font-bold text-lg">{formatPrice(payment.amount)}</span>
                    </div>
                    {payment.booking_room && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Room</span>
                        <span className="text-white">Room {payment.booking_room}</span>
                      </div>
                    )}
                    {payment.paid_status === 'overdue' && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-2">
                        <p className="text-red-400 text-xs">⚠️ This payment is overdue</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handlePayNow(payment)}
                    className="w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid Payments Section */}
      {paidPayments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">✅</span> Payment History
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({paidPayments.length} payments)
            </span>
          </h2>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr className="text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-4 text-left">Payment ID</th>
                    <th className="px-5 py-4 text-left">Amount</th>
                    <th className="px-5 py-4 text-left">Room</th>
                    <th className="px-5 py-4 text-left">Paid On</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-left">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paidPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-5 py-4">
                        <p className="text-gray-400 text-xs font-mono">#{payment.id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white font-semibold">{formatPrice(payment.amount)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-300">Room {payment.booking_room || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-300 text-sm">{formatDate(payment.paid_at)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusBadge(payment.paid_status)}`}>
                          {getStatusIcon(payment.paid_status)}
                          <span className="capitalize">{payment.paid_status}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            alert(`Receipt #${payment.receipt_number || 'N/A'}\nAmount: ${formatPrice(payment.amount)}\nDate: ${formatDate(payment.paid_at)}`);
                          }}
                          className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-medium rounded-lg transition"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Payments */}
      {payments.length === 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Payment Records</h3>
          <p className="text-gray-400">You don't have any payment records yet.</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Confirm Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Payment Amount</span>
                  <span className="text-2xl font-bold text-cyan-400">{formatPrice(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Due Date</span>
                  <span className="text-white">{formatDate(selectedPayment.due_date)}</span>
                </div>
                {selectedPayment.booking_room && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Room</span>
                    <span className="text-white">Room {selectedPayment.booking_room}</span>
                  </div>
                )}
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-sm text-gray-400 text-center">
                  You will be redirected to eSewa to complete the payment
                </p>
              </div>

              <PayNowButton
                bookingId={selectedPayment.booking}
                amount={selectedPayment.amount}
                className="w-full py-3 text-base font-bold shadow-xl shadow-green-500/30 hover:shadow-green-500/50"
              />

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRent;