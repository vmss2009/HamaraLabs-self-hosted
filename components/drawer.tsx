'use client';

import React, { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { signOutAction } from "@/app/actions";

const Drawer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

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
                <nav className="flex flex-col h-full p-4">
                    <div className="space-y-6 mt-12">
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

                        {/* Chat */}
                        <div className="p-3 rounded-md bg-blue-800">
                            <h3 className="text-lg font-semibold mb-2 text-white">Tinkering activities</h3>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link
                                        href="/protected/chat"
                                        className="block bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors"
                                    >
                                        Chat
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-auto mb-4">
                        <button
                            onClick={signOutAction}
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