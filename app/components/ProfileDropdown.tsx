import {
  LogOut,
  Settings,
  UserRound,
  User,
  File,
  ChartBar,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProfileDropdown = () => {
  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ensures cookies are sent and received
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect user or update UI after logout
        window.location.href = "/auth/login"; // Redirect to login page
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserRound className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 me-10">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={"/user/profile"} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <User size={18} />
                Profile
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={"/user/settings"} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <Settings size={18} />
                Settings
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={"/dashboard/documents"} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <File size={18} />
                Documents
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={"/dashboard/panda-connect"} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <ChartBar size={18} />
                Stats
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            className="w-full bg-primaryBG hover:bg-primaryBG"
            onClick={handleSubmit}
          >
            <LogOut /> Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
