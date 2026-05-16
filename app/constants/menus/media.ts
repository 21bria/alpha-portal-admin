import type { NavMenu } from "~/types/nav"

export const menusMedia: NavMenu[] = [
  {
    heading: 'Media',
    require: {
      any: ["cms.view_media"],
    },
    items: [
      {
        title: 'Gallery',
        icon: 'i-lucide-image-play',
        link: '/media',
        require: {
          any: ["cms.view_media"],
        },
      },

    ],
  },

]