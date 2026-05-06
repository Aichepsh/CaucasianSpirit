import { notFound } from "next/navigation";
import { DropPageContent } from "@/components/drop-page-content";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { getDropBySlug } from "@/lib/db/drops";
import { getProducts } from "@/lib/db/products";

type DropArchiveDetailPageProps = {
  params: {
    slug: string;
  };
};

export default async function DropArchiveDetailPage({
  params
}: DropArchiveDetailPageProps) {
  const dropResult = await getDropBySlug(params.slug);
  const drop = dropResult.drops[0];
  const productsResult = await getProducts();

  if (!drop) {
    notFound();
  }

  const products = productsResult.products.filter((product) => product.dropId === drop.id);
  const message =
    dropResult.setupError ??
    dropResult.queryError ??
    productsResult.setupError ??
    productsResult.queryError;

  return (
    <>
      {message ? <SupabaseSetupNotice message={message} /> : null}
      <DropPageContent drop={drop} products={products} />
    </>
  );
}
