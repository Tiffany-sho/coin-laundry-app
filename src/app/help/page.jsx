import { Box, Flex, HStack, Image, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

export const metadata = {
  title: "ヘルプ・使い方ガイド",
  description: "Collecie の使い方ガイド。各ページの説明と操作手順をまとめています。",
};

const SECTIONS = [
  { id: "home",      label: "ホーム",       icon: "IoHomeOutline" },
  { id: "store",     label: "店舗管理",     icon: "LiaStoreSolid" },
  { id: "collect",   label: "集金記録",     icon: "BiCoinStack" },
  { id: "inventory", label: "在庫管理",     icon: "LuPackage" },
  { id: "equipment", label: "設備管理",     icon: "LuWrench" },
  { id: "settings",  label: "設定",         icon: "LuSettings" },
];

const Step = ({ num, children }) => (
  <HStack align="start" gap={3}>
    <Flex
      w="22px" h="22px" borderRadius="full" flexShrink={0}
      bg="var(--teal)" color="white" fontSize="11px" fontWeight="bold"
      align="center" justify="center" mt="2px"
    >
      {num}
    </Flex>
    <Text fontSize="sm" color="var(--text-main)" lineHeight="1.7">{children}</Text>
  </HStack>
);

const SectionCard = ({ id, icon, title, description, steps, screenshot, screenshotAlt, note }) => (
  <Box
    id={id}
    bg="var(--card-bg)"
    borderRadius="18px"
    border="1px solid"
    borderColor="cyan.100"
    boxShadow="var(--shadow-sm)"
    overflow="hidden"
    scrollMarginTop="80px"
  >
    <HStack
      px={5} py={4}
      borderBottom="1px solid"
      borderColor="var(--divider)"
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
          <Text fontSize="sm" color="var(--text-muted)" lineHeight="1.8">
            {description}
          </Text>
          {steps.length > 0 && (
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="var(--teal)" textTransform="uppercase" letterSpacing="wider" mb={3}>
                使い方
              </Text>
              <VStack align="stretch" gap={2.5}>
                {steps.map((step, i) => (
                  <Step key={i} num={i + 1}>{step}</Step>
                ))}
              </VStack>
            </Box>
          )}
          {note && (
            <HStack
              p={3} bg="cyan.50" borderRadius="lg"
              border="1px solid" borderColor="cyan.200"
              align="start" gap={2}
            >
              <Box color="var(--teal)" flexShrink={0} mt="2px">
                <Icon.LuInfo size={14} />
              </Box>
              <Text fontSize="xs" color="var(--teal-deeper)" lineHeight="1.7">{note}</Text>
            </HStack>
          )}
        </VStack>

        {screenshot ? (
          <Box
            flexShrink={0}
            w={{ base: "full", md: "280px" }}
            borderRadius="xl"
            overflow="hidden"
            border="1px solid"
            borderColor="cyan.100"
            boxShadow="var(--shadow-sm)"
          >
            <Image src={screenshot} alt={screenshotAlt} w="full" objectFit="cover" />
          </Box>
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
    <Box bg="var(--app-bg)" minH="100vh" pb={{ base: "120px", md: "48px" }}>
      <Box maxW="800px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>

        {/* ヘッダー */}
        <VStack align="start" gap={2} mb={8}>
          <HStack gap={2}>
            <Box color="var(--teal)"><Icon.LuInfo size={20} /></Box>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
              ヘルプ・使い方ガイド
            </Text>
          </HStack>
          <Text fontSize="sm" color="var(--text-muted)">
            Collecie の各ページの説明と操作手順をまとめています。
          </Text>
        </VStack>

        {/* 目次 */}
        <Box
          bg="var(--card-bg)"
          borderRadius="16px"
          border="1px solid"
          borderColor="cyan.100"
          boxShadow="var(--shadow-sm)"
          p={5}
          mb={6}
        >
          <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper)" mb={3}>
            目次
          </Text>
          <Flex wrap="wrap" gap={2}>
            {SECTIONS.map((s) => (
              <Link key={s.id} href={`#${s.id}`}>
                <Box
                  px={3} py={1.5}
                  bg="cyan.50"
                  color="var(--teal)"
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="semibold"
                  border="1px solid"
                  borderColor="cyan.200"
                  transition="all 0.15s"
                  _hover={{ bg: "var(--teal)", color: "white", borderColor: "var(--teal)" }}
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
            description="ログイン後に表示されるダッシュボードです。次の集金日までのカウントダウン、過去1ヶ月の集金記録、在庫・設備のアラートなどを一画面で確認できます。"
            steps={[
              "「集金カウントダウン」で次の集金日と残り日数を確認します。",
              "「直近の集金記録」で過去1ヶ月の集金履歴を確認します。",
              "「在庫アラート」に赤いバッジが表示されている場合は在庫が少ない店舗があります。在庫管理ページで補充してください。",
              "「クイックアクション」から集金入力など頻繁に使う操作にすばやく移動できます。",
            ]}
            note="集金カウントダウンは設定ページで集金スケジュール（毎週○曜日 / 毎月○日）を設定すると表示されます。"
            screenshot={null}
            screenshotAlt="ホーム画面"
          />

          {/* 店舗管理 */}
          <SectionCard
            id="store"
            icon={<Icon.LiaStoreSolid />}
            title="店舗管理"
            description="コインランドリー店舗の登録・編集・閲覧を行うページです。店舗名・所在地・設置機器・写真を管理できます。登録した店舗が集金・在庫・設備管理のベースになります。"
            steps={[
              "「＋ 店舗を追加」ボタンから新規店舗を登録します。",
              "店舗名・場所・概要を入力し、設置されている機器（洗濯乾燥機・乾燥機など）の台数を設定します。",
              "店舗の写真を最大5枚アップロードできます（JPEG/PNG）。",
              "登録済みの店舗カードをタップすると詳細ページに移動し、その店舗の集金履歴や在庫状況を確認できます。",
              "詳細ページ右上の編集ボタンから店舗情報を変更できます。",
            ]}
            note="Freeプランでは3店舗まで、Proプランでは10店舗まで、Maxプランでは無制限に登録できます。"
            screenshot={null}
            screenshotAlt="店舗一覧"
          />

          {/* 集金記録 */}
          <SectionCard
            id="collect"
            icon={<Icon.BiCoinStack />}
            title="集金記録"
            description="各店舗の集金データを記録し、売上グラフや月次サマリーで収益を分析するページです。機器別集金と総額集金の2つの方法に対応しています。"
            steps={[
              "集金一覧ページから対象の店舗を選び「集金を記録」ボタンを押します。",
              "集金方法が「機器別」の場合：各機器の収益を個別に入力します。",
              "集金方法が「総額」の場合：その日の合計金額を1つ入力します。",
              "入力後「登録」を押すと記録が保存され、グラフに反映されます。",
              "「店舗別売上グラフ」「月次サマリー」で収益の推移を確認できます。",
              "「エクスポート」ボタン（Proプラン以上）でCSV/Excelに出力できます。",
            ]}
            note="集金方法（機器別 / 総額）は設定ページのアカウント設定、または初回セットアップ時に選択します。後から変更も可能です。"
            screenshot="/screenshots/collect-input.jpeg"
            screenshotAlt="集金入力画面"
          />

          {/* 在庫管理 */}
          <SectionCard
            id="inventory"
            icon={<Icon.LuPackage />}
            title="在庫管理"
            description="全店舗の洗剤・柔軟剤の在庫数を一画面で管理するページです。カスタム在庫（例：コイン袋・消耗品）の追加や、警告ライン（少なくなったら通知する閾値）の設定もできます。"
            steps={[
              "各店舗のカードに表示されている在庫数をタップして現在の数に更新します。",
              "在庫数が警告ライン以下になるとバッジが赤くなり、ホーム画面にもアラートが表示されます。",
              "「警告ライン設定」から洗剤・柔軟剤それぞれの閾値を変更できます。",
              "「カスタム在庫を追加」からオリジナルの在庫項目（例：紙袋、コイン）を登録できます。",
            ]}
            note="在庫数の更新は集金スタッフも行えます。補充のタイミングを管理者がホームから確認できます。"
            screenshot="/screenshots/inventory.jpeg"
            screenshotAlt="在庫管理画面"
          />

          {/* 設備管理 */}
          <SectionCard
            id="equipment"
            icon={<Icon.LuWrench />}
            title="設備管理"
            description="全店舗の機器（洗濯乾燥機・乾燥機など）の稼働状態を管理するページです。故障中・点検中の機器を記録しておくことで、集金スタッフと管理者がリアルタイムに状況を共有できます。"
            steps={[
              "各店舗のカードに設置機器の一覧が表示されます。",
              "機器の状態トグルを切り替えて「正常」「故障中」を記録します。",
              "故障中の機器がある店舗はアイコンが赤く表示されます。",
              "修理完了後はトグルを「正常」に戻してください。",
            ]}
            note="機器の登録は店舗管理ページから行います。台数を設定すると自動的に設備管理に表示されます。"
            screenshot="/screenshots/equipment.jpeg"
            screenshotAlt="設備管理画面"
          />

          {/* 設定 */}
          <SectionCard
            id="settings"
            icon={<Icon.LuSettings />}
            title="設定"
            description="アカウント情報・組織・集金スケジュール・プランを管理するページです。組織に複数メンバーを招待して役割（管理者・集金担当・閲覧者）を割り当てられます。"
            steps={[
              "「アカウント」タブ：氏名・ユーザー名・集金方法を変更できます。",
              "「組織」タブ：組織名の変更、メンバーの招待（メールアドレスで送付）、役割の変更・削除ができます。",
              "「集金スケジュール」タブ：毎週○曜日または毎月○日を選択してスケジュールを設定します。ホームのカウントダウンに反映されます。",
              "「プラン」タブ：Free / Pro / Max の確認とアップグレードができます。",
            ]}
            note="招待されたメンバーはメール内のリンクからアカウントを作成し、組織に参加できます。役割は「管理者」「集金担当者」「閲覧者」の3種類です。"
            screenshot={null}
            screenshotAlt="設定画面"
          />

        </VStack>

        {/* フッター */}
        <Box mt={10} pt={6} borderTop="1px solid" borderColor="var(--divider)" textAlign="center">
          <Text fontSize="sm" color="var(--text-muted)" mb={2}>
            解決しない場合はフィードバックボタンからご報告ください
          </Text>
          <Text fontSize="xs" color="var(--text-faint)">
            画面右下の{" "}
            <Box as="span" color="var(--teal)" fontWeight="semibold">チャットアイコン</Box>
            {" "}からバグ報告・機能リクエストを送ることができます。
          </Text>
        </Box>

      </Box>
    </Box>
  );
}
