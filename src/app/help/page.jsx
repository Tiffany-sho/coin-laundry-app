import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import NextImage from "next/image";
import * as Icon from "@/app/feacher/Icon";

export const metadata = {
  title: "ヘルプ・使い方ガイド",
  description: "Collecie の使い方ガイド。各ページの説明と操作手順をまとめています。",
};

/**
 * ⚠️ **章立てはナビの並びに合わせてある**（2026-08-07 に組み直した）。
 *    それまでは「集金記録 / 在庫管理 / 設備管理」という**もう存在しない画面名**で
 *    書かれていて、在庫と設備が別ページだった頃（〜2026-08-05）のままだった。
 *    ⚠️ **ナビを変えたらここも変えること**（`FooterNavber.jsx` の `ALL_NAV_ITEMS`）。
 *
 * ⚠️ **「メンバーと権限」だけはナビに無い章。** 参加の手順が
 *    設定 → 組織 の奥にあり、招待される側と承認する側で見る画面が違うため、
 *    設定の一項目に埋めると辿り着けない。
 */
const SECTIONS = [
  { id: "home",     label: "ホーム" },
  { id: "store",    label: "店舗" },
  { id: "revenue",  label: "収益" },
  { id: "expenses", label: "経費" },
  { id: "manage",   label: "管理" },
  { id: "members",  label: "メンバーと権限" },
  { id: "settings", label: "設定" },
];

const Step = ({ num, children }) => (
  <HStack align="start" gap={3}>
    <Flex
      w="22px" h="22px" borderRadius="full" flexShrink={0}
      bg="var(--teal, #0891B2)" color="white" fontSize="11px" fontWeight="bold"
      align="center" justify="center" mt="2px"
    >
      {num}
    </Flex>
    <Text fontSize="sm" color="var(--text-main, #1E3A5F)" lineHeight="1.7">{children}</Text>
  </HStack>
);

const Note = ({ children }) => (
  <HStack
    p={3} bg="cyan.50" borderRadius="lg"
    border="1px solid" borderColor="cyan.200"
    align="start" gap={2}
  >
    <Box color="var(--teal, #0891B2)" flexShrink={0} mt="2px">
      <Icon.LuInfo size={14} />
    </Box>
    <Text fontSize="xs" color="var(--teal-deeper, #155E75)" lineHeight="1.7">{children}</Text>
  </HStack>
);

/**
 * ⚠️ **`notes` は配列**（旧 `note` の単数から変えた）。1 つの章に注意書きが
 *    2 つ以上あるとき、以前は 1 文に詰め込むしかなく長い塊になっていた。
 * ⚠️ **`screenshots` も配列**。集金の入力とレポートのように、
 *    1 つの章に複数の画面がぶら下がるため。空なら「準備中」の枠を出す。
 *
 * ⚠️ **`screenshots` は縦長（スマホ）だけにすること。** 右の欄は 280px 固定なので、
 *    **横長の PC 画面（1498×704）を入れると 280×131 まで縮んで何も読めない。**
 *    載せる必要が出たら、右の欄ではなく本文の下に全幅で敷く形にすること。
 */
const SectionCard = ({
  id, icon, title, description, steps,
  screenshots = [], notes = [],
}) => (
  <Box
    id={id}
    bg="var(--card-bg, #FFFFFF)"
    borderRadius="18px"
    border="1px solid"
    borderColor="cyan.100"
    boxShadow="var(--shadow-sm, 0 2px 12px rgba(8,145,178,0.08))"
    overflow="hidden"
    scrollMarginTop="80px"
  >
    <HStack
      px={5} py={4}
      borderBottom="1px solid"
      borderColor="var(--divider, #F1F5F9)"
      gap={3}
      style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
    >
      <Box color="white" fontSize="xl">{icon}</Box>
      <Text fontSize="lg" fontWeight="bold" color="white">{title}</Text>
    </HStack>

    <Box p={{ base: 5, md: 6 }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={6}
        align="start"
      >
        <VStack align="stretch" gap={4} flex="1" minW={0}>
          <Text fontSize="sm" color="var(--text-muted, #64748B)" lineHeight="1.8">
            {description}
          </Text>
          {steps.length > 0 && (
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="var(--teal, #0891B2)" textTransform="uppercase" letterSpacing="wider" mb={3}>
                使い方
              </Text>
              <VStack align="stretch" gap={2.5}>
                {steps.map((step, i) => (
                  <Step key={i} num={i + 1}>{step}</Step>
                ))}
              </VStack>
            </Box>
          )}
          {notes.length > 0 && (
            <VStack align="stretch" gap={2}>
              {notes.map((note, i) => (
                <Note key={i}>{note}</Note>
              ))}
            </VStack>
          )}
        </VStack>

        {screenshots.length > 0 ? (
          <VStack
            flexShrink={0}
            w={{ base: "full", md: "280px" }}
            gap={3}
            align="stretch"
          >
            {/*
              ⚠️ **枠（ボーダー・角丸・影）を付けないこと。** スクショは
                 端末の枠込みで書き出してあり、**背景が透過している**。
                 四角い枠を回すと、透けた角の外側に線だけが浮いて見える。
                 影も同じ理由で画像側に任せる。
            */}
            {screenshots.map((shot) => (
              <Box key={shot.src}>
                <NextImage
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.w}
                  height={shot.h}
                  sizes="(max-width: 768px) 92vw, 280px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            ))}
          </VStack>
        ) : (
          <Box
            flexShrink={0}
            w={{ base: "full", md: "280px" }}
            h="160px"
            borderRadius="xl"
            border="2px dashed"
            borderColor="cyan.200"
            bg="cyan.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <VStack gap={1}>
              <Box color="cyan.300"><Icon.LuFileImage size={24} /></Box>
              <Text fontSize="xs" color="cyan.400">スクリーンショット準備中</Text>
            </VStack>
          </Box>
        )}
      </Flex>
    </Box>
  </Box>
);

export default function HelpPage() {
  return (
    <Box bg="var(--app-bg, #F0F9FF)" minH="100vh" pb={{ base: "120px", md: "48px" }}>
      <Box maxW="800px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>

        {/* ヘッダー */}
        <VStack align="stretch" gap={2} mb={8}>
          <HStack justify="space-between" align="center">
            <HStack gap={2}>
              <Box color="var(--teal, #0891B2)"><Icon.LuInfo size={20} /></Box>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper, #155E75)">
                ヘルプ・使い方ガイド
              </Text>
            </HStack>
            <Link href="/settings">
              <HStack gap={1} color="var(--text-muted, #64748B)" fontSize="sm" cursor="pointer"
                _hover={{ color: "var(--text-main, #1E3A5F)" }} flexShrink={0}>
                <Icon.LuChevronLeft size={16} />
                <Text>戻る</Text>
              </HStack>
            </Link>
          </HStack>
          <Text fontSize="sm" color="var(--text-muted, #64748B)">
            Collecie の各ページの説明と操作手順をまとめています。
          </Text>
        </VStack>

        {/*
          画面の行き来。
          ⚠️ **設定への行き方を必ず書く。** スマホでは下のタブに「設定」が無く、
             **右上の歯車が唯一の入口**なので（`SettingsGear`）、
             書いていないとサインアウトも組織の設定も見つけられない。
        */}
        <Box
          bg="var(--card-bg, #FFFFFF)"
          borderRadius="16px"
          border="1px solid"
          borderColor="cyan.100"
          boxShadow="var(--shadow-sm, 0 2px 12px rgba(8,145,178,0.08))"
          p={5}
          mb={4}
        >
          <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper, #155E75)" mb={2}>
            画面の行き来
          </Text>
          <Text fontSize="xs" color="var(--text-muted, #64748B)" lineHeight="1.8" mb={3}>
            スマホでは画面下、PC では画面上のメニューから
            「ホーム」「店舗」「収益」「管理」「経費」の 5 つを行き来します。
          </Text>
          <HStack
            p={3} bg="cyan.50" borderRadius="lg"
            border="1px solid" borderColor="cyan.200"
            align="start" gap={2}
          >
            <Box color="var(--teal, #0891B2)" flexShrink={0} mt="2px">
              <Icon.LuSettings size={14} />
            </Box>
            <Text fontSize="xs" color="var(--teal-deeper, #155E75)" lineHeight="1.7">
              <Box as="span" fontWeight="bold">設定は下のタブにはありません。</Box>
              {" "}スマホでは画面右上の歯車アイコンから開きます。PC では上のメニューの「設定」です。
              サインアウト・組織・プラン・お知らせはすべてこの中にあります。
            </Text>
          </HStack>
        </Box>

        {/* 目次 */}
        <Box
          bg="var(--card-bg, #FFFFFF)"
          borderRadius="16px"
          border="1px solid"
          borderColor="cyan.100"
          boxShadow="var(--shadow-sm, 0 2px 12px rgba(8,145,178,0.08))"
          p={5}
          mb={6}
        >
          <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper, #155E75)" mb={3}>
            目次
          </Text>
          <Flex wrap="wrap" gap={2}>
            {SECTIONS.map((s) => (
              <Link key={s.id} href={`#${s.id}`}>
                <Box
                  px={3} py={1.5}
                  bg="cyan.50"
                  color="var(--teal, #0891B2)"
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="semibold"
                  border="1px solid"
                  borderColor="cyan.200"
                  transition="all 0.15s"
                  _hover={{ bg: "var(--teal, #0891B2)", color: "white", borderColor: "var(--teal, #0891B2)" }}
                >
                  {s.label}
                </Box>
              </Link>
            ))}
          </Flex>
        </Box>

        {/* セクション */}
        <VStack align="stretch" gap={5}>

          {/* ホーム */}
          <SectionCard
            id="home"
            icon={<Icon.IoHomeOutline />}
            title="ホーム"
            description="ログイン後の最初の画面です。次の集金日までのカウントダウン、今月の売上、在庫と設備の要対応、直近の集金記録が一画面にまとまっています。"
            steps={[
              "「集金カウントダウン」で次の集金日と残り日数を確認します。",
              "売上カードで今月の集金額を確認します。",
              "「クイックアクション」から、集金の記録・在庫の更新・店舗一覧・レポートへ 1 タップで移動できます。",
              "「今日の対応状況」に在庫切れや故障中の機器の件数が出ます。数字が付いていたら「管理」で対応します。",
              "「直近の集金記録」で最近の集金履歴を確認します。",
            ]}
            notes={[
              "集金カウントダウンは、設定の「集金スケジュール」（毎週◯曜日 / 毎月◯日）を登録すると表示されます。",
              "クイックアクションの「集金を記録」「在庫を更新」は、閲覧者には表示されません。",
            ]}
            screenshots={[
              { src: "/screenshots/home.png", alt: "ホーム画面", w: 1320, h: 2868 },
            ]}
          />

          {/* 店舗 */}
          <SectionCard
            id="store"
            icon={<Icon.MdOutlineLocalLaundryService />}
            title="店舗"
            description="コインランドリー店舗の登録・編集を行うページです。ここで登録した店舗が、集金・在庫・設備・経費すべての土台になります。設置機器と支払方法も店舗ごとに設定します。"
            steps={[
              "店舗一覧の右下にある「＋」から新規登録します。",
              "店舗名・場所・概要を入力します。",
              "「設置機器」に洗濯乾燥機・乾燥機などの名前と台数を登録します。ここで登録した機器が、集金入力と設備の画面に並びます。",
              "「支払方法」に PayPay・クレジットカードなど現金以外の受け取り方を登録します。現金は登録しなくても常に記録されます。",
              "店舗の写真を 5 枚までアップロードできます。",
              "店舗カードから詳細ページへ進むと、その店舗だけの売上と集金履歴が見られます。編集は詳細ページの編集ボタンから行います。",
            ]}
            notes={[
              "登録できる店舗数はプランごとに、Free は 3 店舗、Pro は 5 店舗、Pro+ は 10 店舗、Max は無制限です。",
              "支払方法を一覧から外しても、過去の集金記録からは消えません。「使わなくなった支払方法」として残るので、押せばいつでも戻せます。",
            ]}
            screenshots={[
              { src: "/screenshots/store-list.png", alt: "店舗一覧", w: 1320, h: 2868 },
              { src: "/screenshots/store-detail.png", alt: "店舗の詳細ページ", w: 1320, h: 2868 },
            ]}
          />

          {/* 収益 */}
          <SectionCard
            id="revenue"
            icon={<Icon.BiCoinStack />}
            title="収益"
            description="集金を記録し、売上を分析するページです。上に総額のカード、まん中に切り替え式のグラフ、下に売上履歴が並びます。"
            steps={[
              "集金を記録するには、店舗の詳細ページ・店舗一覧・ホームのクイックアクションのいずれかから「集金を記録」を押します。",
              "支払方法を登録した店舗では「何を集金しますか？」と聞かれます。「現金のみ」「現金以外のみ」「両方」から選びます。",
              "集金方法が「機械別」なら機器ごとの金額を、「まとめて」ならその日の合計額を入力して登録します。",
              "グラフのタブを切り替えて、店舗別・月別・支払方法別・月別利益を見比べます（店舗ごとのページでは機器別も出ます）。",
              "「売上履歴」で過去の記録を一覧できます。行を押すと明細が開きます。集金者での絞り込みもできます。",
              "画面右下の「書き出し」から CSV / Excel に出力できます（Pro プラン以上）。",
            ]}
            notes={[
              "「月別利益」は売上から経費を引いた額です。経費を使わない設定の組織では、このタブごと表示されません。",
              "「機器別」は店舗ごとのページにだけ出ます。全店舗で出すと、店舗をまたいで同じ名前の別の機器が合算されてしまうためです。",
              "書き出しでは「経費と月別利益も含める」を選べます。会計ソフトへそのまま取り込むときは、集金だけの表になる既定のままが安全です。",
            ]}
            screenshots={[
              { src: "/screenshots/collect-input.png", alt: "集金入力画面。機種別の金額とキャッシュレスの内訳", w: 1320, h: 2868 },
              { src: "/screenshots/revenue-report.png", alt: "収益レポート。総額収益とグラフのタブ", w: 1320, h: 2868 },
            ]}
          />

          {/* 経費 */}
          <SectionCard
            id="expenses"
            icon={<Icon.LuWallet />}
            title="経費"
            description="家賃・仕入れ・水道光熱費などの支出を記録するページです。ここに登録した金額が、収益ページの「月別利益」（売上 − 経費）に反映されます。その都度の支出と、毎月かかる固定費の 2 種類を扱います。"
            steps={[
              "「＋」を押して、単発の経費か毎月の固定費かを選びます。",
              "金額・日付・カテゴリ（仕入れ・水道光熱費・家賃など 12 種類）を入力します。必要なら店舗も選びます。店舗を選ばなければ組織全体の支出になります。",
              "円グラフの横に出る内訳で、その月に何にいくら使ったかを確認します。",
              "「毎月の固定費」に家賃などを登録しておくと、毎月自動で上の一覧に計上されます。",
            ]}
            notes={[
              "単発の経費は集金担当者も登録できます。自分が登録した当月分だけ、あとから修正できます。削除と固定費の管理は管理者だけです。",
              "経費を使うかどうかは組織ごとに切り替えられます（設定 →「組織」→「経費を記録する」）。やめても登録済みの経費は消えないので、いつでも元に戻せます。",
              "担当店舗が決まっているメンバーには、担当外の店舗の経費は表示されません。店舗を選ばずに登録した組織全体の支出は、全員に表示されます。",
            ]}
            screenshots={[
              { src: "/screenshots/expenses.png", alt: "経費ページ。カテゴリ別のドーナツと内訳", w: 1320, h: 2868 },
            ]}
          />

          {/* 管理 */}
          <SectionCard
            id="manage"
            icon={<Icon.LuPackage />}
            title="管理"
            description="全店舗の「在庫」と「設備」を 1 枚にまとめたページです。上のタブで切り替えます。洗剤・柔軟剤の残りと、機器の故障状況を、集金担当者と管理者がその場で共有できます。"
            steps={[
              "「在庫」タブで、店舗ごとの洗剤・柔軟剤の残りを、その場の数に更新します。",
              "「警告ライン（以下で警告）」を設定すると、その数以下になったときに赤いバッジとホームのアラートが出ます。",
              "「在庫を追加」から、コイン袋・消耗品などオリジナルの在庫項目を登録できます。",
              "「設備」タブで、機器のスイッチを切り替えて「稼働中 / 故障中」を記録します。",
              "故障中にすると「故障内容」を書き込めます。修理が終わったらスイッチを戻してください。",
            ]}
            notes={[
              "タブのラベルに付く数字は要対応の件数です（例：「在庫（2）」は、在庫が警告ライン以下の店舗が 2 つあるという意味）。開かなくても向こう側の状況が分かります。",
              "ホームの「今日の対応状況」から押すと、該当するタブが開いた状態でこのページに来ます。",
              "機器そのものの登録は店舗ページから行います。台数を設定すると自動でここに並びます。",
            ]}
            screenshots={[
              { src: "/screenshots/manage-stock.png", alt: "管理ページの在庫タブ", w: 1320, h: 2868 },
              { src: "/screenshots/manage-equipment.png", alt: "管理ページの設備タブ", w: 1320, h: 2868 },
            ]}
          />

          {/* メンバーと権限 */}
          <SectionCard
            id="members"
            icon={<Icon.LuUsers />}
            title="メンバーと権限"
            description="複数人で使うための設定です。従業員が参加を申請し、店舗管理者が承認すると組織に加わります。メンバーごとに権限と担当店舗を決められます。"
            steps={[
              "参加する人：Collecie のアカウントを作り、設定の「組織に参加する」に管理者のメールアドレスを入力して申請します。承認されるまでは待ちの画面のままです。",
              "承認する人（管理者）：設定 →「組織」の「参加申請」に届きます。「集金担当者として承認」か「閲覧者として承認」を押すと、その権限で組織に加わります。",
              "権限はあとから「メンバー」の一覧で変更できます。",
              "各メンバーの「担当店舗」を開き、その人が扱う店舗にチェックを入れて保存します。",
            ]}
            notes={[
              "権限は 3 種類です。管理者はすべての操作、集金担当者は集金の記録・自分の記録の修正・単発の経費の登録、閲覧者は閲覧のみができます。",
              "担当店舗が未設定のメンバーには何も表示されません。店舗を新しく登録しても自動では割り当てられないので、この画面で選び直してください。管理者は常に全店舗が対象です。",
              "メールでの招待と参加パスワードは廃止しました。メンバーを増やす経路は「申請 → 承認」の 1 本だけです。",
              "Free プランで組織に所属できるのはご本人 1 人までです。メンバーを増やすには Pro プラン以上が必要です。",
            ]}
          />

          {/* 設定 */}
          <SectionCard
            id="settings"
            icon={<Icon.LuSettings />}
            title="設定"
            description="アカウント・組織・集金スケジュール・プランの設定と、お知らせやフィードバックの入口です。スマホでは画面右上の歯車から、PC では上のメニューの「設定」から開きます。"
            steps={[
              "「アカウント」で氏名・ユーザー名を変更します。",
              "「アプリ設定」の集金方法で、機械別に記録するか、まとめて記録するかを選びます。",
              "「集金スケジュール」で毎週◯曜日または毎月◯日を登録します。ホームのカウントダウンに反映されます（管理者のみ）。",
              "「プラン」で Free / Pro / Pro+ / Max の確認とアップグレードができます（管理者のみ）。",
              "「組織」で組織名・メンバー・参加申請と、経費を記録するかどうかを管理します（管理者のみ）。",
              "「その他」から、開発者からのお知らせ・アクションログ・フィードバック・規約類の確認と、サインアウトができます。",
            ]}
            notes={[
              "アクションログには、誰がいつ何をしたかが記録されます。集金の取り違えや在庫の食い違いを追うときに使ってください。",
              "誤って店舗管理者として登録してしまった場合の作り直しは、アカウント作成から 3 日以内だけ設定ページの下部に表示されます。",
            ]}
            screenshots={[
              { src: "/screenshots/settings.png", alt: "設定ページ", w: 1320, h: 2868 },
            ]}
          />

        </VStack>

        {/* フッター */}
        <Box mt={10} pt={6} borderTop="1px solid" borderColor="var(--divider, #F1F5F9)" textAlign="center">
          <Text fontSize="sm" color="var(--text-muted, #64748B)" mb={2}>
            解決しない場合はフィードバックからご報告ください
          </Text>
          <Text fontSize="xs" color="var(--text-faint, #94A3B8)">
            設定 →{" "}
            <Box as="span" color="var(--teal, #0891B2)" fontWeight="semibold">フィードバック</Box>
            {" "}から、バグ報告・機能のご要望を送ることができます。
          </Text>
        </Box>

      </Box>
    </Box>
  );
}
