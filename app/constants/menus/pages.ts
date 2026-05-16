import type { NavMenu } from "~/types/nav"

export const menusPages: NavMenu[] = [
  {
    heading: 'Page',
    require: {
      any: ["cms.view_page", "cms.view_pagesection"],
    },
    items: [
      {
        title: 'Static',
        icon: 'i-lucide-layout-panel-top',
        link: '/content/page',
        require: {
          any: ["cms.view_page"],
        },
      },

      {
        title: 'Sections',
        icon: 'i-lucide-grip-horizontal',
        link: '/content/sections',
        require: {
          any: ["cms.view_pagesection"],
        },
      },

    ],
  },

]