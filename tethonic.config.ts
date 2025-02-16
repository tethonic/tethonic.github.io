import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const TethonicConfig: Configuration = {
  title: "Tethonic",
  subTitle: "Tethonic",
  brandTitle: "Tethonic",

  description: "Tethonic",

  site: "https://tethonic.com",

  locale: "en", // set for website language and date format

  navigators: [
    {
      nameKey: I18nKeys.nav_bar_home,
      href: "/",
    },
    {
      nameKey: I18nKeys.nav_bar_archive,
      href: "/archive",
    },
    {
      nameKey: I18nKeys.nav_bar_about,
      href: "/about",
    },
    {
      nameKey: I18nKeys.nav_bar_github,
      href: "https://github.com/tethonic",
    },
  ],

  username: "Tethonic",
  sign: "Unlock the Future of Crypto",
  avatarUrl: "/tethonic.svg",
  socialLinks: [
    {
      icon: "line-md:github-loop",
      link: "https://github.com/tethonic",
    },
    {
      icon: "mingcute:bilibili-line",
      link: "#",
    },
    {
      icon: "mingcute:netease-music-line",
      link: "#",
    },
  ],

  banners: [
    "https://s2.loli.net/2025/01/25/PBvHFjr5yDu6t4a.webp",
    "https://s2.loli.net/2025/01/25/6bKcwHZigzlM4mJ.webp",
    "https://s2.loli.net/2025/01/25/H9WgEK6qNTcpFiS.webp",
    "https://s2.loli.net/2025/01/25/njNVtuUMzxs81RI.webp",
    "https://s2.loli.net/2025/01/25/tozsJ8QHAjFN3Mm.webp",
    "https://s2.loli.net/2025/01/25/Pm89OveZq7NWUxF.webp",
    "https://s2.loli.net/2025/01/25/UCYKvc1ZhgPHB9m.webp",
    "https://s2.loli.net/2025/01/25/JjpLOW8VSmufzlA.webp",
  ],

  slugMode: "HASH", // 'RAW' | 'HASH'

  license: {
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default TethonicConfig;
