import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h1>CMS</h1>
        </div>
        <ul className="nav-menu">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/members">Members</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/financial">Financial</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/communications">Communications</Link></li>
          <li><Link to="/reports">Reports</Link></li>
        </ul>
      </nav>
      <main className="main-content">
        <header className="top-bar">
          <h2>Church Management System</h2>
          <div className="user-menu">
            <span>Admin User</span>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;

