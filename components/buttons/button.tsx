'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return (
        <button {...props} className="p-2 bg-blue-500 text-white rounded">
            {children}
        </button>
    );
};

export default Button;