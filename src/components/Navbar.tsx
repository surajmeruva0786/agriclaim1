import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Bell, Menu, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import NotificationDialog, { Notification } from './NotificationDialog';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    name: string;
    role: string;
    notifications?: number;
  };
  links?: Array<{ label: string; href: string }>;
  notificationsList?: Notification[];
  onNotificationsChange?: (notifications: Notification[]) => void;
}

export default function Navbar({ user, links = [], notificationsList = [], onNotificationsChange }: NavbarProps) {
  const navigate = useNavigate();
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  const handleMarkAsRead = (id: string) => {
    if (onNotificationsChange) {
      const updatedNotifications = notificationsList.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      onNotificationsChange(updatedNotifications);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onNotificationsChange) {
      const updatedNotifications = notificationsList.map(n => ({ ...n, read: true }));
      onNotificationsChange(updatedNotifications);
    }
  };

  const handleDelete = (id: string) => {
    if (onNotificationsChange) {
      const updatedNotifications = notificationsList.filter(n => n.id !== id);
      onNotificationsChange(updatedNotifications);
    }
  };

  const handleClearAll = () => {
    if (onNotificationsChange) {
      onNotificationsChange([]);
    }
  };

  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Wheat className="w-6 h-6 text-white" />
            </div>
            <span className="gradient-text">AgriClaim</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                {/* Notifications (Farmer only) */}
                {user.role === 'Farmer' && (
                  <button 
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setNotificationDialogOpen(true)}
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-1 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      </>
                    )}
                  </button>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <div className="text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.role}</div>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'Farmer' && (
                      <DropdownMenuItem onClick={() => navigate('/farmer-profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-gray-600 hover:text-primary transition-colors p-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Notification Dialog */}
      <NotificationDialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
        notifications={notificationsList}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />
    </nav>
  );
}
