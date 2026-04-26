import { getUser } from "../api/supabaseFunctions/supabaseDatabase/user/action";
import { getProfile } from "../api/supabaseFunctions/supabaseDatabase/profiles/action";
import AccountForm from "../feacher/account/components/accountForm/AccountForm";
import OrganizationSettings from "../feacher/account/components/organizationSettings/OrganizationSettings";
import { Box, Card, Heading, Separator } from "@chakra-ui/react";

export default async function Account() {
  const { user } = await getUser();
  const { data: profile } = await getProfile();

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <AccountForm user={user} />

      {profile?.role === "owner" && (
        <Card.Root
          bg="white"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
          mt={6}
        >
          <Heading
            as="h2"
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color="gray.800"
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
