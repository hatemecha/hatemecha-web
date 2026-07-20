export const visualAssets = {
  barcode: "assets/barcode-hatemecha.webp",
  menuEyesStrip: "assets/ojos.png",
  menuPhotoBlock: "assets/menu-photo-block.webp"
} as const;

/** Fotos del menú home — pinout a la derecha (label = silkscreen). */
export const homeMenuScatterPhotos = [
  {
    src: "assets/home1-sm.webp",
    label: "img:01",
    slot: "one",
    width: 900,
    height: 1350
  },
  {
    src: "assets/home2-sm.webp",
    label: "img:02",
    slot: "two",
    width: 900,
    height: 600
  },
  {
    src: "assets/home3-sm.webp",
    label: "img:03",
    slot: "three",
    width: 900,
    height: 600
  }
] as const;
