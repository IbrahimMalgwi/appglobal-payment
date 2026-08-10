"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useApp } from "@/context/AppContext";
import { getNavForUserType, NavItem } from "@/lib/nav-config";

export function Sidebar() {
    const pathname = usePathname();
    const { userType, sidebarCollapsed, toggleSidebar } = useApp();
    const sections = getNavForUserType(userType);

    // Auto-expand whichever group contains the current route
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        sections.forEach((section) =>
            section.items.forEach((item) => {
                if (item.children?.some((c) => pathname.startsWith(c.href))) {
                    initial[item.label] = true;
                }
            })
        );
        return initial;
    });

    function toggleGroup(label: string) {
        setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
    }

    function isLeafActive(href: string) {
        return pathname === href || pathname.startsWith(href + "/");
    }

    return (
        <aside
            className={clsx(
                "sticky top-0 flex h-screen flex-col bg-navy-950 text-navy-50 transition-[width] duration-200",
                sidebarCollapsed ? "w-[76px]" : "w-[264px]"
            )}
        >
            {/* Brand */}
            <div className="flex h-16 items-center gap-2 border-b border-white/5 px-5">
                <Image
                    src="/logo.png"
                    alt="AppGlobal Payment"
                    width={32}
                    height={32}
                    className="shrink-0 rounded-lg"
                    priority
                />
                {!sidebarCollapsed && (
                    <span className="font-display text-[15px] font-bold tracking-tight text-white">
            AppGlobal <span className="text-brand-300">Payment</span>
          </span>
                )}
            </div>

            {/* Nav */}
            <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
                {sections.map((section, sIdx) => (
                    <div key={sIdx} className="mb-4">
                        {section.heading && !sidebarCollapsed && (
                            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-navy-300">
                                {section.heading}
                            </p>
                        )}
                        <ul className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavRow
                                    key={item.label}
                                    item={item}
                                    collapsed={sidebarCollapsed}
                                    open={!!openGroups[item.label]}
                                    onToggle={() => toggleGroup(item.label)}
                                    isLeafActive={isLeafActive}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={toggleSidebar}
                className="flex items-center gap-2 border-t border-white/5 px-5 py-4 text-xs font-medium text-navy-300 hover:text-white"
            >
                <span>{sidebarCollapsed ? "»" : "«"}</span>
                {!sidebarCollapsed && "Collapse"}
            </button>
        </aside>
    );
}

function NavRow({
                    item,
                    collapsed,
                    open,
                    onToggle,
                    isLeafActive,
                }: {
    item: NavItem;
    collapsed: boolean;
    open: boolean;
    onToggle: () => void;
    isLeafActive: (href: string) => boolean;
}) {
    const Icon = item.icon;

    // GROUP WITH CHILDREN — click-to-expand accordion with chevron
    if (item.children) {
        const groupActive = item.children.some((c) => isLeafActive(c.href));

        return (
            <li>
                <button
                    onClick={onToggle}
                    disabled={collapsed}
                    className={clsx(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        groupActive ? "bg-white/[0.06] text-white" : "text-navy-200 hover:bg-white/[0.04] hover:text-white"
                    )}
                >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown size={15} className={clsx("transition-transform duration-200", open && "rotate-180")} />
                        </>
                    )}
                </button>

                {/* Children only render when expanded and the group is open */}
                {!collapsed && open && (
                    <ul className="ml-[34px] mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                        {item.children.map((child) => {
                            const isActive = isLeafActive(child.href);
                            return (
                                <li key={child.href}>
                                    <Link
                                        href={child.href}
                                        className={clsx(
                                            "block rounded-md px-2.5 py-2 text-sm transition-colors",
                                            isActive
                                                ? "font-semibold text-brand-400 hover:text-brand-300"
                                                : "text-navy-300 hover:text-white"
                                        )}
                                    >
                                        {child.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </li>
        );
    }

    // LEAF ITEM (no children)
    const isActive = item.href ? isLeafActive(item.href) : false;
    return (
        <li>
            <Link
                href={item.href ?? "#"}
                className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-brand-500 text-white hover:bg-brand-600" : "text-navy-200 hover:bg-white/[0.04] hover:text-white"
                )}
            >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                    <span className="rounded-full bg-success/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {item.badge}
          </span>
                )}
            </Link>
        </li>
    );
}