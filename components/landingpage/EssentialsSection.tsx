
"use client";

import {
    motion,
    useMotionValue,
    useSpring,
} from "motion/react";
import type { ReactNode, PointerEvent } from "react";

export default function EssentialsSection() {
    return (
        <section id="features" className="scroll-mt-4 border-t border-white/10">
            <div className="mx-auto w-full max-w-7xl px-6 py-14 sm:px-8 sm:py-20 lg:px-10">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FFC93C]">
                            The essentials
                        </p>

                        <h2 className="mt-5 text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl">
                            One workspace.
                            <br />
                            Every moving part.
                        </h2>
                    </div>

                    <p className="text-xs text-[#F4F1EA]/60 md:mr-[22%]">
                        Less switching. More momentum.
                    </p>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:h-[490px] lg:grid-cols-3 lg:grid-rows-[repeat(6,minmax(0,1fr))]">
                    {/* 01 */}
                    <TiltCard className="relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl bg-[#FFC93C] p-6 text-[#14161A] sm:col-span-2 sm:p-7 lg:col-span-1 lg:col-start-1 lg:row-span-6 lg:row-start-1 lg:min-h-0">
                        <span className="text-[10px] font-semibold">01</span>

                        <h3 className="mt-4 text-2xl font-normal leading-tight tracking-tight sm:text-3xl">
                            Smart photo
                            <br />
                            selection
                        </h3>

                        <p className="mt-auto pt-8 text-3xl font-extrabold leading-[0.95] tracking-tight sm:text-4xl lg:text-[40px]">
                            PICK.
                            <br />
                            LOVE.
                            <br />
                            DELIVER.
                        </p>
                    </TiltCard>

                    {/* 02 */}
                    <TiltCard className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-5 sm:p-6 lg:min-h-0 lg:col-start-2 lg:row-span-3 lg:row-start-1">
                        <span className="text-[10px] font-semibold text-[#FFC93C]">02</span>

                        <h3 className="mt-3 text-lg font-normal tracking-tight sm:text-xl">
                            Projects &amp; files
                        </h3>

                        <p className="mt-auto text-sm text-[#F4F1EA]/55 sm:text-xs">
                            Every client. Every file. In order.
                        </p>
                    </TiltCard>

                    {/* 03 */}
                    <TiltCard className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-5 sm:p-6 lg:min-h-0 lg:col-start-2 lg:row-span-3 lg:row-start-4">
                        <span className="text-[10px] font-semibold text-[#FFC93C]">03</span>

                        <h3 className="mt-3 text-lg font-normal tracking-tight sm:text-xl">
                            Contracts &amp; quotes
                        </h3>

                        <p className="mt-auto text-sm text-[#F4F1EA]/55 sm:text-xs">
                            Professional documents, simplified.
                        </p>
                    </TiltCard>

                    {/* 04 */}
                    <TiltCard className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-5 sm:p-6 lg:min-h-0 lg:col-start-3 lg:row-span-2 lg:row-start-1">
                        <span className="text-[10px] font-semibold text-[#FFC93C]">04</span>

                        <h3 className="mt-3 text-lg font-normal tracking-tight sm:text-xl">
                            Attendance &amp; payslips
                        </h3>

                        <p className="mt-auto text-sm text-[#F4F1EA]/55 sm:text-xs">
                            Keep your team on track.
                        </p>
                    </TiltCard>

                    {/* 05 */}
                    <TiltCard className="flex min-h-[150px] flex-col rounded-2xl bg-[#343A2B] p-5 sm:p-6 lg:min-h-0 lg:col-start-3 lg:row-span-2 lg:row-start-3">
                        <span className="text-[10px] font-semibold text-[#FFC93C]">05</span>

                        <h3 className="mt-3 text-lg font-normal tracking-tight sm:text-xl">
                            Website builder
                        </h3>

                        <p className="mt-auto text-sm text-[#F4F1EA]/55 sm:text-xs">
                            Make your business feel like you.
                        </p>
                    </TiltCard>

                    {/* 06 */}
                    <TiltCard className="flex min-h-[150px] flex-col rounded-2xl bg-[#1E2125] p-5 sm:p-6 lg:min-h-0 lg:col-start-3 lg:row-span-2 lg:row-start-5">
                        <span className="text-[10px] font-semibold text-[#FFC93C]">06</span>

                        <h3 className="mt-3 text-lg font-normal tracking-tight sm:text-xl">
                            Packages &amp; services
                        </h3>

                        <p className="mt-auto text-sm text-[#F4F1EA]/55 sm:text-xs">
                            Show your value. Share your pricing.
                        </p>
                    </TiltCard>
                </div>
            </div>
        </section>
    );
}

function TiltCard({
    children,
    className,
}: {
    children: ReactNode;
    className: string;
}) {
    const rotateXValue = useMotionValue(0);
    const rotateYValue = useMotionValue(0);

    const rotateX = useSpring(rotateXValue, {
        stiffness: 180,
        damping: 20,
    });

    const rotateY = useSpring(rotateYValue, {
        stiffness: 180,
        damping: 20,
    });

    function updateTilt(event: PointerEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        rotateXValue.set((y / rect.height - 0.5) * -12);
        rotateYValue.set((x / rect.width - 0.5) * 12);
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
        updateTilt(event);
    }

    function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
        if (event.pointerType === "touch") {
            updateTilt(event);
        }
    }

    function handlePointerLeave() {
        rotateXValue.set(0);
        rotateYValue.set(0);
    }

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className={className}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 900,
                touchAction: "pan-y",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerLeave}
            onPointerCancel={handlePointerLeave}
            onPointerLeave={handlePointerLeave}
        >
            {children}
        </motion.div>
    );
}

const cardVariants = {
    hidden: { opacity: 0, y: 45 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut" as const,
        },
    },
};
