export type Album = {
  id: string;
  title: string;
  credits?: string;
  coverSrc: string;
  bandcampUrl: string;
};

export const bandcampUrl = "https://hatemecha.bandcamp.com/" as const;

export const albums = [
  {
    id: "delirios-de-grandeza",
    title: "delirios de grandeza",
    credits: "trshgab, alex dlarg",
    coverSrc: "assets/music/delirios-de-grandeza.webp",
    bandcampUrl: "https://hatemecha.bandcamp.com/album/delirios-de-grandeza"
  },
  {
    id: "19",
    title: "19",
    coverSrc: "assets/music/19.webp",
    bandcampUrl: "https://hatemecha.bandcamp.com/album/19"
  },
  {
    id: "neogab",
    title: "neogab",
    coverSrc: "assets/music/neogab.webp",
    bandcampUrl: "https://hatemecha.bandcamp.com/album/neogab"
  },
  {
    id: "mori-somnia-non-memorias",
    title: "MORI SOMNIA NON MEMORIAS",
    coverSrc: "assets/music/mori-somnia-non-memorias.webp",
    bandcampUrl: "https://hatemecha.bandcamp.com/album/mori-somnia-non-memorias"
  }
] as const satisfies readonly Album[];

export type AlbumEntry = (typeof albums)[number];

export function albumCredits(album: AlbumEntry): string | undefined {
  return "credits" in album ? album.credits : undefined;
}
