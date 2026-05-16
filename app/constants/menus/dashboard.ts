
import type { NavMenu } from "~/types/nav"

export const menusDashboard: NavMenu[] = [
   {
    heading: 'Dashboard',
    items: [
      {
        title: 'Index',
        icon: 'i-lucide-home',
        link: '/',
      },

      {
        title: 'Tasks',
        icon: 'i-lucide-calendar-check-2',
        link: '/tasks',
      },
    ],
  },
]