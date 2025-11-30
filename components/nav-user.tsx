"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    image: string;
  };
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex gap-5 my-5">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={user.image} alt={user.firstName} />
            <AvatarFallback className="rounded-full bg-primaryBG text-white">
              {user.firstName?.charAt(0) || ""} {user.lastName?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user.firstName} {user.lastName}
            </span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
