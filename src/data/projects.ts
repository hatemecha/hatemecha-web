export type Project = {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  siteUrl: string;
};

export const projects = [
  {
    id: "ihatepdf",
    name: "iHatePDF",
    description: "Herramientas PDF en el navegador, rapidas y directas para editar documentos sin vueltas.",
    repoUrl: "https://github.com/hatemecha/iHatePDF",
    siteUrl: "https://hatemecha.github.io/iHatePDF/"
  },
  {
    id: "hatewebcam-web",
    name: "HateWebcam Web",
    description: "Experiencia web para webcam con una interfaz preparada para experimentar en vivo.",
    repoUrl: "https://github.com/hatemecha/hatewebcam-web",
    siteUrl: "https://hatemecha.github.io/hatewebcam-web/"
  }
] as const satisfies readonly Project[];
