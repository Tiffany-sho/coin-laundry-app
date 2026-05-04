import { getUser } from "../api/supabaseFunctions/supabaseDatabase/user/action";

export const dynamic = "force-dynamic";
import { getProfile } from "../api/supabaseFunctions/supabaseDatabase/profiles/action";
import { getMyOrganization } from "../api/supabaseFunctions/supabaseDatabase/organization/action";
import AccountForm from "../feacher/account/components/accountForm/AccountForm";
import OrganizationSettings from "../feacher/account/components/organizationSettings/OrganizationSettings";
import { Box, Card, Heading, Separator } from "@chakra-ui/react";

export default async function Account() {
  const { user } = await getUser();
  const [{ data: profile }, { data: org }] = await Promise.all([
    getProfile(),
    getMyOrganization(),
  ]);

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <AccountForm user={user} />

      {org?.myRole === "owner" && (
        <Card.Root
          bg="white"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
          boxShadow="var(--shadow-sm)"
          border="1px solid"
          borderColor="cyan.100"
          mt={6}
        >
          <Heading
            as="h2"
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color="var(--teal-deeper, #155E75)"
            mb={6}
          >
            組織管理
          </Heading>
          <Separator mb={6} />
          <OrganizationSettings
            currentUserId={user?.id}
            currentUsername={profile?.username || profile?.full_name || "オーナー"}
          />
        </Card.Root>
      )}
    </Box>
  );
}
