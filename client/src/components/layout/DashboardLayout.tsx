import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar - Fixed/Sticky */}
            <Sidebar />

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 min-w-0 border-r border-border/40">
                <div className="container max-w-5xl mx-auto px-4 py-8 md:px-8">
                    {children}
                </div>
            </main>

            {/* Right Sidebar - Fixed/Sticky (Hidden on smaller screens) */}
            <RightSidebar />
        </div>
    );
}
