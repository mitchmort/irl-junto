type PageRoutesType = {
  title: string;
  items: PageRoutesItemType;
};

type PageRoutesItemType = {
  title: string;
  href: string;
  icon?: string;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: PageRoutesItemType;
}[];

export const page_routes: PageRoutesType[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/default",
        icon: "BarChart3"
      }
    ]
  },
  {
    title: "Organizing",
    items: [
      {
        title: "Create Event",
        href: "/dashboard/events/create?step=1",
        icon: "Plus"
      },
      {
        title: "Manage Events",
        href: "/dashboard/events?filter=organized",
        icon: "Settings"
      }
    ]
  },
  {
    title: "Playing",
    items: [
      {
        title: "My RSVPs",
        href: "/dashboard/events?filter=joined",
        icon: "UserCheck"
      },
      {
        title: "Game History",
        href: "/dashboard/events?filter=completed",
        icon: "History"
      }
    ]
  },
  {
    title: "Schedule",
    items: [
      {
        title: "All Events",
        href: "/dashboard/events",
        icon: "List"
      },
      {
        title: "Event Calendar",
        href: "/dashboard/apps/calendar",
        icon: "Calendar"
      }
    ]
  },
  {
    title: "Messages",
    items: [
      {
        title: "Messages",
        href: "/dashboard/apps/chat",
        icon: "MessageSquare",
        isDataBadge: "4"
      }
    ]
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/dashboard/pages/profile",
        icon: "User"
      },
      {
        title: "Settings",
        href: "/dashboard/pages/settings/account",
        icon: "Settings",
        items: [
          {
            title: "Edit Profile",
            href: "/dashboard/pages/settings/profile",
            icon: "UserPen"
          },
          {
            title: "Account",
            href: "/dashboard/pages/settings/account",
            icon: "Settings"
          },
          {
            title: "Notifications",
            href: "/dashboard/pages/settings/notifications",
            icon: "Bell"
          },
          {
            title: "Display",
            href: "/dashboard/pages/settings/appearance",
            icon: "Palette"
          }
        ]
      }
    ]
  }
];
