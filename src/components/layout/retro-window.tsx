'use client';

import * as React from 'react';
import { cn } from "@/lib/utils";
import { Maximize2, Minus, X } from "lucide-react";

interface RetroWindowProps {
    id: string;
    title: string;
    children: React.ReactNode;
    className?: string;
    initialPosition?: { top: string; left: string };
    style?: React.CSSProperties;
    onClose?: () => void;
    onMinimize?: () => void;
    isMinimized?: boolean; // Keep track if the window is currently minimized
}

export const RetroWindow = ({
    id: windowId,
    title,
    children,
    className,
    initialPosition = { top: '25%', left: '25%' },
    style,
    onClose,
    onMinimize,
    isMinimized = false, // Default to not minimized
}: RetroWindowProps) => {
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
    const windowRef = React.useRef<HTMLDivElement>(null);
    const [currentStyle, setCurrentStyle] = React.useState<React.CSSProperties>({});

    React.useEffect(() => {
        // Set initial position and style after mount, only if not minimized
        if (windowRef.current && !isMinimized) {
             const parentRect = windowRef.current.parentElement?.getBoundingClientRect();
             const parentHeight = parentRect?.height || window.innerHeight;
             const parentWidth = parentRect?.width || window.innerWidth;

             // Calculate initial pixels, handling potential NaN if parentRect is null early
             const initialTopPercent = parseFloat(initialPosition.top) || 25;
             const initialLeftPercent = parseFloat(initialPosition.left) || 25;
             const initialTopPx = (initialTopPercent / 100) * parentHeight;
             const initialLeftPx = (initialLeftPercent / 100) * parentWidth;


            // Use getComputedStyle to get dimensions *after* rendering if possible
             const computedStyle = window.getComputedStyle(windowRef.current);
             const windowHeight = parseFloat(computedStyle.height) || 100; // Fallback height
             const windowWidth = parseFloat(computedStyle.width) || 150; // Fallback width


            const boundedTop = Math.max(0, Math.min(initialTopPx, parentHeight - windowHeight - 30)); // Account for status bar
            const boundedLeft = Math.max(0, Math.min(initialLeftPx, parentWidth - windowWidth));

            setPosition({ top: boundedTop, left: boundedLeft });
            setCurrentStyle({
                ...style,
                top: `${boundedTop}px`,
                left: `${boundedLeft}px`,
                cursor: 'default',
                position: 'absolute',
                display: 'flex', // Initially visible if not minimized
                zIndex: parseInt(style?.zIndex?.toString() || '10'), // Ensure zIndex is set
             });
        } else if (isMinimized) {
            // If minimized, ensure it's hidden initially
            setCurrentStyle(prevStyle => ({ ...prevStyle, display: 'none' }));
        }
    }, [initialPosition, style, isMinimized]); // Add isMinimized dependency

    React.useEffect(() => {
        // Update style when position changes or dragging state changes
         setCurrentStyle(prevStyle => ({
             ...prevStyle,
             top: `${position.top}px`,
             left: `${position.left}px`,
             cursor: isDragging ? 'grabbing' : 'default',
             display: isMinimized ? 'none' : 'flex', // Control visibility based on isMinimized
        }));
    }, [position, isDragging, isMinimized]); // Add isMinimized dependency


    const bringToFront = () => {
        if (windowRef.current && windowRef.current.parentElement) {
            const siblings = Array.from(windowRef.current.parentElement.children) as HTMLElement[];
            // Filter out the status bar or other non-window elements if necessary
            const windowElements = siblings.filter(el => el.classList.contains('retro-window'));
            const maxZ = windowElements.reduce((max, el) => Math.max(max, parseInt(el.style.zIndex || '10', 10)), 9); // Start zIndex from 10
            const currentZ = parseInt(currentStyle.zIndex?.toString() || '10');

             // Only update if not already the top window (or has default zIndex)
            if (currentZ <= maxZ) {
                setCurrentStyle(prev => ({ ...prev, zIndex: maxZ + 1 }));
            }
        }
    };


    const handleMouseDownTitleBar = (e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent drag if clicking on controls
        if ((e.target as HTMLElement).closest('.retro-window-control')) {
            return;
        }

        if (!windowRef.current) return;

        bringToFront(); // Bring window to front on title bar click/drag start
        setIsDragging(true);
        const rect = windowRef.current.getBoundingClientRect();
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        e.preventDefault(); // Prevent text selection during drag
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !windowRef.current) return;
        const parentRect = windowRef.current.parentElement?.getBoundingClientRect();
        const parentWidth = parentRect?.width || window.innerWidth;
        const parentHeight = parentRect?.height || window.innerHeight;
        const windowWidth = windowRef.current.offsetWidth;
        const windowHeight = windowRef.current.offsetHeight;

        let newTop = e.clientY - dragStart.y;
        let newLeft = e.clientX - dragStart.x;

        // Boundary collision detection (account for status bar)
        const statusBarHeight = 30; // Approximate height
        newTop = Math.max(0, Math.min(newTop, parentHeight - windowHeight - statusBarHeight));
        newLeft = Math.max(0, Math.min(newLeft, parentWidth - windowWidth));

        setPosition({ top: newTop, left: newLeft });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            setCurrentStyle(prev => ({ ...prev, cursor: 'default' }));
        }
    };


    React.useEffect(() => {
        // Attach global listeners for mouse move/up when dragging
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            // Add touch events if needed
            // window.addEventListener('touchmove', handleTouchMove);
            // window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            // window.removeEventListener('touchmove', handleTouchMove);
            // window.removeEventListener('touchend', handleTouchEnd);
        }
        // Cleanup listeners
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            // window.removeEventListener('touchmove', handleTouchMove);
            // window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, dragStart]); // Depend on isDragging and dragStart


    // Render null if the window is minimized (it will be represented in the status bar)
    // Correction: Render with display: none to keep state and allow restoration
    // if (isMinimized) {
    //     return null;
    // }

    return (
        <div
            ref={windowRef}
            id={windowId} // Use the passed id
            className={cn("retro-window", className)} // Removed 'absolute' - handled by style
            style={currentStyle}
            onMouseDown={bringToFront} // Bring to front on any click within the window
            data-window-id={windowId}
        >
            <div
                className="retro-window-titlebar"
                onMouseDown={handleMouseDownTitleBar} // Use specific handler for title bar
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <span>{title}</span>
                <div className="flex space-x-1">
                    {onMinimize && <button className="retro-window-control" onClick={onMinimize} title="Minimize"><Minus size={10} /></button>}
                    {/* TODO: Implement Maximize */}
                    <button className="retro-window-control" title="Maximize (Planned)" disabled><Maximize2 size={10} /></button>
                    {onClose && <button className="retro-window-control" onClick={onClose} title="Close"><X size={10} /></button>}
                </div>
            </div>
            {/* Ensure content area allows scrolling if content overflows */}
            <ScrollArea className="retro-window-content overflow-auto flex-grow retro-scrollbar">
                {children}
            </ScrollArea>
        </div>
    );
};
