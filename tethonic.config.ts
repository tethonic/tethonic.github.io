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
      nameKey: I18nKeys.nav_bar_exchange,
      href: "https://exchange.tethonic.com/",
    },
  ],

  username: "Tethonic",
  sign: "crypto currency news",
  avatarUrl: "/tethonic.svg",
  socialLinks: [
    {
      icon: "heroicons:arrow-path-rounded-square",
      link: "https://exchange.tethonic.com/",
    },
    {
      icon: "mdi:instagram",
      link: "https://instagram.com/tethonic_com",
    },
    {
      icon: "mdi:telegram",
      link: "https://t.me/tethonic",
    },
    {
      icon: "heroicons:envelope",
      link: "mailto:tethonic@gmail.com",
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
