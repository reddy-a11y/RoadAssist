import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmergencySOSModal from '../components/EmergencySOSModal';

const PublicLayout = () => {
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenSOS={() => setSosOpen(true)} />
      <main className="flex-1">
        <Outlet context={{ onOpenSOS: () => setSosOpen(true) }} />
      </main>
      <Footer />
      <EmergencySOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
};

export default PublicLayout;
