import { useParams, useNavigate } from "react-router-dom";
import { OrganizationDetail } from "./OrganizationDetail";

const OrganizationDetailPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();

  if (!organizationId) {
    navigate("/volunteer");
    return null;
  }

  return (
    <OrganizationDetail
      organizationId={organizationId}
      onBack={() => navigate("/volunteer")}
    />
  );
};

export default OrganizationDetailPage;
