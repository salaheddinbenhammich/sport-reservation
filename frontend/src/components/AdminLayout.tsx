// Import React hooks - useState manages sidebar open/close state
import React, { useState } from 'react';
// Import Link and useLocation from react-router-dom for navigation
import { Link, useLocation, useNavigate } from 'react-router-dom';
// Import useAuth to get current user info
import { useAuth } from '../context/AuthContext';
// Import icons from lucide-react library (icons we'll use in the sidebar)
import { 
  LayoutDashboard, 
  MapPin, 
  Clock, 
  Menu, 
  X, 
  LogOut,
  Home,
  UserCircle,
  FileText
} from 'lucide-react';

// Define props interface - tells TypeScript what props this component accepts
interface AdminLayoutProps {
  // children is the admin page content that will be displayed inside this layout
  children: React.ReactNode;
}

// Export the AdminLayout component
export default function AdminLayout({ children }: AdminLayoutProps) {
  // State to control mobile sidebar visibility
  // useState(false) means sidebar starts closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get current location/pathname from router (e.g., '/admin/dashboard')
  // Used to highlight which menu item is active
  const location = useLocation();
  
  // Get navigate function to programmatically navigate
  const navigate = useNavigate();
  
  // Get user and logout function from auth context
  const { user, logout } = useAuth();

  // Function to handle logout
  const handleLogout = () => {
    logout(); // Clear token and user data
    navigate('/'); // Redirect to home page
  };

  // Array of sidebar menu items
  // Each item has: name (display text), path (URL route), icon (Lucide icon component)
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Stadiums', path: '/admin/stadiums', icon: MapPin },
    { name: 'Sessions', path: '/admin/sessions', icon: Clock },
    { name: 'Reservations', path: '/admin/reservations', icon: FileText },
    // Add a Profile link so admins can update their own profile
    { name: 'Profile', path: '/admin/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Mobile menu button and logo */}
            <div className="flex items-center">
              {/* Mobile menu toggle button */}
              <button
                // onClick event handler - runs when button is clicked
                onClick={() => setSidebarOpen(!sidebarOpen)}
                // className applies Tailwind CSS styles
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {/* Conditional rendering: show X icon if sidebar is open, Menu icon if closed */}
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Admin Dashboard Title */}
              <h1 className="ml-4 text-xl font-bold text-green-600">
                Admin Dashboard
              </h1>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center gap-4">
              {/* Display current user's username */}
              <span className="text-sm text-gray-700 hidden sm:block">
                {user?.username}
              </span>
              
              {/* Link to go back to user view (regular website) */}
              <Link
                to="/"
                className="p-2 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors"
                title="Back to Website"
              >
                <Home size={20} />
              </Link>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container - Sidebar + Content */}
      <div className="flex pt-16">
        {/* Sidebar Navigation */}
        <aside
          className={`
            // Base styles for sidebar
            fixed lg:static inset-y-0 left-0 z-40 pt-16
            // Background and border
            bg-white shadow-lg lg:shadow-none
            // Width: full on mobile when open, 0 when closed, 64 units on desktop
            w-64 transform transition-transform duration-200 ease-in-out
            // Hide sidebar on mobile by default, show on desktop
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Sidebar Content */}
          <div className="h-full px-4 py-6 overflow-y-auto">
            {/* Menu Items List */}
            <nav className="space-y-2">
              {/* Loop through menuItems array and create a link for each */}
              {menuItems.map((item) => {
                // Get the Icon component from the item
                const Icon = item.icon;
                
                // Check if this menu item's path matches current location
                // Used to highlight active menu item
                const isActive = location.pathname === item.path;
                
                return (
                  // Link component - navigates to different routes
                  <Link
                    key={item.path} // React needs unique key for list items
                    to={item.path}
                    // Close mobile sidebar when clicking a link
                    onClick={() => setSidebarOpen(false)}
                    // Apply different styles if this is the active page
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      // If active: green background and text, if not: gray hover with green accent
                      ${isActive 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                      }
                    `}
                  >
                    {/* Icon component - renders the Lucide icon */}
                    <Icon size={20} />
                    {/* Menu item text */}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Close sidebar overlay on mobile when clicked */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Render the admin page content here (whatever is passed as children) */}
          {children}
        </main>
      </div>
    </div>
  );
}