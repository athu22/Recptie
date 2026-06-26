import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { Save, X, Calculator, CreditCard, Banknote, Building2, User, Briefcase } from 'lucide-react';

const EditReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    receiptType: 'Student', // Default
    receiptNo: '',
    customerName: '',
    mobile: '',
    address: '',
    college: '',
    branch: '',
    domain: '',
    duration: '',
    batch: '',
    mentor: '',
    productName: '',
    description: '',
    amount: '',
    gst: '0',
    paymentMode: 'Cash',
    transactionId: '',
    createdDate: '',
    createdTime: ''
  });

  const paymentModes = [
    { id: 'Cash', icon: Banknote },
    { id: 'UPI', icon: Calculator },
    { id: 'Bank Transfer', icon: Building2 },
    { id: 'Card', icon: CreditCard }
  ];

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const receiptRef = ref(db, `receipts/${id}`);
        const snapshot = await get(receiptRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFormData({
            ...data,
            receiptType: data.receiptType || 'Student', // Handle old receipts
            amount: data.amount ? data.amount.toString() : '',
            gst: data.gst ? data.gst.toString() : '0'
          });
        } else {
          setError('Receipt not found.');
        }
      } catch (err) {
        console.error("Error fetching receipt:", err);
        setError('Failed to fetch receipt data.');
      } finally {
        setFetching(false);
      }
    };
    
    fetchReceipt();
  }, [id]);

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
      const receiptRef = ref(db, `receipts/${id}`);
      const totalAmount = calculateTotal();
      
      const receiptData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        gst: parseFloat(formData.gst) || 0,
        totalAmount: totalAmount,
        updatedTimestamp: Date.now()
      };

      await update(receiptRef, receiptData);
      navigate(`/receipt/${id}`);
    } catch (err) {
      console.error("Error updating receipt:", err);
      setError('Failed to update receipt. Please check your database connection.');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056b3]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Edit Receipt</h1>
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
        
        {/* Receipt Type Selection */}
        <div className="bg-white p-6 border-b border-slate-100 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, receiptType: 'Student' }))}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all font-semibold ${
              formData.receiptType === 'Student' 
                ? 'border-[#0056b3] bg-[#f0f7ff] text-[#0056b3]' 
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <User className="w-5 h-5" />
            Student Internship
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, receiptType: 'Client' }))}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all font-semibold ${
              formData.receiptType === 'Client' 
                ? 'border-[#0056b3] bg-[#f0f7ff] text-[#0056b3]' 
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Client Project
          </button>
        </div>

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
            />
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Details Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              {formData.receiptType === 'Student' ? 'Student Details' : 'Client Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {formData.receiptType === 'Student' ? 'Student Name *' : 'Client / Company Name *'}
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
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
                />
              </div>

              {formData.receiptType === 'Student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
                    <input type="text" name="college" value={formData.college || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                    <input type="text" name="branch" value={formData.branch || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Internship Domain</label>
                    <input type="text" name="domain" value={formData.domain || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                    <input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch</label>
                    <input type="text" name="batch" value={formData.batch || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mentor</label>
                    <input type="text" name="mentor" value={formData.mentor || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all" />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Fee Details */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              {formData.receiptType === 'Student' ? 'Fee Details' : 'Project Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {formData.receiptType === 'Student' ? 'Course / Program Name *' : 'Project Name *'}
                </label>
                <input
                  type="text"
                  name="productName"
                  required
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {formData.receiptType === 'Student' ? 'Fee Description' : 'Project Scope / Description'}
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] outline-none transition-all"
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
            onClick={() => navigate(-1)}
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
            Update Receipt
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReceipt;
