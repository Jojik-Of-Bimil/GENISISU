'use client';
import { useSession } from '@/hook/useSession';
import { Post } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FoldingText from './FoldingText';

export default function ListItem({ item, boardTypes }: { item: Post; boardTypes: string }) {
  const route = useRouter();
  const { session } = useSession();
  const handleDetailView = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (session?.user?.type !== 'admin' && boardTypes === 'drive') {
      let confirmText = confirm('관리자 권한이 필요합니다.\n관리자로 로그인 하시겠습니까?');
      if (confirmText) {
        route.push('/login');
      } else {
        return;
      }
    } else {
      route.push(`/${item.type}/${item._id}`);
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-slate-100 transition duration-300 ease-in-out">
      <td className="p-2 indent-1 break-keep max-[640px]:indent-0 max-[640px]:pl-[7%] max-[640px]:pr-[3%]">
        <Link href="#" onClick={(e) => handleDetailView(e)} className="cursor-pointer">
          <FoldingText fetchPostData={item} viewType="list" />
          {item.title}
        </Link>
      </td>
      <td className="p-2 text-center truncate max-[640px]:pl-0 max-[640px]:pr-[7%] max-[640px]:text-left">
        {item.user.name}
      </td>
      <td className="p-2 text-center hidden sm:table-cell">{item.views}</td>
      <td className="p-2 text-center hidden sm:table-cell">{item.repliesCount}</td>
      <td className="p-2 truncate text-center hidden sm:table-cell">
        {item.updatedAt.slice(0, 10)}
      </td>
    </tr>
  );
}
