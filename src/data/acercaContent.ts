import { socialLinks } from "../data/socialLinks";

export const acercaPageContent = {
  paragraphs: [
    "Hatemecha es el proyecto de diseño, fotografía y desarrollo de un creador en Bahía Blanca, Argentina.",
    "Acá conviven flyers, branding, foto, dibujo, producción musical y herramientas web — con una estética underground, cruda y directa.",
    "Si querés charlar de un proyecto o una colaboración, escribime por Instagram o mirá el código en GitHub."
  ],
  links: [
    { label: "Instagram", href: socialLinks.instagram },
    { label: "GitHub", href: socialLinks.github },
    { label: "Bandcamp", href: "https://hatemecha.bandcamp.com/" }
  ]
} as const;
