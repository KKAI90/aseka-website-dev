"use client";
import { useEffect } from "react";

export default function HostGuard() {
  useEffect(() => {
    const host = window.location.hostname;
    const isAdmin  = host.includes("-admin-")  || host.includes("-admin.")  || host.startsWith("admin.");
    const isMypage = host.includes("-mypage-") || host.includes("-mypage.") || host.startsWith("mypage.");

    const path = window.location.pathname;
    if (isAdmin  && !path.startsWith("/admin"))  { window.location.href = "/admin/login";  return; }
    if (isMypage && !path.startsWith("/mypage")) { window.location.href = "/mypage/login"; return; }
  }, []);

  return null;
}
