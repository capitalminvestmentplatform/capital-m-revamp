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

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent with the request
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
      return null;
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
export default AppSidebar;
