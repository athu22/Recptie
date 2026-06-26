import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Edit } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { generatePDF } from '../utils/pdfGenerator';
import signImage from '../assets/sign.png';

const ViewReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [profile, setProfile] = useState({
    companyName: 'SOFTSPERA',
    tagline: 'Technology',
    description: 'Software & IT Solutions',
    phone: '+91 98765 43210',
    email: 'info@softspera.com',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const receiptRef = ref(db, `receipts/${id}`);
        const profileRef = ref(db, 'settings/companyProfile');

        const [receiptSnap, profileSnap] = await Promise.all([
          get(receiptRef),
          get(profileRef)
        ]);

        if (receiptSnap.exists()) {
          setReceipt(receiptSnap.val());
        } else {
          console.error("No receipt available");
        }

        if (profileSnap.exists()) {
          setProfile(profileSnap.val());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownload = async () => {
    await generatePDF(receipt, profile, 'download');
  };

  const handlePrint = async () => {
    await generatePDF(receipt, profile, 'print');
  };

  const formatCurrency = (amount) => {
    return Number(amount).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056b3]"></div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">Receipt Not Found</h2>
        <p className="text-slate-500 mt-2">The receipt you are looking for does not exist or has been deleted.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center text-[#0056b3] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isClient = receipt.receiptType === 'Client';
  const amt = parseFloat(receipt.amount) || 0;
  const tot = parseFloat(receipt.totalAmount) || 0;
  const taxAmount = tot - amt;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <Link
            to={`/edit/${id}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0056b3] text-white rounded-lg font-medium hover:bg-[#004494] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* A4 Format Receipt Card */}
      <div className="flex justify-center print-only w-full">
        <div
          className="bg-white w-full max-w-[210mm] min-h-[297mm] p-10 sm:p-14 relative text-[13px] text-gray-800 border-2 border-gray-600 print:border-2 print:border-gray-600"
          style={{
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <img src="/softspera.png" alt="Logo" className="h-16 w-auto object-contain" />
              <div className="flex flex-col justify-center">
                <span className="text-3xl font-black text-gray-900 tracking-tight uppercase">{profile?.companyName || 'SOFTSPERA'}</span>
                {profile?.tagline && <span className="text-sm font-bold text-gray-500 tracking-widest uppercase mt-1.5">{profile.tagline}</span>}
              </div>
            </div>
            <h1 className="text-[36px] font-bold text-[#F97316]">RECEIPT</h1>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Left - Seller */}
            <div>
              <h3 className="font-bold text-[#1d4ed8] text-[15px] mb-3">Seller</h3>
              <div className="space-y-1 text-gray-900 leading-snug">
                <p className="font-medium">{profile?.companyName || 'SOFTSPERA'}</p>
                {profile?.tagline && <p>{profile.tagline}</p>}
                {profile?.phone && <p>Phone: {profile.phone}</p>}
                {profile?.email && <p>Email: {profile.email}</p>}
              </div>
            </div>
            {/* Right - Meta */}
            <div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-right">
                <span className="text-left font-medium text-gray-700">Receipt Number</span>
                <span className="border-b border-gray-300 pb-1">{receipt.receiptNo}</span>

                <span className="text-left font-medium text-gray-700">Receipt Date</span>
                <span className="border-b border-gray-300 pb-1">{receipt.createdDate}</span>

                <span className="text-left font-medium text-gray-700">Payment Method</span>
                <span className="border-b border-gray-300 pb-1">{receipt.paymentMode}</span>

                {receipt.transactionId && (
                  <>
                    <span className="text-left font-medium text-gray-700">Transaction ID</span>
                    <span className="border-b border-gray-300 pb-1">{receipt.transactionId}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="flex justify-end mb-10">
            <div className="w-1/2 ml-4">
              <h3 className="font-bold text-[#1d4ed8] text-[15px] mb-3">{isClient ? 'Customer' : 'Student'}</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-right">
                <span className="text-left font-medium text-gray-700">Name</span>
                <span className="border-b border-gray-300 pb-1">{receipt.customerName}</span>

                <span className="text-left font-medium text-gray-700">Mobile</span>
                <span className="border-b border-gray-300 pb-1">{receipt.mobile}</span>

                {!isClient && receipt.college && (
                  <>
                    <span className="text-left font-medium text-gray-700">College</span>
                    <span className="border-b border-gray-300 pb-1">{receipt.college}</span>
                  </>
                )}
                {!isClient && receipt.domain && (
                  <>
                    <span className="text-left font-medium text-gray-700">Domain</span>
                    <span className="border-b border-gray-300 pb-1">{receipt.domain}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-16">
            <table className="w-full border-collapse border border-gray-300 text-[13px]">
              <thead>
                <tr className="bg-[#40c4c4] text-white">
                  <th className="border border-gray-300 px-2 py-3 text-center w-24">QUANTITY</th>
                  <th className="border border-gray-300 px-3 py-3 text-left">DESCRIPTION</th>
                  <th className="border border-gray-300 px-2 py-3 text-center w-28">UNIT PRICE</th>
                  <th className="border border-gray-300 px-2 py-3 text-center w-28">SUBTOTAL</th>
                  <th className="border border-gray-300 px-2 py-3 text-center w-28">TAX</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-3 text-center">1</td>
                  <td className="border border-gray-300 px-3 py-3 whitespace-pre-wrap">
                    <div className="font-medium">{receipt.productName}</div>
                    {receipt.description && <div className="text-gray-600 mt-1">{receipt.description}</div>}
                  </td>
                  <td className="border border-gray-300 px-2 py-3 text-center">{formatCurrency(amt)}</td>
                  <td className="border border-gray-300 px-2 py-3 text-center">{formatCurrency(amt)}</td>
                  <td className="border border-gray-300 px-2 py-3 text-center">{formatCurrency(taxAmount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="border border-gray-300 px-4 py-4 align-top whitespace-pre-wrap text-[11px] text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-800 text-[12px] block mb-1">Notes:</span>
                    {isClient ? (
                      '• Payments once received are generally non-refundable unless otherwise agreed.\n• Additional work outside the agreed scope will be billed separately.\n• Source code and ownership will be transferred after full payment.\n• The client should preserve this receipt for future reference.'
                    ) : (
                      '• Internship fees are non-refundable and non-transferable.\n• Enrollment is confirmed only after successful fee payment.\n• Certificates will be issued only upon successful completion.\n• Any misconduct may result in termination without refund.'
                    )}
                  </td>
                  <td colSpan="2" className="border border-gray-300 p-0 align-top">
                    <div className="flex border-b border-gray-300 h-[33.33%]">
                      <div className="w-1/2 px-3 py-2 font-bold border-r border-gray-300 bg-gray-50 flex items-center">SUBTOTAL</div>
                      <div className="w-1/2 px-3 py-2 text-right flex items-center justify-end">{formatCurrency(amt)}</div>
                    </div>
                    <div className="flex border-b border-gray-300 h-[33.33%]">
                      <div className="w-1/2 px-3 py-2 font-bold border-r border-gray-300 bg-gray-50 flex items-center">TAX ({receipt.gst}%)</div>
                      <div className="w-1/2 px-3 py-2 text-right flex items-center justify-end">{formatCurrency(taxAmount)}</div>
                    </div>
                    <div className="flex h-[33.33%]">
                      <div className="w-1/2 px-3 py-2 font-bold border-r border-gray-300 bg-gray-50 flex items-center">TOTAL</div>
                      <div className="w-1/2 px-3 py-2 text-right font-bold flex items-center justify-end">{formatCurrency(tot)}</div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-between items-end text-center mt-auto pt-8">
            <div className="w-56 border-t border-gray-300 pt-3">
              Salesperson
            </div>
            <div className="w-56 border-t border-gray-300 pt-3 relative">
              <img src={signImage} alt="Signature" className="absolute bottom-10 left-0 right-0 mx-auto h-20 object-contain mix-blend-multiply opacity-80" />
              Signature
            </div>
          </div>

          <div className="text-center mt-16 text-[17px] font-bold text-[#F97316]">
            Thank you for the payment!
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewReceipt;
