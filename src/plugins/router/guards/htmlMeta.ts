import { nextTick } from "vue";
import type { RouteLocationNormalized } from "vue-router";

const DEFAULT_TITLE = "Qingque Scoring";
const DEFAULT_DESC = "A website tools to modify Mar-7th or QingueBot relic scoring system";
interface RouteMeta {
  title?: string;
  description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function htmlMetaGuard(to: RouteLocationNormalized, _: RouteLocationNormalized) {
  nextTick(() => {
    const head = document.querySelector("head");
    if (!head) return;
    const meta = to.meta as RouteMeta;
    document.title = meta.title ?? DEFAULT_TITLE;
    const description = document.querySelector("meta[name=description]");
    if (description) {
      description.setAttribute("content", meta.description ?? DEFAULT_DESC);
    } else {
      const newDescription = document.createElement("meta");
      newDescription.setAttribute("name", "description");
      newDescription.setAttribute("content", meta.description ?? DEFAULT_DESC);
      head.appendChild(newDescription);
    }
  });
}