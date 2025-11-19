import Progress from "./components/Progress";
import { UploadProfilesProvider } from "./context/UploadProfilesContext";

const WelcomeHome = ({ user }) => {
  return (
    <UploadProfilesProvider>
      <Progress user={user} />
    </UploadProfilesProvider>
  );
};

export default WelcomeHome;
