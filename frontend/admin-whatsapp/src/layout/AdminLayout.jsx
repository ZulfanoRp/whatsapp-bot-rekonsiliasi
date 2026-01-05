import Sidebar from '../components/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24 }}>
        {children}
      </div>
    </div>
  );
}
