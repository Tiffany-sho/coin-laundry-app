const stores = [
  {
    store_name: "御薗橋",
    location: "京都府京都市北区大宮南田尻町53-1",
    description:
      "スーパー「フレスコ」の北側に位置する24時間営業の店舗。洗濯乾燥機やスニーカー専用ランドリーも完備しています。",
    machines: [
      { name: "洗濯乾燥機", num: 3, comment: "10kg/1000円" },
      { name: "乾燥機", num: 2, comment: "10kg/1000円" },
      { name: "洗濯機", num: 1, comment: "10kg/1000円" },
      { name: "スニーカー洗濯機", num: 1, comment: "10kg/1000円" },
      { name: "ソフター自販機", num: 2, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Mison.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Mison.png",
      },
    ],
    owner: "699f360f-d50e-46a0-bf10-38d96216a752",
  },
  {
    store_name: "千本鞍馬口",
    location: "京都府京都市北区紫野南舟岡町15-2",
    description:
      "鞍馬口通りに面した店舗で、近隣にはスーパーマーケットもあります。24時間営業で、大型の洗濯乾燥機が利用できます。",
    machines: [
      { name: "洗濯乾燥機", num: 2, comment: "10kg/1000円" },
      { name: "乾燥機", num: 1, comment: "10kg/1000円" },
      { name: "洗濯機", num: 3, comment: "10kg/1000円" },
      { name: "スニーカー洗濯機", num: 1, comment: "10kg/1000円" },
      { name: "ソフター自販機", num: 1, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "SenBon.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/SenBon.png",
      },
    ],
    owner: "699f360f-d50e-46a0-bf10-38d96216a752",
  },
  {
    store_name: "衣笠わら天神",
    location: "京都府京都市北区衣笠高橋町1-23",
    description:
      "わら天神宮の近くにある店舗。大通りに面しており、車でのアクセスもしやすいです。",
    machines: [
      { name: "洗濯乾燥機", num: 2, comment: "10kg/1000円" },
      { name: "乾燥機", num: 3, comment: "10kg/1000円" },
      { name: "洗濯機", num: 2, comment: "10kg/1000円" },
      { name: "スニーカー洗濯機", num: 1, comment: "10kg/1000円" },
      { name: "ソフター自販機", num: 3, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Kinugasa.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Kinugasa.png",
      },
    ],
    owner: "699f360f-d50e-46a0-bf10-38d96216a752",
  },
  {
    store_name: "丸太町小川",
    location: "京都府京都市中京区小川通丸太町下る中之町78",
    description:
      "丸太町通から小川通を少し下がった場所にある店舗。周辺は住宅街で、地域住民に利用されています。",
    machines: [
      { name: "洗濯乾燥機", num: 1, comment: "10kg/1000円" },
      { name: "乾燥機", num: 2, comment: "10kg/1000円" },
      { name: "洗濯機", num: 2, comment: "10kg/1000円" },
      { name: "ソフター自販機", num: 1, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Maruta.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Maruta.png",
      },
    ],
    owner: "699f360f-d50e-46a0-bf10-38d96216a752",
  },
  {
    store_name: "瀬田大江",
    location: "滋賀県大津市大江6丁目30-18",
    description:
      "滋賀県大津市にある24時間営業のコインランドリー。駐車場も完備されており、大型の洗濯機も利用可能です。",
    machines: [
      { name: "洗濯乾燥機", num: 2, comment: "10kg/1000円" },
      { name: "乾燥機", num: 3, comment: "10kg/1000円" },
      { name: "洗濯機", num: 3, comment: "10kg/1000円" },
      { name: "シューズ洗濯機", num: 1, comment: "10kg/1000円" },
      { name: "ソフター自販機", num: 1, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Oue.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Oue.png",
      },
    ],
    owner: "699f360f-d50e-46a0-bf10-38d96216a752",
  },
  {
    store_name: "西大路東六角",
    location: "京都府京都市中京区壬生西大竹町11",
    description:
      "西大路六角の交差点から東に入った場所にある店舗。大型の洗濯乾燥機も設置されています。",
    machines: [
      { name: "洗濯乾燥機", num: 2, comment: "10kg/1000円" },
      { name: "乾燥機", num: 1, comment: "10kg/1000円" },
      { name: "シューズ洗濯機", num: 1, comment: "10kg/1000円" },
      { name: "ソフター自販機", num: 2, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Rokkaku.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Rokkaku.png",
      },
    ],
    owner: "699f360f-d50e-46a0-bf10-38d96216a752",
  },
];

export default stores;
