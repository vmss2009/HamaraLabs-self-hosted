'use client';

import React, { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";

const Drawer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

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
                <nav className="flex flex-col h-full p-4 overflow-y-auto">
                    {/* User Info Section */}
                    <div className="mt-12  p-4 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-white font-medium truncate">{session?.user?.email}</p>
                    </div>

                    <div className="space-y-6 mt-6">
                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Student</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/student-snapshot"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Snapshot
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Sarthi</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/sarthi"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Cluster</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/cluster/form"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Form
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/protected/cluster/report"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Report
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Student</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/student/form"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Form
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/protected/student/report"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Report
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">School</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/school/form"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Form
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/protected/school/report"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Report
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Mentor</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/mentor/form"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Form
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/protected/mentor/report"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Report
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Tinkering activities</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/tinkering-activity/form"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Form
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/protected/tinkering-activity/report"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Report
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Competitions</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/competition/form"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Form
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/protected/competition/report"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Report
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 rounded-md bg-blue-800">
                        <h3 className="text-lg font-semibold mb-2 text-white">Course</h3>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Link
                                    href="/protected/course/form"
                                    className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                >
                                    Form
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/protected/course/report"
                                    className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                >
                                    Report
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="p-3 rounded-md bg-blue-800">
                        <h3 className="text-lg font-semibold mb-2 text-white">Visits</h3>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Link
                                    href="/protected/school-visits/form"
                                    className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                >
                                    Form
                                </Link>
                            </li>
                        </ul>
                    </div>
                        
                    </div>
                    <div className="mt-auto mb-4 p-4">
                        <button
                            onClick={() => {signOut()}}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </div>

            {/* Overlay */}
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