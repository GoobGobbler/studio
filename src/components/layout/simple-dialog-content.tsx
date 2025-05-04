'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

interface SimpleDialogContentProps {
    title: string;
    children: React.ReactNode;
    showOkButton?: boolean;
    onOk?: () => void;
    okText?: string;
    showCancelButton?: boolean;
    onCancel?: () => void;
    cancelText?: string;
    className?: string;
}

export const SimpleDialogContent: React.FC<SimpleDialogContentProps> = ({
    title,
    children,
    showOkButton = true,
    onOk,
    okText = "OK",
    showCancelButton = false,
    onCancel,
    cancelText = "Cancel",
    className
}) => {
    return (
        <div className={`p-4 flex flex-col gap-2 h-full ${className}`}>
            <p className="text-sm font-semibold">{title}</p>
            <div className="flex-grow overflow-auto text-sm">
                {children}
            </div>
            {(showOkButton || showCancelButton) && (
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border-dark">
                    {showCancelButton && onCancel && (
                        <Button className="retro-button" size="sm" onClick={onCancel}>
                            {cancelText}
                        </Button>
                    )}
                    {showOkButton && onOk && (
                         <Button className="retro-button" size="sm" onClick={onOk}>
                            {okText}
                         </Button>
                    )}
                </div>
            )}
        </div>
    );
};
