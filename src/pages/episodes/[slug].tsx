import { parseISO, format } from "date-fns";
import ptBr from "date-fns/locale/pt-BR";

import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";


import { usePlayer} from "../../contexts/PlayerContext";
import { api } from "../../services/api";

import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import style from "./episode.module.scss";

type Episode = {
  id: string;
  title: string;
  members: string;
  duration: number;
  thumbnail: string;
  publishedAt: string;
  durationAsString: string;
  url: string;
  description: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {

const {play}=usePlayer()

  return (
    <div className={style.episode}>
         <Head>
        <title>{episode.title}|PodCastr</title>
      </Head>
      <div className={style.thumbnailContainer}>
        <Link href="/">
          <button>
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          objectFit="cover"
          src={episode.thumbnail}
        />
        <button onClick={()=>play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>
      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={style.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBr,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),

    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 7, //7dias
  };
};
