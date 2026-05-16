import type { NavMenu } from "~/types/nav"

export const menusSystem: NavMenu[] = [
{
    heading: 'System',
     require: { 
      any: 
      [
      "auth.view_group",
      "accounts.view_user", 
      "auth.view_permission",
      "cms.view_companyprofile"
    ] },
    items: [
      {
        title: "Authentication",
        icon: "i-lucide-lock-keyhole-open",
        require: { any: ["auth.view_group", "accounts.view_user", "auth.view_permission"] },
        children: [
          {
            title: "Groups",
            icon: "i-lucide-circle",
            link: "/account/settings/groups",
            require: { any: ["auth.view_group"] },
          },
          {
            title: "User",
            icon: "i-lucide-circle",
            link: "/account/settings/users",
            require: { any: ["accounts.view_user"] },
          },
          {
            title: "Permissions",
            icon: "i-lucide-circle",
            link: "/account/settings/permissions",
            require: { any: ["auth.view_permission"] },
          },
        ],
      },
     {
        title: 'Company',
        icon: 'i-lucide-building-2',
        link: '/profile',
        require: {
          any: ["cms.view_companyprofile"],
        },
      },
    ],
  },
]