import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateReceipt from './pages/CreateReceipt';
import AllReceipts from './pages/AllReceipts';
import ViewReceipt from './pages/ViewReceipt';
import EditReceipt from './pages/EditReceipt';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateReceipt />} />
          <Route path="receipts" element={<AllReceipts />} />
          <Route path="receipt/:id" element={<ViewReceipt />} />
          <Route path="edit/:id" element={<EditReceipt />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

