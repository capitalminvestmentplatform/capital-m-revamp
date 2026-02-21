"use client";
import React, { useEffect, useState } from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { sideMenu } from "@/data/sideMenu";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    image: string;
  } | null>(null);

  const [menu, setMenu] = useState<
    {
      title: string;
      url: string;
      isActive?: boolean;
      items?: { title: string; url: string }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const user = response.data;

      let filteredMenu = sideMenu.find((item) => item.role === user.role);
      setMenu(filteredMenu ? filteredMenu.menu : []);
      setUser(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {loading ? (
          <div className="space-y-4 px-4 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-md shimmer" />
            ))}
          </div>
        ) : (
          <NavMain items={menu} />
        )}
      </SidebarContent>

      <SidebarFooter>
        {loading ? (
          <div className="px-4 py-3 space-y-2">
            <Skeleton className="h-10 w-10 rounded-full shimmer" />
            <Skeleton className="h-4 w-32 shimmer" />
            <Skeleton className="h-3 w-24 shimmer" />
          </div>
        ) : (
          user && <NavUser user={user} />
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
export default AppSidebar;
