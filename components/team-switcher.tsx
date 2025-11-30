"use client";
import * as React from "react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex justify-center">
        <Link href={"/"}>
          <div className="relative w-[70px] h-[70px]">
            <Image
              src="/images/company/logo-1.png"
              alt="brand"
              fill
              className="object-contain"
            />
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
