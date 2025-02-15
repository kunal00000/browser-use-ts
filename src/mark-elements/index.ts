import type { ElementHandle } from "playwright";

export let MARKERS: Map<number, ElementHandle<Node>>;

export const updateMarkers = (markers: Map<number, ElementHandle<Node>>) => {
  MARKERS = markers;
};
