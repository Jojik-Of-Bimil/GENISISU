import Submit from '@/components/Submit';
import { Metadata } from 'next';
import Link from 'next/link';
import CommentList from './CommentList';
import { fetchPost } from '@/data/fetch/postFetch';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import Image from 'next/image';

export async function generateMetadata({
  params,
}: {
  params: { boards: string; id: string };
}): Promise<Metadata> {
  const boardName = params.boards;
  const item = await fetchPost(params.id);
  if (item === null) notFound();
  return {
    title: `${boardName} - ${item.title}`,
    description: `${boardName} - ${item.content}`,
    openGraph: {
      title: `${boardName} - ${item.title}`,
      description: `${boardName} - ${item.content}`,
      url: `/${params.boards}/${params.id}`,
    },
  };
}

export async function generateStaticParams() {
  return [
    { boards: 'info', id: '4' },
    { boards: 'info', id: '5' },
  ];
}

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;

export default async function Page({ params }: { params: { boards: string; id: string } }) {
  // const item = await model.post.detail(Number(params.id));
  const session = await auth();
  const item = await fetchPost(params.id);
  if (item === null) notFound();
  const board = params.boards === 'drive' ? '전시시승 게시글' : params.boards === 'info' ? '공지사항 게시글' : '고객지원 게시글';
  const profileImage = SERVER + item.user.image;

  return (
    <main className="bg-white dark:bg-white px-40 py-20">
      <section className="mb-8 p-4">
        <h2 className='inline-block text-sm mb-2 p-2 border border-gray-[#aaa] bg-transparent'>{board}</h2>
        <div className="font-normal text-[42px] mb-2">
          {item.title}
        </div>
        <div className='flex gap-2 justify-start items-center mb-6'>
          <figure className='relative w-[34px] h-[34px] aspect-auto'>
            <Image fill sizes='100%' src={profileImage} alt="작성자 프로필 사진" />
          </figure>
          <div>
            <span className='block text-black text-sm'>
              {item.extra?.name}
            </span>
            <time 
              className='block text-[#aaa] text-sm font-normal'
              style={{ fontFamily: 'Hyundai-sans' }}
            >{item.createdAt}</time>
          </div>
        </div>
        <span className='block mb-12 border-b-[1px] border-gray-400 border-solid'></span>
        <div className="text-black text-lg mb-2 font-light">
          {params.boards === 'drive' ? '희망 플레이스 : ' : ''}
          {item.address}
        </div>
        <div className="text-black text-lg mb-12 font-light">연락처 : {item.phone}</div>
        <div className="text-black text-lg mb-20 font-light"> {item.content}</div>

        <div className="flex justify-end my-4">
          <Link
            href={`/${params.boards}`}
            className="bg-black py-1 px-4 text-base text-white ml-2"
          >
            목록
          </Link>
          {(session?.user?.id === String(item.user?._id) || session?.user?.type === 'admin') && (
            <>
              <Link
                href={`/${params.boards}/${params.id}/edit`}
                className="py-1 px-4 mr-2 text-base text-black border-gray-600 border ml-2"
              >
                수정
              </Link>
              <Submit bgColor="black">삭제</Submit>
            </>
          )}
        </div>
      </section>

      <CommentList params={params} />
    </main>
  );
}
