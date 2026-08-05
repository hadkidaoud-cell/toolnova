import { HomePage, type FeaturedTool } from "@/components/home/home-page";
import { getDbFeaturedTools } from "@/lib/db-tools";

export const dynamic = "force-dynamic";

export default async function Page() {
  const featured = await getDbFeaturedTools(4);
  const featuredTools: FeaturedTool[] = featured ?? [];
  return <HomePage featuredTools={featuredTools} />;
}
