import React from 'react';
import { Check, Clock, Package, Scissors, Truck } from 'lucide-react';

const OrderTimeline = ({ status }) => {
    // Define steps and their mapping to status codes
    const steps = [
        { id: 'pending', label: 'Order Placed', icon: Clock },
        { id: 'measurements_pending', label: 'Measurements', icon: Scissors },
        { id: 'in_stitching', label: 'Stitching', icon: Scissors }, // Reusing scissors, could be needle
        { id: 'ready', label: 'Quality Check', icon: Check },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: Package } // Or Home
    ];

    // Status map to index logic (simplified linear progression)
    // Order status enum from backend might differ, adjusting to match typical flow
    const statusOrder = ['pending', 'measurements_pending', 'measurements_confirmed', 'in_stitching', 'ready', 'shipped', 'delivered'];

    // Normalize status (handle variations like 'measurements_confirmed' maps to step 1 completed)
    const getCurrentStepIndex = (currentStatus) => {
        if (currentStatus === 'cancelled') return -1;
        if (currentStatus === 'completed') return steps.length - 1;

        const idx = statusOrder.indexOf(currentStatus);

        // Map 'measurements_confirmed' to between step 1 and 2, simplified logic:
        if (currentStatus === 'measurements_confirmed') return 1;

        // Find best match in steps logic
        // Simplified: just match ID directly or find closest index in statusOrder
        const stepIds = steps.map(s => s.id);
        const match = stepIds.indexOf(currentStatus);
        if (match !== -1) return match;

        // Fallback for intermediate statuses
        if (currentStatus === 'measurements_confirmed') return 1;

        return 0;
    };

    const currentStepIndex = getCurrentStepIndex(status);

    if (status === 'cancelled') {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center font-bold mb-6 border border-red-200">
                Order Cancelled
            </div>
        );
    }

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative px-4">
                {/* Connecting Line - Background */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 mx-8"></div>

                {/* Connecting Line - Progress */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-maroon -z-10 mx-8 transition-all duration-1000"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white
                                    ${isCompleted ? 'border-brand-maroon text-brand-maroon' : 'border-gray-200 text-gray-300'}
                                    ${isCurrent ? 'scale-110 shadow-lg' : ''}
                                `}
                            >
                                <Icon size={16} strokeWidth={isCompleted ? 3 : 2} />
                            </div>
                            <span
                                className={`text-xs mt-2 font-bold uppercase tracking-wider transition-colors duration-300
                                    ${isCompleted ? 'text-brand-maroon' : 'text-gray-400'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
