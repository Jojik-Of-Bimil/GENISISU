'use client';

import useLocalStorage from '@/hook/useLocalStorage';
import { Cart } from '@/types/product';
import { useModelStore } from '@/zustand/useModel';
import { useSelectUpdate } from '@/zustand/useSelectStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode, useRef, useState } from 'react';
import MobileTitleLayout from './MobileTitleLayout';
import { LayoutProps, OptionEventParams } from '@/types/optionLayout';
import MobilePriceLayout from './MobilePriceLayout';
import ButtonOption from '@/components/ButtonOption';
import ButtonReset from '@/components/ButtonReset';

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;

// 3번레이아웃_기본 default 옵션 사진 가로
export default function HorizontalLayout({ params, modelData, optionData }: LayoutProps) {
  const updateCartItem = useSelectUpdate();
  const router = useRouter();
  const optionName = params.option;
  const modelName = modelData.name;
  const initialPrice = modelData.price;
  const modelOptionData = optionData[0].extra.option[optionName][modelName];

  const [storedValue, setValue] = useLocalStorage<Cart>(modelName, {
    model: modelName,
    price: initialPrice,
  });

  const defaultData = modelOptionData[0];
  const defaultItems = defaultData.items || [];
  let defaultGroupName = defaultData.topText;
  let defaultItemName = defaultGroupName + '-' + defaultItems[0].name;
  let defaultItemImage = defaultItems[0].image ? SERVER + defaultItems[0].image.path : '';
  let defaultItemDescription = defaultItems[0].description || '';
  let selectedItems: { name: string; price: number }[] = [];
  let defaultItemPrice = 0;
  if (storedValue.option?.[optionName]) {
    const storedOption = storedValue.option[optionName];
    defaultItemName = storedOption.name;
    defaultGroupName = defaultItemName.split('-')[0];
    defaultItemImage = storedOption.detailImage;
    defaultItemDescription = storedOption.description || defaultItemDescription;
    selectedItems = storedOption.selectedItems || selectedItems;
    defaultItemPrice = storedOption.price;
  }

  const defaultMapData = {
    group: defaultGroupName,
    item: defaultItemName,
    price: defaultItemPrice,
  };
  const clickedOptionRef = useRef<Map<string, string | number>>(
    new Map(Object.entries(defaultMapData))
  );
  const checkOptionRef = useRef<Set<{ name: string; price: number }>>(new Set(selectedItems));

  const isGroupActive = (option: string) =>
    clickedOptionRef.current.get('group') === option ? 'text-white' : 'text-[#666666]';

  const isItemActive = (item: string) =>
    clickedOptionRef.current.get('item') === item ? 'text-white' : 'text-[#666666]';

  const list = modelOptionData.map((optionGroup, i) => {
    const groupName = optionGroup.topText;
    const price = optionGroup.price;
    const groupItems = optionGroup.items || [];
    const groupImage = groupItems[0]?.image?.path
      ? SERVER + groupItems[0].image.path
      : defaultItemImage;
    const firstItem = groupItems[0]?.name;
    const firstItemText = groupItems[0].description || '';
    const matchedItems = [...checkOptionRef.current].filter((item) => item.name === groupName);
    const checkIcon =
      matchedItems.length > 0 ? '/images/check_activate.svg' : '/images/check_deactivate.svg';
    const textItems = groupItems.length > 1 ? groupItems : [];
    let optionEventParams = {
      optionGroup: groupName,
      optionItem: firstItem,
      optionImage: groupImage,
      optionText: firstItemText,
      optionPrice: price,
    };
    return (
      <tr
        key={groupName + i}
        className={`flex flex-col items-left text-[18px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] py-[15px] pl-[15px] max-[1366px]:text-base max-[1366px]:pl-0 max-[1366px]:py-[5px]`}
      >
        <td
          onClick={() => handleOptionClick(optionEventParams)}
          className={`flex gap-x-3 items-center font-bold ${isGroupActive(groupName)} `}
        >
          <figure
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleOptionCheck(e, optionEventParams)
            }
            className="w-[30px] h-[30px] relative hover:cursor-pointer max-[1366px]:w-[20px] max-[1366px]:h-[20px]"
          >
            <Image src={checkIcon} fill sizes="100%" alt="check icon" />
          </figure>
          <span className="hover:cursor-pointer">{groupName}</span>
        </td>
        <td className="font-Hyundai-sans text-[16px] text-[#666666] px-11">
          + {price.toLocaleString('ko-KR')} 원
        </td>
        <td className={`mt-2`}>
          <ul className="list-disc px-[60px] text-[16px]">
            {textItems.map((item, j) => {
              const itemName = item.name;
              let optionEventParams = {
                optionGroup: groupName,
                optionItem: itemName,
                optionImage: item.image?.path ? SERVER + item.image.path : '',
                optionText: item.description || '',
                optionPrice: item.price || 0,
              };
              return (
                <li
                  key={item.name + j}
                  onClick={() => handleOptionClick(optionEventParams)}
                  className={`${isItemActive(groupName + '-' + itemName)} hover:cursor-pointer`}
                >
                  {item.name}
                </li>
              );
            })}
          </ul>
        </td>
      </tr>
    );
  });

  const [optionState, setOptionState] = useState<{
    node: ReactNode;
    prevPrice: number;
    newPrice: number;
    imageSource: string;
    optionText: string;
  }>({
    node: list,
    prevPrice: storedValue.price,
    newPrice: storedValue.price,
    imageSource: defaultItemImage,
    optionText: defaultItemDescription,
  });

  const handleOptionClick = ({
    optionGroup,
    optionItem,
    optionImage,
    optionText,
    optionPrice,
  }: OptionEventParams) => {
    clickedOptionRef.current.clear();
    clickedOptionRef.current.set('group', optionGroup);
    clickedOptionRef.current.set('item', optionGroup + '-' + optionItem);
    clickedOptionRef.current.set('price', optionPrice);
    const newImage = optionImage;

    setOptionState((preState) => ({
      ...preState,
      node: list,
      imageSource: newImage,
      optionText: optionText,
    }));

    updateCartItem({
      model: modelName,
      price: optionState.newPrice,
      option: {
        [optionName]: {
          name: optionGroup + '-' + optionItem,
          price: optionPrice,
          detailImage: newImage,
          description: optionText,
          selectedItems: [...checkOptionRef.current],
        },
      },
    });
  };

  const handleOptionCheck = (
    event: React.MouseEvent,
    { optionGroup, optionItem, optionImage, optionText, optionPrice }: OptionEventParams
  ) => {
    event.stopPropagation();
    handleOptionClick({ optionGroup, optionItem, optionImage, optionText, optionPrice });
    let newPrice = optionState.newPrice;
    const matchedGroupArray = [...checkOptionRef.current].filter(
      (option) => option.name === optionGroup
    );
    if (matchedGroupArray.length > 0) {
      const newRef = [...checkOptionRef.current].filter((option) => option.name !== optionGroup);
      checkOptionRef.current.clear();
      newRef.map((option) => checkOptionRef.current.add(option));
      newPrice = optionPrice === 0 ? newPrice : newPrice - optionPrice;
    } else {
      checkOptionRef.current.add({
        name: optionGroup,
        price: optionPrice,
      });
      newPrice = optionPrice === 0 ? newPrice : newPrice + optionPrice;
    }
    setOptionState((prevState) => ({
      ...prevState,
      node: list,
      prevPrice: prevState.newPrice,
      newPrice: newPrice,
    }));
    updateCartItem({
      model: modelName,
      price: newPrice,
      option: {
        [optionName]: {
          name: clickedOptionRef.current!.get('item') as string,
          price: clickedOptionRef.current!.get('price') as number,
          detailImage: optionState.imageSource,
          description: optionState.optionText,
          selectedItems: [...checkOptionRef.current],
        },
      },
    });
  };

  const { steps } = useModelStore();
  const currentStep = steps.indexOf(optionName);
  const nextStep = steps[currentStep + 1];
  const prevStep = steps[currentStep - 1] === 'detail' ? '' : steps[currentStep - 1];
  const clickButton = (e: React.MouseEvent<HTMLButtonElement>, direction?: string) => {
    e.preventDefault();
    const step = direction === 'prev' ? prevStep : nextStep;
    router.push(`/models/${params.model}/${step}`);
    setValue({
      model: modelName,
      price: optionState.newPrice,
      option: {
        ...storedValue.option,
        [optionName]: {
          name: clickedOptionRef.current!.get('item') as string,
          price: clickedOptionRef.current!.get('price') as number,
          detailImage: optionState.imageSource,
          description: optionState.optionText,
          selectedItems: [...checkOptionRef.current],
        },
      },
    });
  };

  const text = optionState.optionText;
  const regex = /※.*/g;
  const matches = text.match(regex);
  const annotation = matches && matches.join('\n'); // 주석
  const mainText = annotation && text.replace(annotation, ''); // 본문

  return (
    <>
      <section
        className="h-screen relative grid grid-cols-[400px_auto] gap-x-[4rem] 
                        max-[1366px]:grid-cols-1 max-[1366px]:grid-rows-[max-content_auto] max-[1366px]:h-max max-[1366px]:mb-[50px]"
      >
        {/* 모바일에서만 보여질 상단바 */}
        <MobileTitleLayout optionName={optionName} modelName={modelName} clickBtn={clickButton} />

        {/* 옵션명 */}
        <article
          className="col-start-2 grid grid-cols-2 justify-center items-top max-w-[90vw] mt-[120px] mr-[100px] 
                            max-[1366px]:col-start-1 max-[1366px]:mr-0 max-[1366px]:justify-self-center max-[1366px]:mt-[50px] max-[1366px]:grid-cols-1 max-[1366px]:min-h-full max-[1366px]:self-start
                            max-[1366px]:max-w-full max-[1366px]:px-[7%] max-[1366px]:w-full"
        >
          {/* RESET 버튼 */}
          <div className="hidden absolute top-4 right-8 max-[1366px]:flex max-[1366px]:z-[6]">
            <ButtonReset model={modelName} price={initialPrice} />
          </div>
          <div className="flex flex-col mr-[40px] max-[1366px]:mr-0">
            {/* <figure className="w-[650px] h-[325px] relative"> */}
            <figure className="aspect-[16/9] relative">
              <Image
                src={optionState.imageSource}
                priority
                fill
                sizes="100%"
                className="absolute w-full"
                style={{ objectFit: 'contain' }}
                alt=""
              />
            </figure>
            {/* <h4 className="w-[650px] mb-[20px] self-center mt-[20px] text-[16px]"> */}
            <h4 className="w-full mb-[20px] self-center mt-[20px] text-[16px]">
              <pre className="font-Hyundai-sans whitespace-pre-wrap max-[1366px]:break-keep">
                {mainText}
              </pre>
              <pre className="font-Hyundai-sans whitespace-pre-wrap text-[#666666]">
                {annotation}
              </pre>
            </h4>
          </div>
          {/* 선택 옵션 항목 */}
          <article className="w-full h-[550px] overflow-scroll border-t-[1px] border-b-[1px] border-[#a4a4a4] max-[1366px]:h-full max-[1366px]:overflow-visible z-5">
            <table className="w-full">
              <tbody>{list}</tbody>
            </table>
          </article>
        </article>

        {/* 화살표 이동 버튼 */}
        <ButtonOption clickHandler={clickButton} model={modelName} price={initialPrice} />

        {/* 예상가격 */}
        <div className="h-full w-[280px] absolute bottom-0 right-[3rem] max-[1366px]:hidden">
          <aside
            className="sticky top-[calc(100vh_-120px)] bg-black font-Hyundai-sans border-[1px] border-[#666] flex flex-col pl-[35px] pt-[10px]
                            max-[1366px]:flex-row max-[1366px]:pl-0 max-[1366px]:pt-0 max-[1366px]:items-center max-[1366px]:justify-center"
          >
            <p className="text-[15px] text-[#a4a4a4] max-[1366px]:text-xl">예상 가격</p>
            <span className="text-[30px] font-bold mt-[-10px] max-[1366px]:text-xl max-[1366px]:mt-0">
              {optionState.newPrice.toLocaleString('ko-KR')}
              <span className="text-[20px] align-middle"> 원</span>
            </span>
          </aside>
        </div>
      </section>

      {/* 모바일 예상가격 */}
      <MobilePriceLayout mobilePrice={optionState.newPrice} />
    </>
  );
}
