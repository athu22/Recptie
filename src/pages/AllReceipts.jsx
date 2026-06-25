import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, FileText, PlusCircle } from 'lucide-react';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../firebase';

const AllReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const receiptsRef = ref(db, 'receipts');
      onValue(receiptsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const receiptsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).reverse(); // Newest first
          
          setReceipts(receiptsList);
          setFilteredReceipts(receiptsList);
        } else {
          setReceipts([]);
          setFilteredReceipts([]);
        }
        setLoading(false);
      }, (error) => {
        console.error("Firebase Read Error:", error);
        setLoading(false);
      });
    } catch (e) {
      console.warn("Firebase not configured", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredReceipts(receipts);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = receipts.filter(receipt => 
        (receipt.receiptNo && receipt.receiptNo.toLowerCase().includes(lowercasedSearch)) ||
        (receipt.customerName && receipt.customerName.toLowerCase().includes(lowercasedSearch)) ||
        (receipt.mobile && receipt.mobile.includes(lowercasedSearch))
      );
      setFilteredReceipts(filtered);
    }
  }, [searchTerm, receipts]);

  const handleDelete = async (id, receiptNo) => {
    if (window.confirm(`Are you sure you want to delete receipt ${receiptNo}?`)) {
      try {
        const receiptRef = ref(db, `receipts/${id}`);
        await remove(receiptRef);
      } catch (err) {
        console.error("Error deleting receipt:", err);
        alert("Failed to delete receipt.");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Receipts</h1>
          <p className="text-slate-500 mt-1">Manage and view all generated receipts.</p>
        </div>
        <Link 
          to="/create" 
          className="inline-flex items-center gap-2 bg-[#0056b3] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#004494] transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Create Receipt
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Receipt No, Name, or Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-[#0056b3] bg-white text-sm transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Receipt Details</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Payment Mode</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0056b3] mb-4"></div>
                      <p>Loading receipts...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-lg font-medium text-slate-600">No receipts found</p>
                      {searchTerm ? (
                        <p className="text-sm mt-1">Try adjusting your search terms</p>
                      ) : (
                        <p className="text-sm mt-1">Create your first receipt to see it here</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0056b3]">{receipt.receiptNo}</div>
                      <div className="text-xs text-slate-500 mt-1">{receipt.createdDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{receipt.customerName}</div>
                      <div className="text-sm text-slate-500">{receipt.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{formatCurrency(receipt.totalAmount)}</div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 mt-1">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {receipt.paymentMode}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/receipt/${receipt.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-md text-[#0056b3] hover:bg-blue-50 transition-colors tooltip"
                        title="View & Print"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(receipt.id, receipt.receiptNo)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Receipt"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <span>Showing {filteredReceipts.length} receipt{filteredReceipts.length !== 1 && 's'}</span>
        </div>
      </div>
    </div>
  );
};

export default AllReceipts;
