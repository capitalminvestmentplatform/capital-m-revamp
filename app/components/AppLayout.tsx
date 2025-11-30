"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AppSidebar from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ProfileDropdown from "./ProfileDropdown";
import { useEffect, useState } from "react";
import { getLoggedInUser } from "@/utils/client";
import NotificationBell from "./NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedInUser = getLoggedInUser();
  const email = loggedInUser ? loggedInUser.email : null;
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const [segmentNames, setSegmentNames] = useState<(string | null)[]>([]);

  // You can expand this list if you add more auth routes later
  const isAuthPage =
    pathname === "/auth/login" || pathname.startsWith("/auth/");

  const excludedRoutes = [
    "/",
    "/auth/login",
    "/auth/forgot-pin",
    "/auth/set-pin",
    "/auth/reset-pin",
    "/auth/verify-user",
    "/auth/verify-reset-pin",
  ];

  const isExcluded = excludedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  useEffect(() => {
    const fetchSegmentNames = async () => {
      const names: (string | null)[] = [];

      for (let i = 0; i < pathSegments.length; i++) {
        const current = pathSegments[i];
        let prev = pathSegments[i - 1];

        // If the segment is an ID and there's a known parent like 'users' or 'products'
        if (i > 0 && /^[a-f\d]{24}$/i.test(current)) {
          try {
            let url = "";
            console.log("prev", prev);
            if (prev === "investments") url = `/api/products/${current}`;
            else if (
              ["subscriptions", "capital-calls", "receipts"].includes(prev)
            )
              url = `/api/user-subscriptions/${prev}/${current}`;
            else if (prev === "statements")
              url = `/api/statements/user/${current}`;
            else url = `/api/${prev}/${current}`;

            const res = await fetch(url);
            const response = await res.json();
            if (response.statusCode !== 200) {
              throw new Error(response.message);
            }
            const data = response.data;

            if (prev === "users") {
              names.push(`${data.firstName} ${data.lastName}`);
            } else if (prev === "newsletters") {
              names.push(data.subject);
            } else if (prev === "statements") {
              names.push(`${data.username}`);
            } else {
              names.push(data.title);
            }

            console.log("data.title", data);
          } catch (err) {
            names.push(current); // fallback on error
          }
        } else {
          names.push(current);
        }
      }

      setSegmentNames(names);
    };

    fetchSegmentNames();
  }, [pathname]);
  const getMobilePageTitle = (
    segments: string[],
    segmentNames: (string | null)[]
  ) => {
    const last = segments[segments.length - 1];
    const secondLast = segments[segments.length - 2];

    if (
      segments.length >= 3 &&
      segments[1] === "investments" &&
      /^[a-f\d]{24}$/i.test(segments[2])
    ) {
      if (last === "edit") {
        return "Edit Investment";
      }
      return "Investment Details";
    }
    // Subscription Details
    if (
      segments.length >= 3 &&
      segments[1] === "subscriptions" &&
      /^[a-f\d]{24}$/i.test(segments[2])
    ) {
      return "Subscription Details";
    }

    // Capital Call Details
    if (
      segments.length >= 3 &&
      segments[1] === "capital-calls" &&
      /^[a-f\d]{24}$/i.test(segments[2])
    ) {
      return "Capital Call Details";
    }

    // Receipt Details
    if (
      segments.length >= 3 &&
      segments[1] === "receipts" &&
      /^[a-f\d]{24}$/i.test(segments[2])
    ) {
      return "Receipt Details";
    }

    // User Details
    if (
      segments.length >= 3 &&
      segments[1] === "users" &&
      /^[a-f\d]{24}$/i.test(segments[2])
    ) {
      return "User Details";
    }

    // Fallback to enriched name if available
    const lastName = segmentNames[segments.length - 1];
    return lastName
      ? lastName
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : last.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Check if the current route is in the excluded list
  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full me-8">
            <div className="flex items-center gap-2 px-4 ms-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb className="hidden sm:flex">
                <BreadcrumbList>
                  {pathSegments.map((segment, index) => {
                    const href =
                      "/" + pathSegments.slice(0, index + 1).join("/");
                    const isLast = index === pathSegments.length - 1;
                    const name = segmentNames[index] || segment;

                    const formattedSegment = name
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase());

                    return (
                      <BreadcrumbItem key={href}>
                        {!isLast ? (
                          ["user-subscriptions", "user"].includes(segment) ? (
                            <>
                              <span className="text-muted-foreground">
                                {formattedSegment}
                              </span>
                              <BreadcrumbSeparator />
                            </>
                          ) : (
                            <>
                              <BreadcrumbLink asChild>
                                <Link href={href}>{formattedSegment}</Link>
                              </BreadcrumbLink>
                              <BreadcrumbSeparator />
                            </>
                          )
                        ) : (
                          <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
              <div className="sm:hidden text-lg font-medium px-4">
                {getMobilePageTitle(pathSegments, segmentNames)}
              </div>
            </div>
            <div className="flex gap-6">
              <NotificationBell email={email || ""} />

              <ProfileDropdown />
            </div>
          </div>
        </header>
        <div className="container mx-auto max-w-[1440px] px-4" key={pathname}>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
