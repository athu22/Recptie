import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, get, query, limitToLast, orderByChild } from 'firebase/database';
import { db } from '../firebase';
import { Save, X, Calculator, CreditCard, Banknote, Building2 } from 'lucide-react';

const CreateReceipt = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    receiptNo: '',
    customerName: '',
    mobile: '',
    address: '',
    productName: '',
    description: '',
    amount: '',
    gst: '0',
    paymentMode: 'Cash',
    transactionId: '',
    createdDate: new Date().toLocaleDateString('en-GB'),
    createdTime: new Date().toLocaleTimeString('en-US', { hour12: false })
  });

  const paymentModes = [
    { id: 'Cash', icon: Banknote },
    { id: 'UPI', icon: Calculator },
    { id: 'Bank Transfer', icon: Building2 },
    { id: 'Card', icon: CreditCard }
  ];

  useEffect(() => {
    // Generate Receipt Number automatically
    const generateReceiptNo = async () => {
      try {
        const year = new Date().getFullYear();
        const prefix = `SPT-${year}-`;
        
        // Fetch the last receipt to increment the number
        const receiptsRef = ref(db, 'receipts');
        const lastReceiptQuery = query(receiptsRef, limitToLast(1));
        
        const snapshot = await get(lastReceiptQuery);
        let newNum = 1;
        
        if (snapshot.exists()) {
          const lastData = snapshot.val();
          const lastKey = Object.keys(lastData)[0];
          const lastReceipt = lastData[lastKey];
          
          if (lastReceipt.receiptNo && lastReceipt.receiptNo.startsWith(prefix)) {
            const lastNumStr = lastReceipt.receiptNo.split('-').pop();
            const lastNum = parseInt(lastNumStr, 10);
            if (!isNaN(lastNum)) {
              newNum = lastNum + 1;
            }
          }
        }
        
        const formattedNum = newNum.toString().padStart(4, '0');
        setFormData(prev => ({ ...prev, receiptNo: `${prefix}${formattedNum}` }));
      } catch (err) {
        console.error("Error generating receipt number:", err);
        // Fallback pattern if firebase fails
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setFormData(prev => ({ ...prev, receiptNo: `SPT-${new Date().getFullYear()}-${randomNum}` }));
      }
    };
    
    generateReceiptNo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const baseAmt = parseFloat(formData.amount) || 0;
    const gstPct = parseFloat(formData.gst) || 0;
    const gstAmt = (baseAmt * gstPct) / 100;
    return baseAmt + gstAmt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const receiptsRef = ref(db, 'receipts');
      const newReceiptRef = push(receiptsRef);
      
      const totalAmount = calculateTotal();
      
      const receiptData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        gst: parseFloat(formData.gst) || 0,
        totalAmount: totalAmount,
        status: 'Paid',
        timestamp: Date.now()
      };

      await set(newReceiptRef, receiptData);
      
      // Navigate to view receipt
      navigate(`/receipt/${newReceiptRef.key}`);
    } catch (err) {
      console.error("Error saving receipt:", err);
      setError('Failed to save receipt. Please check your database connection.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Create New Receipt</h1>
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-700 bg-white p-2 rounded-full border border-slate-200 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Form Header info */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Receipt No. *</label>
            <input
              type="text"
              name="receiptNo"
              required
              value={formData.receiptNo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all font-bold text-[#0056b3]"
              placeholder="e.g. SPT-2026-0001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date (DD/MM/YYYY) *</label>
            <input
              type="text"
              name="createdDate"
              required
              value={formData.createdDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all font-semibold text-slate-800"
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Student Details */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Student Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                  placeholder="10-digit number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                  placeholder="Full address"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Fee Details */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Fee Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Course / Program Name *</label>
                <input
                  type="text"
                  name="productName"
                  required
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                  placeholder="e.g. Web Development Service"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Fee Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                  placeholder="Detailed description of the service/product"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all font-mono"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST % (Optional)</label>
                <select
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
          </section>

          {/* Payment Details */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Mode *</label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentModes.map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = formData.paymentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMode: mode.id }))}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-[#e6f0fa] border-[#0056b3] text-[#0056b3] font-semibold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{mode.id}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Transaction ID / Reference No. {formData.paymentMode === 'Cash' ? '(Optional)' : '*'}
                </label>
                <input
                  type="text"
                  name="transactionId"
                  required={formData.paymentMode !== 'Cash'}
                  value={formData.transactionId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all font-mono uppercase"
                  placeholder="e.g. TXN123456789"
                />
              </div>
            </div>
          </section>

          {/* Summary Box */}
          <div className="bg-[#f8fafc] p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Base Amount:</span>
              <span className="font-mono font-medium">₹{parseFloat(formData.amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <span className="text-slate-600">GST ({formData.gst}%):</span>
              <span className="font-mono font-medium">₹{((parseFloat(formData.amount || 0) * parseFloat(formData.gst || 0)) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800">Total Amount:</span>
              <span className="text-2xl font-bold text-[#0056b3] font-mono">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0056b3] text-white rounded-lg font-medium hover:bg-[#004494] transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save & Generate Receipt
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReceipt;
