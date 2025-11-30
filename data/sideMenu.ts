import {
  Activity,
  Book,
  BookCheck,
  CalendarCheck,
  Files,
  FileStack,
  Home,
  Landmark,
  Newspaper,
  Phone,
  Receipt,
  Shield,
  StickyNote,
  Users,
} from "lucide-react";

export const sideMenu = [
  {
    role: "Admin",
    menu: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
        isActive: true,
      },
      {
        title: "PandaConnect",
        url: "/dashboard/panda-connect",
        icon: Home,
      },
      {
        title: "Investments",
        icon: Landmark,
        url: "/dashboard/investments",
      },
      {
        title: "User Subscriptions",
        icon: CalendarCheck,
        url: "/dashboard/user-subscriptions",
        items: [
          {
            title: "Call Requests",
            icon: Phone,
            url: "/dashboard/user-subscriptions/call-requests",
          },
          {
            title: "Commitments",
            icon: Shield,
            url: "/dashboard/user-subscriptions/commitments",
          },
          {
            title: "Subscriptions",
            icon: CalendarCheck,
            url: "/dashboard/user-subscriptions/subscriptions",
          },
          {
            title: "Capital Calls",
            icon: Landmark,
            url: "/dashboard/user-subscriptions/capital-calls",
          },
          {
            title: "Receipts",
            icon: Receipt,
            url: "/dashboard/user-subscriptions/receipts",
          },
        ],
      },
      {
        title: "Statements",
        icon: StickyNote,
        url: "/dashboard/statements",
      },
      {
        title: "Distribution Notices",
        icon: Files,
        url: "/dashboard/distribution-notices",
      },
      {
        title: "Newsletters",
        icon: Newspaper,
        url: "/dashboard/newsletters",
      },
      {
        title: "KYC",
        icon: BookCheck,
        url: "/dashboard/kyc",
      },
      // {
      //   title: "All Documents",
      //   icon: FileStack,
      //   url: "/dashboard/documents",
      // },
      {
        title: "Users",
        icon: Users,
        url: "/dashboard/users",
      },
    ],
  },
  {
    role: "User",
    menu: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
        isActive: true,
      },
      {
        title: "Investments",
        icon: Landmark,
        url: "/dashboard/investments",
      },

      {
        title: "User Subscriptions",
        icon: CalendarCheck,
        url: "/dashboard/user-subscriptions",
        items: [
          {
            title: "Call Requests",
            icon: Phone,
            url: "/dashboard/user-subscriptions/call-requests",
          },
          {
            title: "Commitments",
            icon: Shield,
            url: "/dashboard/user-subscriptions/commitments",
          },
          {
            title: "Subscriptions",
            icon: CalendarCheck,
            url: "/dashboard/user-subscriptions/subscriptions",
          },
          {
            title: "Capital Calls",
            icon: Landmark,
            url: "/dashboard/user-subscriptions/capital-calls",
          },
          {
            title: "Receipts",
            icon: Receipt,
            url: "/dashboard/user-subscriptions/receipts",
          },
        ],
      },
      {
        title: "Statements",
        icon: StickyNote,
        url: "/dashboard/statements",
      },
      {
        title: "Distribution Notices",
        icon: Files,
        url: "/dashboard/distribution-notices",
      },
      {
        title: "Newsletters",
        icon: Newspaper,
        url: "/dashboard/newsletters",
      },
      {
        title: "KYC",
        icon: BookCheck,
        url: "/dashboard/kyc",
      },
      // {
      //   title: "All Documents",
      //   icon: FileStack,
      //   url: "/dashboard/documents",
      // },
    ],
  },
];
