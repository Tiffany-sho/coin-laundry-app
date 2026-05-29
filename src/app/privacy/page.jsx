import { Box, VStack, Heading, Text } from "@chakra-ui/react";

export const metadata = {
  title: "プライバシーポリシー | Collecie",
};

const Section = ({ title, children }) => (
  <Box>
    <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={2}>
      {title}
    </Heading>
    {children}
  </Box>
);

export default function PrivacyPage() {
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
            プライバシーポリシー
          </Heading>
          <Text fontSize="sm" color="var(--text-muted)">
            上田 将生（以下「当方」）は、Collecie（以下「本サービス」）において取得するお客様の個人情報について、以下のとおり取り扱います。
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
          <VStack align="stretch" gap={6}>
            <Section title="1. 取得する情報">
              <VStack align="stretch" gap={1}>
                {[
                  "メールアドレス（アカウント登録時）",
                  "ユーザー名・プロフィール情報（任意入力）",
                  "組織名・メンバー情報",
                  "店舗情報・集金データ（サービス利用中に入力された情報）",
                  "決済情報（クレジットカード情報はStripe社が管理し、当方は保持しません）",
                  "アクセスログ・利用状況（サービス改善目的）",
                ].map((item) => (
                  <Text key={item} fontSize="sm" color="var(--text-muted)">
                    ・{item}
                  </Text>
                ))}
              </VStack>
            </Section>

            <Section title="2. 利用目的">
              <VStack align="stretch" gap={1}>
                {[
                  "本サービスの提供・運営・改善",
                  "ユーザーへのサポート対応",
                  "サブスクリプションの課金・管理",
                  "サービスに関する重要なお知らせの送信",
                  "不正利用の防止",
                ].map((item) => (
                  <Text key={item} fontSize="sm" color="var(--text-muted)">
                    ・{item}
                  </Text>
                ))}
              </VStack>
            </Section>

            <Section title="3. 第三者への提供">
              <Text fontSize="sm" color="var(--text-muted)" mb={3}>
                当方は、以下の場合を除き、お客様の個人情報を第三者に提供しません。
              </Text>
              <VStack align="stretch" gap={1}>
                {[
                  "お客様の同意がある場合",
                  "法令に基づく場合",
                  "サービス運営に必要な委託先（下記）への提供",
                ].map((item) => (
                  <Text key={item} fontSize="sm" color="var(--text-muted)">
                    ・{item}
                  </Text>
                ))}
              </VStack>
            </Section>

            <Section title="4. 利用する外部サービス">
              <VStack align="stretch" gap={2}>
                {[
                  {
                    name: "Supabase（Supabase Inc.）",
                    desc: "データベース・認証サービス。ユーザー情報・店舗・集金データの保存に使用します。",
                  },
                  {
                    name: "Stripe（Stripe, Inc.）",
                    desc: "決済処理サービス。クレジットカード情報はStripeが管理し、当方のサーバーには保存されません。",
                  },
                  {
                    name: "Vercel（Vercel Inc.）",
                    desc: "ホスティングサービス。アクセスログが収集される場合があります。",
                  },
                ].map(({ name, desc }) => (
                  <Box key={name}>
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
                      {name}
                    </Text>
                    <Text fontSize="sm" color="var(--text-muted)">
                      {desc}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Section>

            <Section title="5. 個人情報の管理">
              <Text fontSize="sm" color="var(--text-muted)">
                当方は、お客様の個人情報を正確かつ最新の状態に保ち、不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、適切なセキュリティ対策を実施します。
              </Text>
            </Section>

            <Section title="6. 開示・訂正・削除">
              <Text fontSize="sm" color="var(--text-muted)">
                お客様は、ご自身の個人情報の開示・訂正・削除を求める権利があります。ご希望の場合は、下記お問い合わせ先までご連絡ください。
              </Text>
            </Section>

            <Section title="7. Cookie・アクセス解析">
              <Text fontSize="sm" color="var(--text-muted)">
                本サービスでは、ログイン状態の維持のためCookieを使用します。ブラウザの設定によりCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
              </Text>
            </Section>

            <Section title="8. プライバシーポリシーの変更">
              <Text fontSize="sm" color="var(--text-muted)">
                本ポリシーは予告なく変更する場合があります。変更後はこのページに掲載します。重要な変更がある場合は、登録メールアドレスにてご連絡します。
              </Text>
            </Section>

            <Section title="9. お問い合わせ">
              <Text fontSize="sm" color="var(--text-muted)">
                個人情報の取り扱いに関するご質問・ご意見は、下記までご連絡ください。
              </Text>
              <Box mt={2} p={3} bg="var(--app-bg, #F0F9FF)" borderRadius="lg">
                <Text fontSize="sm" color="var(--text-main)">上田 将生</Text>
                <Text fontSize="sm" color="var(--text-muted)">メール：mituya1884tansan@gmail.com</Text>
                <Text fontSize="sm" color="var(--text-muted)">電話：090-1277-1729</Text>
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
