// src/students/views/ViewReceipts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';
import { useNotification } from '../../context/NotificationContext';

const ViewReceipts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useNotification();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get student profile
      const studentRes = await api.get('/students/');
      const students = studentRes.data.results || studentRes.data;
      const currentStudent = students.find(s => s.user === user?.id);

      if (!currentStudent) {
        setPayments([]);
        setLoading(false);
        return;
      }

      // Get payments for this student
      const paymentsRes = await api.get(`/bookings/payments/`);
      const allPayments = paymentsRes.data.results || paymentsRes.data;
      
      // Filter payments for current student and only paid ones
      const studentPayments = allPayments.filter(p => 
        p.student === currentStudent.id && p.paid_status === 'paid'
      );
      
      // Fetch booking and room details for each payment
      const paymentsWithDetails = await Promise.all(
        studentPayments.map(async (payment) => {
          try {
            let roomNumber = 'N/A';
            let hostelName = 'N/A';
            let bookingDate = 'N/A';
            
            if (payment.booking) {
              const bookingRes = await api.get(`/bookings/bookings/${payment.booking}/`);
              const booking = bookingRes.data;
              bookingDate = booking.created_at;
              
              if (booking.room) {
                const roomRes = await api.get(`/hostel/rooms/${booking.room}/`);
                const room = roomRes.data;
                roomNumber = room.room_number;
                
                // Get floor and block details
                const floorRes = await api.get(`/hostel/floors/${room.floor}/`);
                const floor = floorRes.data;
                const blockRes = await api.get(`/hostel/blocks/${floor.block}/`);
                const block = blockRes.data;
                const hostelRes = await api.get(`/hostel/hostels/${block.hostel}/`);
                hostelName = hostelRes.data.name;
              }
            }
            
            return {
              ...payment,
              room_number: roomNumber,
              hostel_name: hostelName,
              booking_date: bookingDate,
            };
          } catch (err) {
            console.error('Error fetching details for payment:', payment.id, err);
            return payment;
          }
        })
      );
      
      setPayments(paymentsWithDetails);
      
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payment receipts');
      showError('Failed to load payment receipts', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    const now = new Date();
    if (filter === 'this_month') {
      return payments.filter(p => {
        const date = new Date(p.paid_at);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
    } else if (filter === 'last_month') {
      return payments.filter(p => {
        const date = new Date(p.paid_at);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= lastMonth && date < thisMonth;
      });
    } else if (filter === 'this_year') {
      return payments.filter(p => {
        const date = new Date(p.paid_at);
        return date.getFullYear() === now.getFullYear();
      });
    }
    return payments;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      bank_transfer: '🏦',
      esewa: '📱',
      mobile_banking: '📱',
      online: '🌐',
    };
    return icons[method] || '💰';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Cash',
      card: 'Card',
      bank_transfer: 'Bank Transfer',
      esewa: 'eSewa',
      mobile_banking: 'Mobile Banking',
      online: 'Online',
    };
    return labels[method] || method;
  };

  const filteredPayments = getFilteredPayments();
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    thisMonth: payments.filter(p => {
      const now = new Date();
      const date = new Date(p.paid_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading receipts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchPayments}
            className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/students/homepage')}
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-white">Payment Receipts</h1>
        <p className="text-gray-400 mt-1">View all your payment receipts and history</p>
      </div>

      {/* Stats Cards */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Total Receipts</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Total Paid</p>
            <p className="text-2xl font-bold text-green-400">{formatPrice(stats.totalAmount)}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">This Month</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.thisMonth}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800">
        {['all', 'this_month', 'last_month', 'this_year'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium transition capitalize ${
              filter === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'all' ? 'All Receipts' : tab.replace('_', ' ')}
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500/20 rounded-full">
              {tab === 'all' ? payments.length : getFilteredPayments().length}
            </span>
          </button>
        ))}
      </div>

      {/* Receipts List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🧾</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Receipts Found</h3>
          <p className="text-gray-400">
            {payments.length === 0 
              ? "You haven't made any payments yet." 
              : `No receipts found for ${filter.replace('_', ' ')}.`}
          </p>
          {payments.length === 0 && (
            <button
              onClick={() => navigate('/students/pay-rent')}
              className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
            >
              Make a Payment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div 
              key={payment.id} 
              className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all"
            >
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🧾</span>
                      <div>
                        <h3 className="text-white font-semibold">
                          Receipt #{payment.receipt_number || payment.id}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(payment.paid_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-gray-500 text-xs">Amount</p>
                        <p className="text-cyan-400 font-bold text-lg">{formatPrice(payment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Payment Method</p>
                        <p className="text-white">
                          <span className="mr-1">{getPaymentMethodIcon(payment.payment_method)}</span>
                          {getPaymentMethodLabel(payment.payment_method)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Room</p>
                        <p className="text-white">Room {payment.room_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Hostel</p>
                        <p className="text-white">{payment.hostel_name}</p>
                      </div>
                      {payment.transaction_code && (
                        <div className="sm:col-span-2">
                          <p className="text-gray-500 text-xs">Transaction ID</p>
                          <p className="text-gray-300 text-sm font-mono">{payment.transaction_code}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowReceiptModal(true);
                      }}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium rounded-lg transition whitespace-nowrap"
                    >
                      View Full Receipt
                    </button>
                    <button
                      onClick={() => {
                        // Print receipt
                        const printContent = document.getElementById(`receipt-${payment.id}`);
                        if (printContent) {
                          const win = window.open('', '_blank');
                          win.document.write(`
                            <html>
                              <head>
                                <title>Receipt #${payment.receipt_number || payment.id}</title>
                                <style>
                                  body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                                  .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                                  .details { margin-bottom: 20px; }
                                  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                                  .total { font-size: 20px; font-weight: bold; color: #28a745; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
                                  .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h1>HOSTEL MANAGEMENT SYSTEM</h1>
                                  <h2>Payment Receipt</h2>
                                  <p>Receipt #${payment.receipt_number || payment.id}</p>
                                </div>
                                <div class="details">
                                  <div class="row"><span>Date:</span><span>${formatDate(payment.paid_at)}</span></div>
                                  <div class="row"><span>Student:</span><span>${payment.student_name || 'N/A'}</span></div>
                                  <div class="row"><span>Room:</span><span>Room ${payment.room_number}</span></div>
                                  <div class="row"><span>Hostel:</span><span>${payment.hostel_name}</span></div>
                                  <div class="row"><span>Payment Method:</span><span>${getPaymentMethodLabel(payment.payment_method)}</span></div>
                                  ${payment.transaction_code ? `<div class="row"><span>Transaction ID:</span><span>${payment.transaction_code}</span></div>` : ''}
                                </div>
                                <div class="total">
                                  <div class="row"><span>Total Amount:</span><span>${formatPrice(payment.amount)}</span></div>
                                </div>
                                <div class="footer">
                                  <p>Thank you for your payment!</p>
                                  <p>This is a computer-generated receipt.</p>
                                </div>
                              </body>
                            </html>
                          `);
                          win.document.close();
                          win.print();
                        }
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition whitespace-nowrap"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧾</span>
                <h2 className="text-xl font-bold text-white">
                  Receipt #{selectedPayment.receipt_number || selectedPayment.id}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedPayment(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Receipt Content */}
            <div id={`receipt-${selectedPayment.id}`} className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center border-b border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-white">HOSTEL MANAGEMENT SYSTEM</h1>
                <p className="text-gray-400 mt-1">Payment Receipt</p>
                <p className="text-gray-500 text-sm mt-1">Receipt #{selectedPayment.receipt_number || selectedPayment.id}</p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Date</span>
                  <span className="text-white">{formatDate(selectedPayment.paid_at)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Student</span>
                  <span className="text-white">{selectedPayment.student_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Room</span>
                  <span className="text-white">Room {selectedPayment.room_number}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Hostel</span>
                  <span className="text-white">{selectedPayment.hostel_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="text-white">
                    <span className="mr-1">{getPaymentMethodIcon(selectedPayment.payment_method)}</span>
                    {getPaymentMethodLabel(selectedPayment.payment_method)}
                  </span>
                </div>
                {selectedPayment.transaction_code && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Transaction ID</span>
                    <span className="text-white font-mono text-sm">{selectedPayment.transaction_code}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-gray-700 mt-2">
                  <span className="text-white font-semibold text-lg">Total Amount</span>
                  <span className="text-cyan-400 font-bold text-2xl">{formatPrice(selectedPayment.amount)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t border-gray-800 pt-4">
                <p className="text-gray-500 text-sm">Thank you for your payment!</p>
                <p className="text-gray-500 text-xs mt-1">This is a computer-generated receipt.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm px-6 py-4 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const printContent = document.getElementById(`receipt-${selectedPayment.id}`);
                  if (printContent) {
                    const win = window.open('', '_blank');
                    win.document.write(`
                      <html>
                        <head>
                          <title>Receipt #${selectedPayment.receipt_number || selectedPayment.id}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                            .details { margin-bottom: 20px; }
                            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                            .total { font-size: 20px; font-weight: bold; color: #28a745; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
                            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          ${printContent.innerHTML}
                        </body>
                      </html>
                    `);
                    win.document.close();
                    win.print();
                  }
                }}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition"
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReceipts;