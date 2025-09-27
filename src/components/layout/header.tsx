import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  Info,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "./navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FitnessButton } from "@/components/ui/fitness-button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Workout Completed!",
      message: "Great job on finishing your Upper Body Strength workout",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "New Workout Available",
      message: "Check out the new HIIT Cardio Blast workout plan",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Rest Day Reminder",
      message: "You've worked out 3 days in a row. Consider taking a rest day",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 4,
      type: "info",
      title: "Weekly Goal Update",
      message: "You're 75% toward your weekly exercise goal!",
      time: "1 day ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (notificationId: number) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId: number) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-secondary" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-xl">FitBud AI</span>
        </Link>

        <Navigation className="flex-1 justify-center" />

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications - commented out */}
          {false && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <FitnessButton variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </FitnessButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <FitnessButton
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </FitnessButton>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <div key={notification.id} />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <FitnessButton
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </FitnessButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || user?.email || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export { Header };
