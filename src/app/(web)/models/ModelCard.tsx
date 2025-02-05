'use client';

import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { useModelStore } from '@/zustand/useModel';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import extractTitle from '@/app/util/extractTitle';

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;

export default function ModelCard({ model }: { model: Product }) {
  const { items } = useModelStore();
  const modelName = model.name;
  const [title, subtitle] = extractTitle(modelName);
  const content = model.extra.content;
  const index = items.indexOf(modelName) + 1;
  const router = useRouter();

  const handleClick = () => {
    router.push('/drive/new');
  };

  return (
    <li
      id="modelComponent"
      className="relative px-6 py-8 bg-item-background aspect-[32/35] overflow-hidden"
    >
      <div className="absolute top-8 left-6 flex flex-col gap-x-2">
        <h2 className="text-[2vw] mb-[4%] max-[1366px]:text-4xl font-[600] font-Hyundai-sans leading-none">
          {title.toUpperCase()}
        </h2>
        <h3 className="text-[1vw] max-[1366px]:text-base">{subtitle.toUpperCase()}</h3>
      </div>

      <article className="absolute top-[48%] left-0 translate-y-[-50%] w-full scale-[180%] ">
        <figure className="aspect-[8/3] relative right-[-30%]">
          {!model.mainImages ? (
            <Image
              src="/images/genesis-kr-gv70-facelift-sport-glossy-colors-uyuni-white-large.png"
              fill
              sizes="100%"
              alt=""
              priority
              className="absolute"
            />
          ) : (
            <Image
              src={SERVER + model.mainImages[0].path}
              fill
              sizes="100%"
              alt=""
              className="absolute"
              priority
            />
          )}
        </figure>
      </article>

      <h3 className="absolute left-0 bottom-8 w-full text-center text-[1vw] max-[1366px]:text-base">
        {content}
      </h3>

      {/* 호버시 작동하는 레이어 */}
      <section className="modelHoverLayer absolute w-full h-full top-0 right-[-120%]">
        <div className="absolute w-[50%] flex flex-col gap-y-[20px] justify-center top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[2]">
          <button
            className="text-xl flex items-center justify-center px-4 py-7 max-h-[40px]  hover:bg-white hover:text-black transition-all"
            type="button"
            onClick={handleClick}
          >
            전시시승
          </button>
          {title !== 'neolun' ? (
            <Link
              href={`/models/${index}`}
              className="text-xl flex items-center justify-center px-4 py-7 max-h-[40px] border-[#666] border-[1px] hover:bg-white hover:text-black transition-all"
            >
              구매하기
            </Link>
          ) : (
            <Button
              className="text-xl flex items-center justify-center px-4 py-7 max-h-[40px] hover:bg-white hover:text-black transition-all"
              onClick={() => alert('NEOLUN 차량은 준비 중 입니다.\n기대해주세요!')}
            >
              구매하기
            </Button>
          )}
        </div>
      </section>
    </li>
  );
}
