"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

export default function ExplicitSignInPage() {
	const hasTriggeredRef = useRef(false);
	useEffect(() => {
		if (hasTriggeredRef.current) return;
            hasTriggeredRef.current = true;
            void signIn("authentik", { callbackUrl: "/protected/student-snapshot" });
	}, []);
}
