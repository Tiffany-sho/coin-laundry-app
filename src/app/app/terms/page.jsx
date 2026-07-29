import { Box, VStack, Heading, Text } from "@chakra-ui/react";

export const metadata = {
  title: "利用規約 | Collecie",
  // 検索結果に本家 /terms と 2 つ並ぶのを防ぐ。これはアプリ内表示専用
  robots: { index: false, follow: false },
};

/**
 * iOS アプリの WebView 用の利用規約。
 *
 * ⚠️ /terms（Web 版）との違いは「第5条 料金・支払い」「第6条 解約・返金」が無いこと。
 *    価格・決済手段・解約導線への**言及**は App Store Guideline 3.1.3(a) のリジェクト事由。
 *    リンクが無くても価格表が載っているだけで指摘されるので、条文ごと落としてある。
 *    Web 版に料金の条項を足すときは、こちらに写さないこと。
 *
 * ⚠️ ナビ・フッターは appLegalPaths.js に載せて非表示にしている。
 *    ここから Web アプリ本体へ辿れるとプラン画面に到達できてしまう。
 */

const Section = ({ number, title, children }) => (
  <Box>
    <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={2}>
      第{number}条 {title}
    </Heading>
    {children}
  </Box>
);

const P = ({ children }) => (
  <Text fontSize="sm" color="var(--text-muted)" mb={2}>
    {children}
  </Text>
);

const Li = ({ children }) => (
  <Text fontSize="sm" color="var(--text-muted)">
    ・{children}
  </Text>
);

export default function AppTermsPage() {
  return (
    <Box maxW="800px" mx="auto" p={{ base: 4, md: 8 }} pb={16}>
      <VStack align="stretch" gap={8}>
        <Box>
          <Heading
            as="h1"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="var(--teal-deeper)"
            mb={2}
          >
            利用規約
          </Heading>
          <Text fontSize="sm" color="var(--text-muted)">
            本利用規約（以下「本規約」）は、上田 将生（以下「当方」）が提供するCollecie（以下「本サービス」）の利用条件を定めるものです。本サービスを利用された場合、本規約に同意したものとみなします。
          </Text>
        </Box>

        <Box
          bg="var(--card-bg, #FFFFFF)"
          borderRadius="xl"
          boxShadow="var(--shadow-sm)"
          border="1px solid"
          borderColor="cyan.100"
          p={{ base: 5, md: 8 }}
        >
          <VStack align="stretch" gap={7}>
            <Section number="1" title="サービスの概要">
              <P>
                本サービスは、コインランドリーの集金業務・店舗管理・データ可視化を支援するアプリケーションです。
              </P>
              <P>本アプリ内での商品・サービスの販売は行っていません。</P>
            </Section>

            <Section number="2" title="利用資格">
              <P>本サービスは、以下の条件を満たす方が利用できます。</P>
              <VStack align="stretch" gap={1}>
                <Li>18歳以上の方（未成年の方は保護者の同意が必要です）</Li>
                <Li>本規約に同意された方</Li>
                <Li>過去に本サービスの利用を停止・禁止されていない方</Li>
              </VStack>
            </Section>

            <Section number="3" title="アカウント管理">
              <P>
                ユーザーは自己の責任においてアカウントを管理するものとします。アカウント情報の不正使用による損害について、当方は一切の責任を負いません。
              </P>
              <P>アカウントの譲渡・売買・貸与は禁止します。</P>
              <P>
                アカウントの削除は、アプリの「設定」画面からいつでも行えます。削除すると元に戻せません。
              </P>
            </Section>

            <Section number="4" title="禁止事項">
              <P>ユーザーは以下の行為を行ってはなりません。</P>
              <VStack align="stretch" gap={1}>
                <Li>本サービスの全部または一部を第三者に販売・転売・再配布すること</Li>
                <Li>
                  本サービスのソースコード・アルゴリズムをリバースエンジニアリング・逆コンパイル・逆アセンブルすること
                </Li>
                <Li>本サービスを通じて違法なコンテンツを送信・保存・共有すること</Li>
                <Li>他のユーザーまたは第三者の権利を侵害する行為</Li>
                <Li>当方または第三者になりすます行為</Li>
                <Li>本サービスのサーバーまたはネットワークに過度な負荷をかける行為</Li>
                <Li>スパム・フィッシング・マルウェアの配布など不正行為</Li>
                <Li>公序良俗に反する行為</Li>
                <Li>その他、当方が不適切と判断する行為</Li>
              </VStack>
            </Section>

            <Section number="5" title="知的財産権">
              <P>
                本サービスに関する著作権・商標権・その他の知的財産権は当方に帰属します。ユーザーは本規約で明示的に許可された範囲でのみ本サービスを利用できます。
              </P>
              <P>ユーザーが本サービスに入力したデータの権利はユーザーに帰属します。</P>
            </Section>

            <Section number="6" title="サービスの変更・停止">
              <P>
                当方は、事前の通知なく本サービスの内容を変更・停止・終了することがあります。これによりユーザーに生じた損害について、当方は一切の責任を負いません。
              </P>
            </Section>

            <Section number="7" title="免責事項">
              <P>
                当方は、本サービスの完全性・正確性・有用性を保証しません。本サービスの利用により生じた直接的・間接的損害について、当方の故意または重過失による場合を除き、一切の責任を負いません。
              </P>
              <P>通信障害・システム障害・天災等の不可抗力による損害についても同様とします。</P>
            </Section>

            <Section number="8" title="プライバシー">
              <P>
                当方による個人情報の取り扱いについては、プライバシーポリシーに定めるとおりとします。
              </P>
            </Section>

            <Section number="9" title="規約の変更">
              <P>
                当方は、必要に応じて本規約を変更できるものとします。重要な変更がある場合は、登録メールアドレスまたはサービス内の通知にてお知らせします。変更後も本サービスを継続して利用された場合、変更後の規約に同意したものとみなします。
              </P>
            </Section>

            <Section number="10" title="準拠法・管轄裁判所">
              <P>
                本規約は日本法に準拠します。本サービスに関して生じた紛争については、大津地方裁判所を第一審の専属的合意管轄裁判所とします。
              </P>
            </Section>

            <Section number="11" title="お問い合わせ">
              <Box p={3} bg="var(--app-bg, #F0F9FF)" borderRadius="lg">
                <Text fontSize="sm" color="var(--text-main)">
                  上田 将生
                </Text>
                <Text fontSize="sm" color="var(--text-muted)">
                  メール：mituya1884tansan@gmail.com
                </Text>
                <Text fontSize="sm" color="var(--text-muted)">
                  電話：090-1277-1729
                </Text>
              </Box>
            </Section>
          </VStack>
        </Box>

        <Text fontSize="xs" color="var(--text-faint)" textAlign="right">
          制定日：2026年5月29日
        </Text>
      </VStack>
    </Box>
  );
}
