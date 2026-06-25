import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Users, TrendingUp, Calendar, ArrowRight, Search, Eye, PlusCircle } from 'lucide-react';
import { ref, onValue, query, limitToLast, orderByChild } from 'firebase/database';
import { db } from '../firebase';

const Dashboard = () => {
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalCollection: 0,
    todayCollection: 0,
    monthlyCollection: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder logic for Firebase fetching
    // In a real app, you would ensure valid Firebase config before calling this
    try {
      const receiptsRef = query(ref(db, 'receipts'));
      onValue(receiptsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const receiptsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).reverse(); // Reverse for newest first

          setReceipts(receiptsList);
          
          // Calculate stats
          let totalColl = 0;
          let todayColl = 0;
          let monthColl = 0;
          const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
          const currentMonthYear = today.substring(3); // MM/YYYY

          receiptsList.forEach(r => {
            const amount = Number(r.totalAmount) || 0;
            totalColl += amount;
            
            if (r.createdDate === today) {
              todayColl += amount;
            }
            
            if (r.createdDate && r.createdDate.substring(3) === currentMonthYear) {
              monthColl += amount;
            }
          });

          setStats({
            totalReceipts: receiptsList.length,
            totalCollection: totalColl,
            todayCollection: todayColl,
            monthlyCollection: monthColl
          });
        }
        setLoading(false);
      }, (error) => {
        console.error("Firebase Read Error:", error);
        setLoading(false);
      });
    } catch (e) {
      console.warn("Firebase config not set up properly yet", e);
      setLoading(false);
    }
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Collection',
      value: formatCurrency(stats.totalCollection),
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: "Today's Collection",
      value: formatCurrency(stats.todayCollection),
      icon: IndianRupee,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Monthly Collection',
      value: formatCurrency(stats.monthlyCollection),
      icon: Calendar,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Receipts',
      value: stats.totalReceipts.toString(),
      icon: Users,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back! 👋</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your receipts today.</p>
        </div>
        <Link 
          to="/create" 
          className="inline-flex items-center justify-center gap-2 bg-[#0056b3] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#004494] transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Receipt
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 transition-all hover:shadow-md">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${card.bgColor}`}>
                <Icon className={`w-7 h-7 ${card.textColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Receipts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Receipts</h2>
          <Link to="/receipts" className="text-[#0056b3] text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="px-6 py-4 font-medium">Receipt No</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Product / Service</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No receipts found. Create your first receipt to see it here.
                  </td>
                </tr>
              ) : (
                receipts.slice(0, 5).map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{receipt.receiptNo}</td>
                    <td className="px-6 py-4 text-slate-600">{receipt.createdDate}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{receipt.customerName}</div>
                      <div className="text-xs text-slate-500">{receipt.mobile}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{receipt.productName}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{formatCurrency(receipt.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/receipt/${receipt.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-md text-[#0056b3] hover:bg-blue-50 transition-colors"
                        title="View Receipt"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
