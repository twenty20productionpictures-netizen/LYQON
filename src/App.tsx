import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LyqonLanding from "./pages/LyqonLanding";
import "./pages/LyqonLanding.css";
import TalentDashboard from "./pages/TalentDashboard";
import DirectorDashboard from "./pages/DirectorDashboard";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import PostProjectPage from "./pages/PostProjectPage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import ProfilePage from "./pages/ProfilePage";
import ForumsPage from "./pages/ForumsPage";
import ForumThreadPage from "./pages/ForumThreadPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
        <Route path="/" element={<LyqonLanding />} />
        <Route path="/old-home" element={<Index />} />
            <Route 
              path="/dashboard/talent" 
              element={
                <ProtectedRoute requiredUserType="talent">
                  <TalentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/director" 
              element={
                <ProtectedRoute requiredUserType="director">
                  <DirectorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/new" 
              element={
                <ProtectedRoute requiredUserType="director">
                  <PostProjectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post-project" 
              element={
                <ProtectedRoute requiredUserType="director">
                  <PostProjectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discovery" 
              element={
                <ProtectedRoute>
                  <DiscoveryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forums" 
              element={
                <ProtectedRoute>
                  <ForumsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forums/:threadId" 
              element={
                <ProtectedRoute>
                  <ForumThreadPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
