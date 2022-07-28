import { useRouter } from "next/router";

import YearlyOverview from "../../components/YearlyOverview";

function Page() {
  const router = useRouter();

  if (!router.query.conversationName) return null;

  return <YearlyOverview conversationId={router.query.conversationName} />;
}
export default Page;
