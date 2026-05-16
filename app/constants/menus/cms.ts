import type { NavMenu } from "~/types/nav"

export const menusCms: NavMenu[] = [
  {
    heading: 'CMS',
    require: {
      any: [
        "cms.view_newsarticle",
        "cms.view_newscategory",
        "cms.view_newstag",
        "cms.cms.view_newstopic",
        "cms.view_project",
        "cms.view_projectsection",
        "cms.view_jobvacancy",
        "cms.view_document"
      ],
    },
    items: [
      {
        title: 'Projects',
        icon: 'i-lucide-folder-kanban',
        require: {
          any: [
            "cms.view_project",
            "cms.view_projectsection"
          ]
        },
        children: [
          {
            title: "Page",
            icon: "i-lucide-circle",
            link: '/cms/projects',
            require: { any: ["cms.view_project"] },
          },
          {
            title: "Sections",
            icon: "i-lucide-circle",
            link: "/cms/projects/sections",
            require: { any: ["cms.view_projectsection"] },
          },
        ],
      },
     
      {
        title: 'Articles',
        icon: 'i-lucide-newspaper',
        require: {
          any: [
            "cms.view_newsarticle",
            "cms.view_newscategory",
            "cms.view_newstag",
            "cms.cms.view_newstopic",
          ]
        },
        children: [
          {
            title: "Categories",
            icon: "i-lucide-circle",
            link: '/cms/news/categories',
            require: { any: ["cms.view_newscategory"] },
          },
          {
            title: "Tags",
            icon: "i-lucide-circle",
            link: "/cms/news/tags",
            require: { any: ["cms.view_newstag"] },
          },
          {
            title: "Topics",
            icon: "i-lucide-circle",
            link: "/cms/news/topics",
            require: { any: ["cms.view_newstopic"] },
          },
          {
            title: "Articles",
            icon: "i-lucide-circle",
            link: "/cms/news/article",
            require: { any: ["cms.view_newsarticle"] },
          },
        ],
      },

      {
        title: 'Careers',
        icon: 'i-lucide-briefcase-business',
        link: '/careers',
        require: {
          any: ["cms.view_jobvacancy"],
        },
      },
      {
        title: 'Documents',
        icon: 'i-lucide-files',
        link: '/cms/documents',
        require: {
          any: ["cms.view_document"],
        },
      },


    ],
  },
]