
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    Settings,
    BarChart,
    Briefcase,
    History,
    Scale,
    Menu,
    FileText
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
    { label: 'Dashboard', icon: BarChart, href: '/' },
    { label: 'Hiring Roles', icon: Briefcase, href: '/forms' },
    { label: 'Intake Queue', icon: FileText, href: '/intake' },
    { label: 'Evaluations', icon: Users, href: '/evaluations' },
    { label: 'Fairness Audit', icon: Scale, href: '/fairness' },
    { label: 'Comparison', icon: History, href: '/comparison' },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-12 h-screen w-64 border-r bg-background hidden md:block", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        HolisticAI
                    </h2>
                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                            >
                                <NavLink
                                    to={item.href}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-2",
                                        isActive ? "bg-secondary" : ""
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Configuration
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <NavLink to="/prompts" className={({ isActive }) => cn("flex items-center gap-2", isActive ? "bg-secondary" : "")}>
                                <Settings className="h-4 w-4" />
                                System Prompts
                            </NavLink>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <NavLink to="/emails" className={({ isActive }) => cn("flex items-center gap-2", isActive ? "bg-secondary" : "")}>
                                <Settings className="h-4 w-4" />
                                Email Templates
                            </NavLink>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <Sidebar className="block w-full border-none" />
            </SheetContent>
        </Sheet>
    )
}
