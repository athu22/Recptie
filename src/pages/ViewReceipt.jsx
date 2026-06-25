import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Building2, User, FileText, IndianRupee, Edit } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { generatePDF } from '../utils/pdfGenerator';
import numWords from 'num-words';
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

  const handlePrint = () => {
    // Use native browser print which prints the beautiful web preview
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getAmountInWords = (amount) => {
    try {
      return numWords(Math.round(amount)).toUpperCase() + ' RUPEES ONLY';
    } catch (e) {
      return `RUPEES ${amount}`;
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      {/* Web Preview of Receipt */}
      <div
        className="bg-white mx-auto shadow-xl overflow-hidden relative print-only"
        style={{ 
          WebkitPrintColorAdjust: 'exact', 
          printColorAdjust: 'exact',
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Geometric Header SVG */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <svg width="100%" height="160" viewBox="0 0 1000 160" preserveAspectRatio="none">
            {/* Main Top Bar */}
            <rect x="0" y="0" width="1000" height="90" fill="#0277bd" />
            
            {/* Shadow Triangles */}
            <polygon points="120,90 180,90 150,130" fill="#222222" />
            <polygon points="200,90 260,90 230,130" fill="#222222" />

            {/* Leftmost Ribbon (Light Blue) */}
            <polygon points="0,0 80,0 180,130 100,130" fill="#03a9f4" />
            
            {/* Middle Ribbon (Main Blue) */}
            <polygon points="80,0 160,0 260,130 180,130" fill="#0277bd" />
          </svg>
        </div>

        {/* Company Header Overlay */}
        <div className="absolute top-0 left-0 w-full h-[90px] px-12 flex justify-between items-center z-20 text-white">
          {/* Left: Logo and Name */}
          <div className="flex items-center gap-4">
            <img src="/softspera.png" alt="Company Logo" className="h-20 w-20 object-contain" />
            <div>
              <h2 className="text-lg font-black tracking-wider uppercase">{profile?.companyName || 'Company Name'}</h2>
              {profile?.tagline && <p className="text-[10px] text-blue-100 uppercase tracking-widest">{profile.tagline}</p>}
            </div>
          </div>

          {/* Right: Contact Details */}
          <div className="text-right text-[10px] space-y-0.5 font-medium opacity-95 tracking-wide">
            {profile?.phone && <p>📞 {profile.phone}</p>}
            {profile?.email && <p>✉️ {profile.email}</p>}
            {profile?.website && <p>🌐 {profile.website}</p>}
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-12 pb-20">
          {/* Spacer to push content below absolute SVG header without collapsing in print */}
          <div className="h-[140px] w-full" aria-hidden="true"></div>
          
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-[54px] leading-none font-black text-[#0277bd] tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
              FEE RECEIPT
            </h1>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between items-start mb-10 text-[#0277bd] font-bold text-sm tracking-widest">
            <div className="space-y-1">
              <p className="uppercase">ISSUED TO:</p>
              <div className="text-slate-800 font-medium tracking-normal text-base mt-2">
                <p className="font-bold text-lg">{receipt.customerName}</p>
                <p>{receipt.mobile}</p>
                {receipt.address && <p className="whitespace-pre-wrap">{receipt.address}</p>}
              </div>
            </div>
            <div className="space-y-3 text-right">
              <div>
                <span className="uppercase inline-block w-28 text-left">RECEIPT NO:</span>
                <span className="text-slate-800 tracking-normal">{receipt.receiptNo}</span>
              </div>
              <div>
                <span className="uppercase inline-block w-28 text-left">DATE:</span>
                <span className="text-slate-800 tracking-normal">{receipt.createdDate}</span>
              </div>
              <div className="pt-2 flex flex-col items-end">
                <span className="text-xs text-slate-500 tracking-normal font-normal">Payment Mode: {receipt.paymentMode}</span>
                {receipt.transactionId && <span className="text-[10px] text-slate-400 tracking-normal font-mono">TXN: {receipt.transactionId}</span>}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-10">
            <table className="w-full text-left border-collapse border-b border-[#0277bd]">
              <thead>
                <tr className="bg-[#0277bd] text-white uppercase text-sm tracking-widest">
                  <th className="py-3 px-4 font-bold w-1/2">FEE DETAILS</th>
                  <th className="py-3 px-4 font-bold border-l border-white/20 text-center w-1/4">AMOUNT</th>
                  <th className="py-3 px-4 font-bold border-l border-white/20 text-right w-1/4">TOTAL</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                <tr>
                  <td className="py-5 px-4 border-l border-r border-[#0277bd]">
                    <p className="font-bold">{receipt.productName}</p>
                    {receipt.description && <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{receipt.description}</p>}
                  </td>
                  <td className="py-5 px-4 border-r border-[#0277bd] text-center font-medium">
                    {formatCurrency(receipt.amount)}
                  </td>
                  <td className="py-5 px-4 border-r border-[#0277bd] text-right font-medium">
                    {formatCurrency(receipt.amount)}
                  </td>
                </tr>
                {/* Empty filler rows for grid effect like invoice */}
                <tr>
                  <td className="py-4 border border-[#0277bd]"></td>
                  <td className="py-4 border border-[#0277bd]"></td>
                  <td className="py-4 border border-[#0277bd]"></td>
                </tr>
                <tr>
                  <td className="py-4 border-l border-r border-[#0277bd]"></td>
                  <td className="py-4 border-r border-[#0277bd]"></td>
                  <td className="py-4 border-r border-[#0277bd]"></td>
                </tr>
              </tbody>
            </table>
            
            {/* Table Totals & Amount in Words */}
            <div className="flex justify-between items-end mt-4 gap-4">
              {/* Amount in Words */}
              <div className="w-1/2">
                <h4 className="text-[10px] font-bold text-[#0277bd] uppercase tracking-widest mb-1">AMOUNT IN WORDS:</h4>
                <p className="text-xs font-bold text-slate-800 capitalize">{getAmountInWords(receipt.totalAmount || 0).toLowerCase()}</p>
              </div>

              <div className="w-1/3">
                {parseFloat(receipt.gst) > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 px-4 text-sm font-bold text-slate-700 border-b border-slate-200">
                      <span>SUBTOTAL</span>
                      <span>₹{parseFloat(receipt.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-4 text-sm font-bold text-slate-700 mb-2">
                      <span>TAX ({receipt.gst}%)</span>
                      <span>₹{(receipt.totalAmount - receipt.amount).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="bg-[#0277bd] text-white px-4 py-3 flex justify-between items-center font-bold">
                  <span>TOTAL</span>
                  <span>₹{parseFloat(receipt.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 flex justify-between items-end gap-4">
            <div className="w-3/5">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">TERMS & CONDITIONS</h4>
                <ul className="list-disc pl-4 text-[10px] font-medium text-slate-600 space-y-1 leading-relaxed">
                  <li>Fees once paid are non-refundable and non-transferable.</li>
                  <li>Enrollment is confirmed only after successful fee payment.</li>
                  <li>Certificates and completion documents will be issued only upon successful completion of the program and clearance of all dues.</li>
                  <li>Students must adhere to the organization's rules, policies, and code of conduct.</li>
                  <li>Any misconduct may result in termination from the program without a fee refund.</li>
                  <li>The organization reserves the right to modify schedules, curriculum, or program structure when necessary.</li>
                  <li>By making the payment, the student acknowledges and agrees to these terms and conditions.</li>
                </ul>
              </div>
            </div>

            {/* Stamp and Signature positioned on the bottom right */}
            <div className="w-2/5 flex flex-col items-center justify-end relative translate-y-12">
              <div className="transform -rotate-12 opacity-90 absolute -top-4 -left-2 z-20">
                <div className="border-4 border-emerald-500 text-emerald-500 text-xl font-black py-1 px-3 uppercase tracking-widest bg-white/50 backdrop-blur-sm">
                  PAID
                </div>
              </div>
              <div className="w-56 h-32 flex items-center justify-center mb-0 relative z-10 pointer-events-none">
                <img src={signImage} alt="Signature" className="h-full w-full object-contain mix-blend-multiply opacity-90 scale-[2.5] translate-y-6" />
              </div>
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <p className="text-xs font-bold text-[#0277bd] uppercase tracking-wider">Authorized Signature</p>
              <p className="text-[9px] text-slate-500">{profile.companyName}</p>
            </div>
          </div>
        </div>

        {/* Geometric Footer SVG */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <svg width="100%" height="80" viewBox="0 0 1000 80" preserveAspectRatio="none">
            {/* Main Bottom Bar */}
            <rect x="0" y="40" width="1000" height="40" fill="#0277bd" />
            
            {/* Shadow Triangles */}
            <polygon points="760,40 820,40 790,10" fill="#222222" />
            <polygon points="840,40 900,40 870,10" fill="#222222" />

            {/* Middle Ribbon (Main Blue) */}
            <polygon points="760,80 840,80 820,10 740,10" fill="#0277bd" />
            
            {/* Rightmost Ribbon (Light Blue) */}
            <polygon points="840,80 920,80 900,10 820,10" fill="#03a9f4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ViewReceipt;
