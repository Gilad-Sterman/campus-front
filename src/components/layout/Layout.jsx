import React from 'react';
import Header from './Header';
import Footer from './Footer';
import NotificationToasts from './NotificationToasts';
import PendingUserApplicationProcessor from './PendingUserApplicationProcessor';

const Layout = ({ children }) => {
  return (
    <div className="app">
      <NotificationToasts />
      <PendingUserApplicationProcessor />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
