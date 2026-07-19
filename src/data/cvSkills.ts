import { socialLinks } from "./socialLinks";
import { bandcampUrl } from "./albums";

export type SkillBlock = {
  id: string;
  label: string;
  body: string;
};

export type CvLink = {
  id: string;
  label: string;
  href: string;
};

export const cvBio =
  "Experimentos, vibe coding y proyectos personales desde Bahía Blanca. Diseño interfaces, armo prototipos y construyo herramientas que empiezan siendo para mí y después publico. También trabajo con fotografía, imagen y producción musical.";

export const skillBlocks = [
  {
    id: "codigo",
    label: "código",
    body: "webs, herramientas en el navegador y prototipos. JS/TS, React; Python o PHP cuando hace falta."
  },
  {
    id: "foto-imagen",
    label: "foto / imagen",
    body: "fotografía, dibujo y dirección visual para piezas propias y encargos."
  },
  {
    id: "musica",
    label: "música",
    body: "producción musical y releases en Bandcamp."
  }
] as const satisfies readonly SkillBlock[];

export const cvLinks = [
  { id: "github", label: "github", href: socialLinks.github },
  { id: "bandcamp", label: "bandcamp", href: bandcampUrl },
  { id: "instagram", label: "instagram", href: socialLinks.instagram }
] as const satisfies readonly CvLink[];
