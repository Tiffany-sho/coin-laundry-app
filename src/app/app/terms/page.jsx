import { Box, VStack, Heading, Text } from "@chakra-ui/react";

export const metadata = {
  title: "利用規約 | Collecie",
  // 検索結果に本家 /terms と 2 つ並ぶのを防ぐ。これはアプリ内表示専用
  robots: { index: false, follow: false },
};

/**
 * iOS アプリ向けの利用規約。
 *
 * ⚠️ **この本文は iOS アプリ側にも複製がある。**（2026-07-30〜）
 *      coinlaundy_app_iOS/src/content/legal/terms.ts
 *    アプリは WebView をやめてこのテキストを自前で描いている（表示が遅かったため）。
 *    **ここを直したら必ずあちらも直すこと。** 片方だけだとアプリが古い規約を出し続ける。
 *    なおアプリからこのページを開く導線はもう無いが、Web としては生かしてある。
 *
 * ⚠️ 第5条・第6条は**アプリ内課金（StoreKit）向けに書いてある。** /terms（Web 版）の
 *    同じ番号の条文は Stripe 向けなので、**互いに写さないこと。** 条番号は Web 版と
 *    揃えてある（第5条＝料金、第6条＝解約）。
 *
 *    2026-07-29 まではこの 2 条を条文ごと落としてあった。「アプリでは何も売らない」
 *    方針だったため。IAP を入れた時点で**その前提が消えている**ので復活させた。
 *    Guideline 3.1.3(a) が禁じるのは**外部（Web・Stripe）での購入への誘導**であって、
 *    アプリ内課金そのものの条件を書くことではない。むしろ 3.1.2 は購読条件の開示を求める。
 *
 * ⚠️ **価格を数字で書かないこと。** 表示してよいのは StoreKit が返す displayPrice だけ
 *    （地域・為替・価格改定でずれると Guideline 3.1.2 に触れる）。この条文が
 *    「App Store の購入画面に表示される金額」という書き方をしているのはそのため。
 *    Web 版にある ¥780 / ¥2,980 をここへ持ち込まない。
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
              <P>
                本サービスには無料プランと有料プラン（Pro・Max）があります。本アプリ内での有料プランのお申し込みは、App
                Storeを通じた自動更新サブスクリプションとして提供します。
              </P>
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

            <Section number="5" title="料金・支払い">
              <P>
                有料プランの料金は、App Storeの購入画面に表示される金額（税込）とします。
              </P>
              <P>
                お支払いは、お客様のApple IDに登録されたお支払い方法への請求となります。当方はお客様のクレジットカード情報を取得・保持しません。
              </P>
              <P>
                購読期間は1か月間です。購読は、現在の期間の終了24時間以上前に自動更新を停止しない限り自動的に更新され、更新料金は各期間の終了前24時間以内に請求されます。
              </P>
            </Section>

            <Section number="6" title="解約・返金">
              <P>
                自動更新の停止（解約）は、iPhoneの「設定」＞「Apple
                ID」＞「サブスクリプション」からいつでも行えます。解約された場合も、購入済みの期間の終了日までは有料プランをご利用いただけます。
              </P>
              <P>
                購読期間の途中で解約された場合であっても、当該期間の料金の日割りによる返金は行いません。
              </P>
              <P>
                返金の可否および手続きは、Apple社の定める規定によります。当方はお客様への返金を個別に行うことができません。
              </P>
            </Section>

            <Section number="7" title="知的財産権">
              <P>
                本サービスに関する著作権・商標権・その他の知的財産権は当方に帰属します。ユーザーは本規約で明示的に許可された範囲でのみ本サービスを利用できます。
              </P>
              <P>ユーザーが本サービスに入力したデータの権利はユーザーに帰属します。</P>
            </Section>

            <Section number="8" title="サービスの変更・停止">
              <P>
                当方は、事前の通知なく本サービスの内容を変更・停止・終了することがあります。これによりユーザーに生じた損害について、当方は一切の責任を負いません。
              </P>
            </Section>

            <Section number="9" title="免責事項">
              <P>
                当方は、本サービスの完全性・正確性・有用性を保証しません。本サービスの利用により生じた直接的・間接的損害について、当方の故意または重過失による場合を除き、一切の責任を負いません。
              </P>
              <P>通信障害・システム障害・天災等の不可抗力による損害についても同様とします。</P>
            </Section>

            <Section number="10" title="プライバシー">
              <P>
                当方による個人情報の取り扱いについては、プライバシーポリシーに定めるとおりとします。
              </P>
            </Section>

            <Section number="11" title="規約の変更">
              <P>
                当方は、必要に応じて本規約を変更できるものとします。重要な変更がある場合は、登録メールアドレスまたはサービス内の通知にてお知らせします。変更後も本サービスを継続して利用された場合、変更後の規約に同意したものとみなします。
              </P>
            </Section>

            <Section number="12" title="準拠法・管轄裁判所">
              <P>
                本規約は日本法に準拠します。本サービスに関して生じた紛争については、大津地方裁判所を第一審の専属的合意管轄裁判所とします。
              </P>
            </Section>

            <Section number="13" title="お問い合わせ">
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
          制定日：2026年5月29日／改定日：2026年7月31日
        </Text>
      </VStack>
    </Box>
  );
}
