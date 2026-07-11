export type ProjectImage = {
  src: string;
  alt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  siteUrl: string;
  images: readonly ProjectImage[];
};

export const projects = [
  {
    id: "ihatepdf",
    name: "iHatePDF",
    description:
      "Herramientas PDF en el navegador, rapidas y directas para editar documentos sin vueltas.",
    repoUrl: "https://github.com/hatemecha/iHatePDF",
    siteUrl: "https://hatemecha.github.io/iHatePDF/",
    images: [
      {
        src: "assets/projects/ihatepdf-01.webp",
        alt: "iHatePDF — landing y busqueda de herramientas"
      },
      {
        src: "assets/projects/ihatepdf-02.webp",
        alt: "iHatePDF — grilla de herramientas Organizar"
      }
    ]
  },
  {
    id: "hatewebcam-web",
    name: "HateWebcam Web",
    description:
      "Experiencia web para webcam con una interfaz preparada para experimentar en vivo.",
    repoUrl: "https://github.com/hatemecha/hatewebcam-web",
    siteUrl: "https://hatemecha.github.io/hatewebcam-web/",
    images: [
      {
        src: "assets/projects/hatewebcam-01.webp",
        alt: "HateWebcam — vista webcam con deteccion de caras"
      },
      {
        src: "assets/projects/hatewebcam-02.webp",
        alt: "HateWebcam — editor de video con timeline"
      }
    ]
  }
] as const satisfies readonly Project[];
