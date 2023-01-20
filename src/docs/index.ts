import { basicInfo } from "./basicInfo";
import { components } from "./components";
import { endpoints } from "./endpoints";
import { servers } from "./servers";
import { tags } from "./tags";

module.exports = {
  ...basicInfo,
  ...servers,
  ...tags,
  ...components,
  ...endpoints,
};
