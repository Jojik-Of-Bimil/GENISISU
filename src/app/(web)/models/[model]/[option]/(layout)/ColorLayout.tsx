'use client';

import useLocalStorage from '@/hook/useLocalStorage';
import { Cart, OptionDetail, OptionItem } from '@/types/product';
import { useModelStore } from '@/zustand/useModel';
import { useSelectUpdate } from '@/zustand/useSelectStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode, useRef, useState } from 'react';
import MobileTitleLayout from './MobileTitleLayout';
import { LayoutProps } from '@/types/optionLayout';
import MobilePriceLayout from './MobilePriceLayout';
import ButtonOption from '@/components/ButtonOption';
import ButtonReset from '@/components/ButtonReset';

const SERVER = process.env.NEXT_PUBLIC_API_SERVER;

// 2번레이아웃_컬러칩 옵션
export default function ColorLayout({ params, modelData, optionData }: LayoutProps) {
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
  let defaultItemName = defaultItems[0].name;
  let defaultItemImage = defaultItems[0].images ? SERVER + defaultItems[0].images[1].path : '';
  let defaultItemChipImage = defaultItems[0].images ? SERVER + defaultItems[0].images[0].path : '';
  const defaultItemPrice = storedValue.option?.[optionName]?.price || 0;
  if (storedValue.option?.[optionName]) {
    const storedNameArr = storedValue.option[optionName].name.split('-');
    [defaultGroupName, defaultItemName] = storedNameArr;
    defaultItemImage = storedValue.option[optionName].detailImage;
    defaultItemChipImage = storedValue.option[optionName].image || '';
  }

  const clickedOptionRef = useRef<Set<string>>(
    new Set([defaultGroupName, defaultGroupName + defaultItemName])
  );
  const defaultMapData = {
    group: defaultGroupName,
    item: defaultItemName,
    price: defaultItemPrice,
    image: defaultItemChipImage,
  };
  const textOptionRef = useRef<Map<string, string | number>>(
    new Map(Object.entries(defaultMapData))
  );

  const [optionState, setOptionState] = useState<{
    node: ReactNode;
    prevPrice: number;
    newPrice: number;
    imageSource: string;
    optionText: string;
  }>({
    node: null,
    prevPrice: storedValue.price,
    newPrice: storedValue.price,
    imageSource: defaultItemImage,
    optionText: defaultItemName,
  });

  const handleOptionClick = (
    optionGroup: string,
    optionItem: string,
    optionPrice: number,
    optionVehicleImage: string,
    optionColorChipImage: string
  ) => {
    clickedOptionRef.current.clear();
    clickedOptionRef.current.add(optionGroup);
    clickedOptionRef.current.add(optionGroup + optionItem);
    const newImage = optionVehicleImage;
    let newPrice = 0;
    if (storedValue.option?.[optionName]) {
      // 해당 옵션을 선택한 적 있는 경우
      const basePrice = storedValue.price - storedValue.option[optionName].price;
      newPrice = basePrice + optionPrice;
    } else {
      // 해당 옵션을 선택한 적 없는 경우
      newPrice = storedValue.price + optionPrice;
    }
    textOptionRef.current.set('group', optionGroup);
    textOptionRef.current.set('item', optionItem);
    textOptionRef.current.set('price', optionPrice);
    textOptionRef.current.set('image', optionColorChipImage);

    setOptionState({
      node: list,
      prevPrice: optionState.newPrice,
      newPrice: newPrice,
      imageSource: newImage,
      optionText: (textOptionRef.current.get('item') as string) || '',
    });
    updateCartItem({
      model: modelName,
      price: newPrice,
      option: {
        [optionName]: {
          name: optionGroup + '-' + optionItem,
          price: optionPrice,
          detailImage: newImage,
          image: optionColorChipImage,
        },
      },
    });
  };

  const isClicked = (item: string) =>
    clickedOptionRef.current.has(item) ? 'border-[3px] border-slate-300' : '';

  const generateOptionButton = (data: OptionItem): ReactNode => {
    const groupName = data.topText;
    const items = data.items || [];
    return items.map((item: OptionDetail, index: number) => {
      // const isBolder = index === lastIndex ? 'border-b-[1px]' : '';
      const { name, price = 0, images = [] } = item;
      const colorChipImage = SERVER + images[0].path;
      const vehicleImage = SERVER + images[1].path;
      return (
        <li
          key={name}
          onClick={() => handleOptionClick(groupName, name, price, vehicleImage, colorChipImage)}
          className="w-[95px] h-[50px]"
        >
          <figure
            className={`w-[95px] h-[50px] relative ${isClicked(
              groupName + name
            )} hover:cursor-pointer`}
          >
            <Image src={colorChipImage} fill sizes="100%" alt={`${name}`} />
          </figure>
        </li>
      );
    });
  };

  const isOptionActive = (option: string) =>
    clickedOptionRef.current.has(option) ? 'text-white' : 'text-[#666666]';

  const list = modelOptionData.map((optionGroup) => {
    const groupName = optionGroup.topText;
    const refItem = textOptionRef.current.get('item') || '';
    const itemName =
      textOptionRef.current.get('group') === groupName ? refItem : '(색상을 선택해주세요)';
    const optionData = generateOptionButton(optionGroup);
    return (
      <table key={groupName} className="mb-8 w-full">
        <tbody>
          {/* 그룹 타이틀 */}
          <tr>
            <td
              className={`pl-[15px] text-[22px] ${isOptionActive(
                groupName
              )} max-[1366px]:text-xl max-[1366px]:pl-0`}
            >
              {groupName}
            </td>
          </tr>
          {/* 옵션 텍스트 */}
          <tr
            className="grid grid-cols-[250px_1fr] auto-rows-[minmax(60px,_auto)] items-center text-[18px] gap-x-[86px] border-t-[1px] border-[#a4a4a4] pt-[30px] pl-[15px]
                        max-[1366px]:grid-cols-1 max-[1366px]:text-base max-[1366px]:gap-x-0 max-[1366px]:pl-0 max-[1366px]:pt-0"
          >
            <td
              className={`font-Hyundai-sans ${isOptionActive(
                groupName + itemName
              )} col-start-1 break-keep`}
            >
              {itemName}
            </td>
            <td className=" col-start-2 max-[1366px]:col-start-1">
              {/* 옵션 버튼 생성 */}
              <ul className="flex gap-[20px] flex-wrap max-[1366px]:justify-start">{optionData}</ul>
            </td>
          </tr>
        </tbody>
      </table>
    );
  });

  const { steps } = useModelStore();
  const currentStep = steps.indexOf(optionName);
  const nextStep = steps[currentStep + 1];
  const prevStep = steps[currentStep - 1] === 'detail' ? '' : steps[currentStep - 1];

  const clickButton = (e: React.MouseEvent<HTMLButtonElement>, direction?: string) => {
    e.preventDefault();
    const step = direction === 'prev' ? prevStep : nextStep;
    router.push(`/models/${params.model}/${step}`);
    const currentItem = `${textOptionRef.current!.get('group')}-${textOptionRef.current!.get(
      'item'
    )}`;
    setValue({
      model: modelName,
      price: optionState.newPrice,
      option: {
        ...storedValue.option,
        [optionName]: {
          name: currentItem,
          price: textOptionRef.current!.get('price') as number,
          image: textOptionRef.current!.get('image') as string,
          detailImage: optionState.imageSource,
        },
      },
    });
  };

  return (
    <>
      <section
        className="min-h-screen relative grid grid-cols-[400px_auto_280px] gap-x-[4rem] pr-[3rem] box-border items-center 
                        max-[1366px]:grid-cols-1 max-[1366px]:grid-rows-[max-content_auto] max-[1366px]:pr-0 max-[1366px]:min-h-0"
      >
        {/* 모바일에서만 보여질 상단바 */}
        <MobileTitleLayout optionName={optionName} modelName={modelName} clickBtn={clickButton} />

        {/* 옵션명 */}
        <article className="col-start-2 flex flex-col items-center w-full py-[80px] max-[1366px]:col-start-1 max-[1366px]:px-[7%] max-[1366px]:py-[0px] max-[1366px]:self-start max-[1366px]:mt-[50px]">
          {/* RESET 버튼 */}
          <div className="hidden absolute top-4 right-8 max-[1366px]:flex max-[1366px]:z-[6]">
            <ButtonReset model={modelName} price={initialPrice} />
          </div>
          <figure className="w-full max-h-[500px] aspect-[2.4/1] relative overflow-hidden">
            <Image
              src={optionState.imageSource}
              fill
              sizes="100%"
              alt=""
              className="absolute scale-150"
              style={{ objectFit: 'contain' }}
              priority
            />
          </figure>
          <h4 className="text-base mt-[20px] max-[1366px]:text-sm max-[1366px]:mb-[40px] max-[1366px]:text-[#666]">
            상기 이미지는 차량의 대표 이미지로 적용되어 있습니다.
          </h4>
          <div className="tableWrap mt-[50px] w-full max-[1366px]:mt-[10px]">{list}</div>
        </article>
        {/* 화살표 이동 버튼 */}
        <ButtonOption clickHandler={clickButton} model={modelName} price={initialPrice} />
        {/* 웹 예상가격 */}
        <div className="h-full max-[1366px]:hidden">
          <aside
            className="sticky right-[100px] top-[calc(100vh_-120px)] bg-black font-Hyundai-sans border-[1px] border-[#666] flex flex-col pl-[35px] pt-[10px]
                            justify-center"
          >
            <p className="text-[15px] text-[#a4a4a4] max-[1366px]:text-xl">예상 가격</p>
            <span className="text-[30px] font-bold mt-[-10px] max-[1366px]:text-xl max-[1366px]:mt-0">
              {optionState.newPrice.toLocaleString('ko-KR')}
              <span className="text-[20px] align-middle max-[1366px]:text-xl"> 원</span>
            </span>
          </aside>
        </div>
      </section>

      {/* 모바일 예상가격 */}
      <MobilePriceLayout mobilePrice={optionState.newPrice} />
    </>
  );
}
