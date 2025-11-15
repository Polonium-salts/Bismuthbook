"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Heart, Bookmark, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/providers/auth-provider";
const navItems = [
  { icon: Home, label: "首页", href: "/", requireAuth: false },
  { icon: Heart, label: "关注", href: "/following", requireAuth: true },
  { icon: Plus, label: "发布", href: "/upload", isSpecial: true, requireAuth: true },
  { icon: Bookmark, label: "收藏", href: "/bookmarks", requireAuth: true },
  { icon: User, label: "我的", href: "/profile", requireAuth: true },
];
export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleNavItems = navItems.filter(item => !item.requireAuth || user);
  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-lg")}>
      <div className="flex items-center justify-around px-2 h-16 max-w-screen-xl mx-auto">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center flex-1 h-full relative group transition-colors duration-200 min-w-[60px] max-w-[100px]", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              {item.isSpecial ? (
                <div className="relative -mt-6">
                  <motion.div whileTap={{ scale: 0.9 }} className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                </div>
              ) : (
                <>
                  <motion.div whileTap={{ scale: 0.9 }} className="relative">
                    <Icon className={cn("h-6 w-6 transition-all duration-200", isActive && "scale-110")} />
                    {isActive && <motion.div layoutId="activeIndicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                  </motion.div>
                  <span className={cn("text-xs mt-1 font-medium transition-all duration-200 truncate max-w-full px-1", isActive ? "opacity-100" : "opacity-70")}>{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
