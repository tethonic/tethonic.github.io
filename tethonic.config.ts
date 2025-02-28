import I18nKeys from "./src/locales/keys";
import type { Configuration } from "./src/types/config";

const TethonicConfig: Configuration = {
  title: "Tethonic",
  subTitle: "crypto currency news",
  brandTitle: "Tethonic",

  description: "Tethonic: crypto currency news",

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
  sign: "crypto currency news",
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
    "/slides/1.jpg",
    "/slides/2.jpg",
  ],  

  slugMode: "HASH", // 'RAW' | 'HASH'

  license: {
    name: "Tethonic",
    url: "#",
  },

  // WIP functions
  bannerStyle: "LOOP", // 'loop' | 'static' | 'hidden'
};

export default TethonicConfig;
