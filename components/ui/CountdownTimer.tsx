"use client"

import { useState, useEffect } from "react"
import { Clock, Tag } from "lucide-react"

interface CountdownTimerProps {
    targetDate: string;
    onExpire?: () => void;
    compact?: boolean;
}

export function CountdownTimer({ targetDate, onExpire, compact }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return null;
        };

        const initialTimeLeft = calculateTimeLeft();
        setTimeLeft(initialTimeLeft);

        if (!initialTimeLeft) {
            setIsExpired(true);
            if (onExpire) onExpire();
            return;
        }

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (!newTimeLeft) {
                clearInterval(timer);
                setIsExpired(true);
                if (onExpire) onExpire();
            } else {
                setTimeLeft(newTimeLeft);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onExpire]);

    if (isExpired || !timeLeft) return null;

    if (compact) {
        return (
            <>
                <Tag className="w-3.5 h-3.5 text-red-500" />
                <span className="text-sm font-medium text-red-500 whitespace-nowrap">
                    {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m
                </span>
            </>
        )
    }

    return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md w-fit border border-rose-100">
            <Clock className="w-3.5 h-3.5" />
            <span>
                Ends in {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m
            </span>
        </div>
    )
}
