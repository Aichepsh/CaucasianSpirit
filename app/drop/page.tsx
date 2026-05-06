import { fallbackDrop } from "@/data/qoru";
import { DropPageContent } from "@/components/drop-page-content";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { getCurrentDrop } from "@/lib/db/drops";
import { getProducts } from "@/lib/db/products";

export default async function DropPage() {
  const dropResult = await getCurrentDrop();
  const drop = dropResult.drops[0] ?? fallbackDrop;
  const productsResult = await getProducts();
  const relatedProducts = productsResult.products.filter(
    (product) => product.dropId === drop.id
  );
  const products =
    relatedProducts.length > 0 ? relatedProducts : productsResult.products;
  const pageMessage =
    dropResult.setupError ??
    dropResult.queryError ??
    productsResult.setupError ??
    productsResult.queryError;

  return (
    <>
      {pageMessage ? <SupabaseSetupNotice message={pageMessage} /> : null}
      <DropPageContent drop={drop} products={products} />
    </>
  );
}
