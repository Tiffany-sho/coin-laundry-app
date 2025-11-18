const stores = [
  {
    id: "a71b4261-7abb-4cc3-8855-be3b8d0dc474",
    store: "御薗橋",
    location: "京都府京都市北区大宮南田尻町53-1",
    description:
      "スーパー「フレスコ」の北側に位置する24時間営業の店舗。洗濯乾燥機やスニーカー専用ランドリーも完備しています。",
    machines: [
      { id: 1, name: "洗濯乾燥機", num: 3, comment: "10kg/1000円" },
      { id: 2, name: "乾燥機", num: 2, comment: "10kg/1000円" },
      { id: 3, name: "洗濯機", num: 1, comment: "10kg/1000円" },
      { id: 4, name: "スニーカー洗濯機", num: 1, comment: "10kg/1000円" },
      { id: 5, name: "ソフター自販機", num: 2, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Mison.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Mison.png",
      },
    ],
    owner: "c21ed2db-5903-4ad9-99db-c42d72a352a0",
  },
  {
    id: "46dcfae5-5193-46d6-babd-3c69d528b8c6",
    store: "千本鞍馬口",
    location: "京都府京都市北区紫野南舟岡町15-2",
    description:
      "鞍馬口通りに面した店舗で、近隣にはスーパーマーケットもあります。24時間営業で、大型の洗濯乾燥機が利用できます。",
    machines: [
      { id: 1, name: "洗濯乾燥機", num: 2, comment: "10kg/1000円" },
      { id: 2, name: "乾燥機", num: 1, comment: "10kg/1000円" },
      { id: 3, name: "洗濯機", num: 3, comment: "10kg/1000円" },
      { id: 4, name: "スニーカー洗濯機", num: 1, comment: "10kg/1000円" },
      { id: 5, name: "ソフター自販機", num: 1, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "SenBon.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/SenBon.png",
      },
    ],
    owner: "c21ed2db-5903-4ad9-99db-c42d72a352a0",
  },
  {
    id: "ed757d30-2e3c-447f-8e2c-ee298d3f9387",
    store: "衣笠わら天神",
    location: "京都府京都市北区衣笠高橋町1-23",
    description:
      "わら天神宮の近くにある店舗。大通りに面しており、車でのアクセスもしやすいです。",
    machines: [
      { id: 1, name: "洗濯乾燥機", num: 2, comment: "10kg/1000円" },
      { id: 2, name: "乾燥機", num: 3, comment: "10kg/1000円" },
      { id: 3, name: "洗濯機", num: 2, comment: "10kg/1000円" },
      { id: 4, name: "スニーカー洗濯機", num: 1, comment: "10kg/1000円" },
      { id: 5, name: "ソフター自販機", num: 3, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Kinugasa.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Kinugasa.png",
      },
    ],
    owner: "c21ed2db-5903-4ad9-99db-c42d72a352a0",
  },
  {
    id: "c203b588-d7f8-4622-b2c0-9a70a929f0fd",
    store: "丸太町小川",
    location: "京都府京都市中京区小川通丸太町下る中之町78",
    description:
      "丸太町通から小川通を少し下がった場所にある店舗。周辺は住宅街で、地域住民に利用されています。",
    machines: [
      { id: 1, name: "洗濯乾燥機", num: 1, comment: "10kg/1000円" },
      { id: 2, name: "乾燥機", num: 2, comment: "10kg/1000円" },
      { id: 3, name: "洗濯機", num: 2, comment: "10kg/1000円" },
      { id: 4, name: "ソフター自販機", num: 1, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Maruta.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Maruta.png",
      },
    ],
    owner: "c21ed2db-5903-4ad9-99db-c42d72a352a0",
  },
  {
    id: "a9fa7a46-334c-4b76-955b-5f0e8d8c1c54",
    store: "西大路東六角",
    location: "京都府京都市中京区壬生西大竹町11",
    description:
      "西大路六角の交差点から東に入った場所にある店舗。大型の洗濯乾燥機も設置されています。",
    machines: [
      { id: 1, name: "洗濯乾燥機", num: 2, comment: "10kg/1000円" },
      { id: 2, name: "乾燥機", num: 1, comment: "10kg/1000円" },
      { id: 3, name: "シューズ洗濯機", num: 1, comment: "10kg/1000円" },
      { id: 4, name: "ソフター自販機", num: 2, comment: "10kg/1000円" },
    ],
    images: [
      {
        path: "Rokkaku.png",
        url: "https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/Rokkaku.png",
      },
    ],
    owner: "c21ed2db-5903-4ad9-99db-c42d72a352a0",
  },
];

export default stores;
