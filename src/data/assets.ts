export const visualAssets = {
  barcode: "assets/barcode-hatemecha.webp",
  menuEyesStrip: "assets/ojos.png",
  menuPhotoBlock: "assets/menu-photo-block.webp"
} as const;

/** Fotos del menú home — pinout a la derecha (label = silkscreen). */
export const homeMenuScatterPhotos = [
  {
    src: "assets/home1.webp",
    label: "img:01",
    slot: "one",
    width: 2667,
    height: 4000
  },
  {
    src: "assets/home2.webp",
    label: "img:02",
    slot: "two",
    width: 6000,
    height: 4000
  },
  {
    src: "assets/home3.webp",
    label: "img:03",
    slot: "three",
    width: 4713,
    height: 3142
  }
] as const;
