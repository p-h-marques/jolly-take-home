import type { Episode } from "@/api/types";

export interface EpisodeSection {
  season: number;
  data: Episode[];
}

export function groupEpisodesBySeason(episodes: Episode[]): EpisodeSection[] {
  const sections: EpisodeSection[] = [];

  for (const episode of episodes) {
    const current = sections[sections.length - 1];
    if (current?.season === episode.season) {
      current.data.push(episode);
    } else {
      sections.push({ season: episode.season, data: [episode] });
    }
  }

  return sections;
}
