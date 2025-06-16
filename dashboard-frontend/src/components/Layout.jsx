import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px 60px' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
