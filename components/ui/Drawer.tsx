'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Element, useAppAbility, useAbilityMeta } from "@/components/authz";

type NavItem = { key: string; href: string; label: string };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
    {
        title: "Student",
        items: [
            { key: "nav.student-snapshot", href: "/protected/student-snapshot", label: "Snapshot" },
            { key: "nav.tasks", href: "/protected/tasks", label: "Tasks" },
        ],
    },
    {
        title: "Sarthi",
        items: [{ key: "nav.sarthi", href: "/protected/sarthi", label: "Dashboard" }],
    },
    {
        title: "Cluster",
        items: [
            { key: "nav.cluster.form", href: "/protected/cluster/form", label: "Form" },
            { key: "nav.cluster.report", href: "/protected/cluster/report", label: "Report" },
        ],
    },
    {
        title: "Visits",
        items: [{ key: "nav.school-visits.form", href: "/protected/school-visits/form", label: "Form" }],
    },
    {
        title: "Student",
        items: [
            { key: "nav.student.form", href: "/protected/student/form", label: "Form" },
            { key: "nav.student.report", href: "/protected/student/report", label: "Report" },
        ],
    },
    {
        title: "School",
        items: [
            { key: "nav.school.form", href: "/protected/school/form", label: "Form" },
            { key: "nav.school.report", href: "/protected/school/report", label: "Report" },
        ],
    },
    {
        title: "Mentor",
        items: [
            { key: "nav.mentor.form", href: "/protected/mentor/form", label: "Form" },
            { key: "nav.mentor.report", href: "/protected/mentor/report", label: "Report" },
        ],
    },
    {
        title: "Tinkering activities",
        items: [
            { key: "nav.tinkering-activity.form", href: "/protected/tinkering-activity/form", label: "Form" },
            { key: "nav.tinkering-activity.report", href: "/protected/tinkering-activity/report", label: "Report" },
        ],
    },
    {
        title: "Competitions",
        items: [
            { key: "nav.competition.form", href: "/protected/competition/form", label: "Form" },
            { key: "nav.competition.report", href: "/protected/competition/report", label: "Report" },
        ],
    },
    {
        title: "Course",
        items: [
            { key: "nav.course.form", href: "/protected/course/form", label: "Form" },
            { key: "nav.course.report", href: "/protected/course/report", label: "Report" },
        ],
    },
    {
        title: "Calendar",
        items: [{ key: "nav.calendar", href: "/protected/calendar", label: "Calendar" }],
    },
    {
        title: "Chats",
        items: [{ key: "nav.chats", href: "/protected/chats", label: "Chats" }],
    },
];

function NavLinkItem({
    item,
    onClick,
}: {
    item: NavItem;
    onClick: () => void;
}) {
    return (
        <Element subject="Drawer" elementKey={item.key}>
            <li>
                <Link
                    href={item.href}
                    className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                    onClick={onClick}
                >
                    {item.label}
                </Link>
            </li>
        </Element>
    );
}

function NavSectionView({
    section,
    onClick,
}: {
    section: NavSection;
    onClick: () => void;
}) {
    const ability = useAppAbility();
    const anyVisible = section.items.some((i) =>
        ability.can("view", "Drawer", i.key),
    );
    if (!anyVisible) return null;

    return (
        <div className="p-3 rounded-md bg-blue-800">
            <h3 className="text-lg font-semibold mb-2 text-white">{section.title}</h3>
            <ul className="flex flex-col gap-4">
                {section.items.map((item) => (
                    <NavLinkItem key={item.key} item={item} onClick={onClick} />
                ))}
            </ul>
        </div>
    );
}

const Drawer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();
    const { ready } = useAbilityMeta();

    const toggleDrawer = () => setIsOpen(o => !o);
    const closeDrawer = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        if (isOpen) closeDrawer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    return (
        <div className="relative">
            <button
                onClick={toggleDrawer}
                className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md focus:outline-none"
                aria-label="Toggle Drawer"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out z-40`}
            >
                <nav className="flex flex-col h-full">
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="mt-12 p-4 bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-400">Signed in as</p>
                            <p className="text-white font-medium truncate">{session?.user?.email}</p>
                        </div>

                        <div className="space-y-6 mt-6">
                            {!ready ? (
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-10 rounded-md bg-gray-700 animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                SECTIONS.map((section, idx) => (
                                    <NavSectionView
                                        key={`${section.title}-${idx}`}
                                        section={section}
                                        onClick={closeDrawer}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-800 bg-gray-900/95 mt-auto">
                        <Element subject="Drawer" elementKey="nav.notifications">
                            <Link
                                href="/protected/notifications"
                                className="mb-3 block w-full rounded bg-cyan-500 py-2 px-4 text-center text-white transition-colors hover:bg-cyan-600"
                                onClick={closeDrawer}
                            >
                                Notifications
                            </Link>
                        </Element>
                        <Element subject="Drawer" elementKey="action.logout">
                            <button
                                onClick={() => { signOut(); }}
                                className="w-full rounded bg-red-600 py-2 px-4 text-white transition-colors hover:bg-red-500"
                            >
                                Logout
                            </button>
                        </Element>
                    </div>
                </nav>
            </div>

            {isOpen && (
                <div
                    onClick={toggleDrawer}
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default Drawer;
