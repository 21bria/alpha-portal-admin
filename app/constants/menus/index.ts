// ~/constants/menus/index.ts
import type { NavMenu } from "~/types/nav"
import { menusDashboard } from "./dashboard"
import { menusPages } from "./pages"
import { menusCms } from "./cms"
import { menusMedia } from "./gallery"
import { menusSystem } from "./system"

export const navMenu: NavMenu[] = [
  ...menusDashboard,
  ...menusPages,
  ...menusCms,
  ...menusMedia,
  ...menusSystem,
]