"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function MainContentWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const pathname = usePathname() || "";
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isPublicRoute =
		pathname === "/" ||
		pathname === "/en" ||
		pathname === "/ru" ||
		["/login", "/register", "/buy", "/forgot-password"].some((p) =>
			pathname.includes(p),
		);

	if (!mounted) {
		if (isPublicRoute) {
			return (
				<div className="flex-1 flex flex-col bg-white">
					<div
						className="opacity-0 h-full w-full"
						style={{ animation: "fadeIn 0.2s forwards 0.1s" }}
					>
						{children}
					</div>
				</div>
			);
		}
		return (
			<div
				className="flex-1 overflow-hidden"
				style={{
					backgroundColor: "var(--bg)",
					borderTopLeftRadius: "28px",
					borderTopRightRadius: "28px",
					position: "relative",
					zIndex: 1,
				}}
			>
				<div
					className="opacity-0 h-full w-full"
					style={{ animation: "fadeIn 0.2s forwards 0.1s" }}
				>
					{children}
				</div>
			</div>
		);
	}

	if (isAuthenticated) {
		return (
			<div
				className="flex-1 overflow-hidden"
				style={{
					backgroundColor: "var(--bg)",
					borderTopLeftRadius: "28px",
					borderTopRightRadius: "28px",
					position: "relative",
					zIndex: 1,
				}}
			>
				{children}
			</div>
		);
	}

	return (
		<div className={`flex-1 flex flex-col ${isPublicRoute ? "bg-white" : ""}`}>
			{children}
		</div>
	);
}
