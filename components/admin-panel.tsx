"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  GripVertical,
  ImageIcon,
  Maximize2,
  MoveHorizontal,
  MoveVertical,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X
} from "lucide-react";
import {
  deleteProduct,
  deleteProductMedia,
  fetchDropsClient,
  fetchFooterLinksClient,
  fetchProductsClient,
  fetchSiteSettingsClient,
  insertDrop,
  insertProduct,
  insertProductMedia,
  removeStorageFiles,
  saveFooterLinks,
  saveSiteSettings,
  updateDrop,
  updateProduct,
  updateProductMedia,
  type ProductMutationInput
} from "@/lib/db/admin-client";
import {
  uploadDropHeroImage,
  uploadProductImage
} from "@/lib/storage/upload-product-image";
import {
  fallbackDrop,
  fallbackFooterLinks,
  fallbackSiteSettings
} from "@/data/qoru";
import type { Drop, FooterLink, Product, ProductCategory, ProductStatus, SiteSettings } from "@/types/qoru";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { BRAND_INSTAGRAM_URL } from "@/lib/brand";

type DraftImage =
  | {
      kind: "existing";
      key: string;
      id: string;
      url: string;
      path: string;
      alt: string;
    }
  | {
      kind: "new";
      key: string;
      file: File;
      previewUrl: string;
      alt: string;
    };

type ProductDraft = {
  title: string;
  subtitle: string;
  slug: string;
  category: ProductCategory;
  price: number;
  status: ProductStatus;
  quantity: number;
  description: string;
  material: string;
  composition: string;
  editionLabel: string;
  productionNote: string;
  dropId: null | string;
  season: string;
  instagramUrl: string;
  isFeatured: boolean;
  images: DraftImage[];
  mainImageKey: null | string;
  cardImageKey: null | string;
};

type ProductFieldError = Partial<
  Record<"title" | "price" | "quantity" | "season" | "instagramUrl" | "dropId" | "material" | "composition" | "editionLabel", string>
>;

type DropFieldError = Partial<
  Record<"title" | "dropNumber" | "season" | "totalQuantity" | "heroImageUrl", string>
>;

const emptyDraft: ProductDraft = {
  title: "",
  subtitle: "",
  slug: "",
  category: "hoodies",
  price: 0,
  status: "NEW",
  quantity: 0,
  description: "",
  material: "Плотный хлопок / темная шерсть",
  composition: "Детали зависят от изделия",
  editionLabel: "100 номерных изделий",
  productionNote: "Малые цеха, ручная сборка",
  dropId: null,
  season: "SS·26",
  instagramUrl: BRAND_INSTAGRAM_URL,
  isFeatured: false,
  images: [],
  mainImageKey: null,
  cardImageKey: null
};

function isFooterLinkValueValid(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed);
}

function normalizeFooterLinks(links: FooterLink[]) {
  return links
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((link, index) => ({ ...link, sortOrder: index }));
}

const statusOptions: Array<{ value: ProductStatus; label: string }> = [
  { value: "NEW", label: "Новый" },
  { value: "LIMITED", label: "Лимит" },
  { value: "SOLD OUT", label: "Распродано" },
  { value: "STANDARD", label: "Стандарт" }
];

const categoryOptions: Array<{ value: ProductCategory; label: string }> = [
  { value: "hoodies", label: "Худи" },
  { value: "longsleeves", label: "Лонгсливы" },
  { value: "t-shirts", label: "Футболки" },
  { value: "jackets", label: "Жакеты" }
];

const dropStatusOptions = [
  { value: "draft", label: "Черновик" },
  { value: "scheduled", label: "Запланирован" },
  { value: "live", label: "Опубликован" },
  { value: "archived", label: "Архив" }
] as const;

const cyrillicSlugMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya"
};

function normalizeSlug(value: string) {
  const transliterated = value
    .toLowerCase()
    .replace(/[а-яё]/g, (letter) => cyrillicSlugMap[letter] ?? letter);

  return transliterated
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getDraftSlug(title: string, slug: string) {
  return normalizeSlug(slug || title);
}

function isDraftDrop(drop: Drop) {
  return drop.id.startsWith("draft-");
}

function createDropDraft(source?: Drop): Drop {
  const nextDropNumber = source?.dropNumber
    ? String(Number(source.dropNumber) + 1).padStart(2, "0")
    : "01";
  const season = source?.season || "SS·26";
  return {
    id: `draft-${Date.now()}`,
    title: "НОВЫЙ ДРОП",
    slug: `new-drop-${Date.now()}`,
    dropNumber: nextDropNumber,
    status: "draft",
    description: "Описание нового дропа.",
    releaseDate: new Date().toISOString().slice(0, 10),
    season,
    totalQuantity: source?.totalQuantity ?? 120,
    heroImageUrl: source?.heroImageUrl ?? "/images/hero.svg",
    heroImageFit: source?.heroImageFit ?? "cover",
    heroImagePositionX: source?.heroImagePositionX ?? 50,
    heroImagePositionY: source?.heroImagePositionY ?? 50,
    isActive: false,
    createdAt: new Date().toISOString()
  };
}

function toDraft(product: Product | null): ProductDraft {
  if (!product) return emptyDraft;
  const images: DraftImage[] = product.media.map((item) => ({
    kind: "existing",
    key: `existing-${item.id}`,
    id: item.id,
    url: item.url,
    path: item.path,
    alt: item.alt
  }));
  const mainExisting =
    product.media.find((item) => item.isMain)?.id ?? product.media[0]?.id;
  const cardExisting =
    product.media.find((item) => item.url === product.cardImageUrl)?.id ?? mainExisting;

  return {
    title: product.title,
    subtitle: product.subtitle,
    slug: product.slug,
    category: product.category,
    price: product.price,
    status: product.status,
    quantity: product.quantity,
    description: product.description,
    material: product.material,
    composition: product.composition,
    editionLabel: product.editionLabel,
    productionNote: product.productionNote,
    dropId: product.dropId,
    season: product.season,
    instagramUrl: product.instagramUrl,
    isFeatured: product.isFeatured,
    images,
    mainImageKey: mainExisting ? `existing-${mainExisting}` : null,
    cardImageKey: cardExisting ? `existing-${cardExisting}` : null
  };
}

function toMutationInput(draft: ProductDraft): ProductMutationInput {
  const generatedSlug = getDraftSlug(draft.title, draft.slug);

  return {
    title: draft.title.trim().toUpperCase(),
    subtitle: draft.subtitle.trim(),
    slug: generatedSlug,
    category: draft.category,
    price: Number(draft.price) || 0,
    status: draft.status,
    quantity: Number(draft.quantity) || 0,
    description: draft.description.trim(),
    material: draft.material.trim(),
    composition: draft.composition.trim(),
    editionLabel: draft.editionLabel.trim(),
    productionNote: draft.productionNote.trim(),
    dropId: draft.dropId,
    season: draft.season.trim(),
    instagramUrl: draft.instagramUrl.trim(),
    isFeatured: draft.isFeatured,
    cardImageUrl: ""
  };
}

function resolveDraftImageUrl(image: DraftImage) {
  return image.kind === "existing" ? image.url : image.previewUrl;
}

function validateProductDraft(draft: ProductDraft) {
  const errors: ProductFieldError = {};
  const title = draft.title.trim();

  if (!title) {
    errors.title = "Введите название товара.";
  }

  if (!getDraftSlug(title, draft.slug)) {
    errors.title = "Название должно содержать буквы или цифры для адреса страницы.";
  }

  if (Number(draft.price) <= 0) {
    errors.price = "Укажите цену больше 0.";
  }

  if (Number(draft.quantity) < 0) {
    errors.quantity = "Количество не может быть отрицательным.";
  }

  if (!draft.season.trim()) {
    errors.season = "Укажите сезон.";
  }

  if (!draft.material.trim()) {
    errors.material = "Укажите материал.";
  }

  if (!draft.composition.trim()) {
    errors.composition = "Укажите состав.";
  }

  if (!draft.editionLabel.trim()) {
    errors.editionLabel = "Укажите тираж.";
  }

  if (draft.instagramUrl && !/^https?:\/\//i.test(draft.instagramUrl.trim())) {
    errors.instagramUrl = "Ссылка должна начинаться с https:// или http://.";
  }

  return errors;
}

function validateDrop(drop: Drop) {
  const errors: DropFieldError = {};

  if (!drop.title.trim()) {
    errors.title = "Введите название дропа.";
  }

  if (!drop.dropNumber.trim()) {
    errors.dropNumber = "Введите номер дропа.";
  }

  if (!drop.season.trim()) {
    errors.season = "Введите сезон.";
  }

  if (Number(drop.totalQuantity) < 0) {
    errors.totalQuantity = "Количество не может быть отрицательным.";
  }

  if (drop.heroImageUrl && !drop.heroImageUrl.startsWith("/") && !/^https?:\/\//i.test(drop.heroImageUrl)) {
    errors.heroImageUrl = "Используйте https://... или внутренний путь /images/...";
  }

  return errors;
}

function getDropStatusLabel(status: Drop["status"]) {
  if (status === "draft") return "ЧЕРНОВИК";
  if (status === "scheduled") return "ЗАПЛАНИРОВАН";
  if (status === "live") return "LIVE";
  return "АРХИВ";
}

export function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [footerLinks, setFooterLinksState] = useState<FooterLink[]>([]);
  const [drops, setDrops] = useState<Drop[]>([fallbackDrop]);
  const [focusedDropId, setFocusedDropId] = useState<string>(fallbackDrop.id);
  const [editingDropId, setEditingDropId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(fallbackSiteSettings);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [productErrors, setProductErrors] = useState<ProductFieldError>({});
  const [dropErrors, setDropErrors] = useState<DropFieldError>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [drawerMessage, setDrawerMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropSaving, setIsDropSaving] = useState(false);
  const [dropHeroFile, setDropHeroFile] = useState<File | null>(null);
  const [dropHeroPreviewUrl, setDropHeroPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [footerMoveSourceId, setFooterMoveSourceId] = useState<string | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dropProductPreviewId, setDropProductPreviewId] = useState<string | null>(null);

  const editingProduct = useMemo(() => {
    if (!editingProductId) return null;
    return products.find((product) => product.id === editingProductId) ?? null;
  }, [editingProductId, products]);

  const dropProductPreview = useMemo(() => {
    if (!dropProductPreviewId) return null;
    return products.find((product) => product.id === dropProductPreviewId) ?? null;
  }, [dropProductPreviewId, products]);

  const focusedDrop =
    drops.find((drop) => drop.id === focusedDropId) ??
    drops.find((drop) => drop.id === settings.activeDropId) ??
    drops.find((drop) => drop.isActive) ??
    drops[0] ??
    fallbackDrop;
  const editingDrop = editingDropId
    ? drops.find((drop) => drop.id === editingDropId) ?? null
    : null;
  const siteActiveDrop =
    drops.find((drop) => drop.id === settings.activeDropId) ??
    drops.find((drop) => drop.isActive) ??
    drops[0] ??
    fallbackDrop;
  const dropHeroDisplayUrl = dropHeroPreviewUrl ?? editingDrop?.heroImageUrl ?? focusedDrop.heroImageUrl;

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchProductsClient(),
      fetchFooterLinksClient(),
      fetchDropsClient(),
      fetchSiteSettingsClient()
    ])
      .then((results) => {
        if (!active) return;

        const [productsResult, footerResult, dropsResult, settingsResult] = results;
        let loadedDrops: Drop[] = [];
        let loadedSettings: SiteSettings | null = null;
        if (productsResult.status === "fulfilled") {
          setProducts(productsResult.value);
        } else {
          setStatusMessage(
            `Products fallback: ${productsResult.reason?.message ?? "unknown error"}`
          );
        }

        if (footerResult.status === "fulfilled") {
          setFooterLinksState(footerResult.value);
        } else {
          setFooterLinksState(fallbackFooterLinks);
        }

        if (dropsResult.status === "fulfilled" && dropsResult.value.length > 0) {
          loadedDrops = dropsResult.value;
          setDrops(loadedDrops);
        }

        if (settingsResult.status === "fulfilled" && settingsResult.value) {
          loadedSettings = settingsResult.value;
          setSettings(loadedSettings);
        }

        if (loadedDrops.length > 0) {
          setFocusedDropId(
            loadedSettings?.activeDropId ??
              loadedDrops.find((drop) => drop.isActive)?.id ??
              loadedDrops[0].id
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (dropHeroPreviewUrl) {
        URL.revokeObjectURL(dropHeroPreviewUrl);
      }
    };
  }, [dropHeroPreviewUrl]);

  function updateActiveDrop(patch: Partial<Drop>) {
    if (!editingDrop) return;
    setDrops((current) =>
      current.map((drop) =>
        drop.id === editingDrop.id ? { ...drop, ...patch } : drop
      )
    );
    if (patch.isActive === true && !isDraftDrop(editingDrop)) {
      setSettings((current) => ({ ...current, activeDropId: editingDrop.id }));
    }
    if (patch.isActive === false && settings.activeDropId === editingDrop.id) {
      setSettings((current) => ({ ...current, activeDropId: null }));
    }
    setDropErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => {
        delete next[key as keyof DropFieldError];
      });
      return next;
    });
  }

  function openCreateDrawer() {
    setEditingProductId(null);
    setDraft({
      ...emptyDraft,
      season: siteActiveDrop.season || emptyDraft.season,
      dropId: siteActiveDrop.id,
      instagramUrl: settings.instagramUrl || BRAND_INSTAGRAM_URL
    });
    setDrawerOpen(true);
    setStatusMessage(null);
    setDrawerMessage(null);
    setProductErrors({});
  }

  function openEditDrawer(product: Product) {
    setEditingProductId(product.id);
    setDraft(toDraft(product));
    setDrawerOpen(true);
    setStatusMessage(null);
    setDrawerMessage(null);
    setProductErrors({});
  }

  function closeDrawer() {
    draft.images.forEach((image) => {
      if (image.kind === "new") {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
    setDrawerOpen(false);
    setDraft(emptyDraft);
    setEditingProductId(null);
    setIsSaving(false);
    setDrawerMessage(null);
    setProductErrors({});
  }

  function updateDraft<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setProductErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function refreshProducts() {
    try {
      const rows = await fetchProductsClient();
      setProducts(rows);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не удалось обновить список товаров.";
      setStatusMessage(message);
    }
  }

  function onImageFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextImages = files.map((file, index) => {
      const key = `new-${Date.now()}-${index}`;
      return {
        kind: "new" as const,
        key,
        file,
        previewUrl: URL.createObjectURL(file),
        alt: file.name
      };
    });

    setDraft((current) => {
      const images = [...current.images, ...nextImages];
      const mainImageKey = current.mainImageKey ?? images[0]?.key ?? null;
      const cardImageKey = current.cardImageKey ?? mainImageKey;
      return { ...current, images, mainImageKey, cardImageKey };
    });
    event.currentTarget.value = "";
  }

  function onDropHeroSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (dropHeroPreviewUrl) {
      URL.revokeObjectURL(dropHeroPreviewUrl);
    }

    setDropHeroFile(file);
    setDropHeroPreviewUrl(URL.createObjectURL(file));
    event.currentTarget.value = "";
  }

  function clearDropHeroSelection() {
    if (dropHeroPreviewUrl) {
      URL.revokeObjectURL(dropHeroPreviewUrl);
    }
    setDropHeroFile(null);
    setDropHeroPreviewUrl(null);
  }

  function removeDraftImage(key: string) {
    setDraft((current) => {
      const target = current.images.find((image) => image.key === key);
      if (target?.kind === "new") {
        URL.revokeObjectURL(target.previewUrl);
      }
      const images = current.images.filter((image) => image.key !== key);
      const mainImageKey =
        current.mainImageKey === key ? images[0]?.key ?? null : current.mainImageKey;
      const cardImageKey =
        current.cardImageKey === key ? mainImageKey : current.cardImageKey;
      return { ...current, images, mainImageKey, cardImageKey };
    });
  }

  function moveDraftImage(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.images.length) {
        return current;
      }
      const images = current.images.slice();
      const [picked] = images.splice(index, 1);
      images.splice(targetIndex, 0, picked);
      return { ...current, images };
    });
  }

  function reorderDraftImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setDraft((current) => {
      const images = current.images.slice();
      const [picked] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, picked);
      return { ...current, images };
    });
  }

  function moveFooterLinkById(id: string, direction: -1 | 1) {
    setFooterLinksState((current) => {
      const sorted = normalizeFooterLinks(current);
      const fromIndex = sorted.findIndex((item) => item.id === id);
      const toIndex = fromIndex + direction;
      if (fromIndex < 0 || toIndex < 0 || toIndex >= sorted.length) {
        return sorted;
      }
      const next = sorted.slice();
      const [picked] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, picked);
      return normalizeFooterLinks(next);
    });
  }

  function placeFooterLinkAt(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
      setFooterMoveSourceId(null);
      return;
    }
    setFooterLinksState((current) => {
      const sorted = normalizeFooterLinks(current);
      const fromIndex = sorted.findIndex((item) => item.id === sourceId);
      const targetIndex = sorted.findIndex((item) => item.id === targetId);
      if (fromIndex < 0 || targetIndex < 0) {
        return sorted;
      }
      const next = sorted.slice();
      const [picked] = next.splice(fromIndex, 1);
      const insertIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
      next.splice(insertIndex, 0, picked);
      return normalizeFooterLinks(next);
    });
    setFooterMoveSourceId(null);
  }

  function updateFooterLink(id: string, patch: Partial<FooterLink>) {
    setFooterLinksState((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function updateSettings(patch: Partial<SiteSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  async function handleSaveProduct() {
    setIsSaving(true);
    setStatusMessage(null);
    setDrawerMessage(null);
    setProductErrors({});

    try {
      const nextErrors = validateProductDraft(draft);
      if (Object.keys(nextErrors).length > 0) {
        setProductErrors(nextErrors);
        throw new Error("Проверьте поля товара.");
      }

      const input = toMutationInput(draft);

      const isEdit = Boolean(editingProduct?.id);
      const productId = editingProduct?.id ?? (await insertProduct(input));

      const existingImages = draft.images.filter(
        (image): image is Extract<DraftImage, { kind: "existing" }> =>
          image.kind === "existing"
      );
      const newImages = draft.images.filter(
        (image): image is Extract<DraftImage, { kind: "new" }> => image.kind === "new"
      );
      const keptExistingIds = new Set(existingImages.map((item) => item.id));
      const removedExisting = (editingProduct?.media ?? []).filter(
        (item) => !keptExistingIds.has(item.id)
      );

      if (removedExisting.length > 0) {
        await deleteProductMedia(removedExisting.map((item) => item.id));
        const removablePaths = removedExisting
          .map((item) => item.path)
          .filter((path) => path && !path.startsWith("local/"));
        if (removablePaths.length > 0) {
          await removeStorageFiles(removablePaths);
        }
      }

      const uploadedRows: Array<{
        url: string;
        path: string;
        alt: string;
        key: string;
      }> = [];
      for (const image of newImages) {
        const uploaded = await uploadProductImage(image.file);
        uploadedRows.push({
          url: uploaded.url,
          path: uploaded.path,
          alt: image.alt,
          key: image.key
        });
      }

      const orderedImages = draft.images
        .map((image) => {
          if (image.kind === "existing") {
            return {
              key: image.key,
              id: image.id,
              url: image.url,
              path: image.path,
              alt: image.alt,
              kind: "existing" as const
            };
          }
          const uploaded = uploadedRows.find((item) => item.key === image.key);
          if (!uploaded) return null;
          return {
            key: image.key,
            id: "",
            url: uploaded.url,
            path: uploaded.path,
            alt: image.alt,
            kind: "new" as const
          };
        })
        .filter(Boolean) as Array<{
        key: string;
        id: string;
        url: string;
        path: string;
        alt: string;
        kind: "existing" | "new";
      }>;

      const existingUpdates: Array<{
        id: string;
        alt: string;
        sortOrder: number;
        isMain: boolean;
      }> = [];
      const newRows: Array<{
        url: string;
        path: string;
        alt: string;
        sortOrder: number;
        isMain: boolean;
      }> = [];

      orderedImages.forEach((item, index) => {
        if (item.kind === "existing") {
          existingUpdates.push({
            id: item.id,
            alt: item.alt,
            sortOrder: index,
            isMain: item.key === draft.mainImageKey
          });
          return;
        }
        newRows.push({
          url: item.url,
          path: item.path,
          alt: item.alt,
          sortOrder: index,
          isMain: item.key === draft.mainImageKey
        });
      });

      const resolvedCardImage =
        orderedImages.find((item) => item.key === draft.cardImageKey)?.url ??
        orderedImages.find((item) => item.key === draft.mainImageKey)?.url ??
        orderedImages[0]?.url ??
        "";

      input.cardImageUrl = resolvedCardImage;

      if (isEdit) {
        await updateProduct(productId, input);
      } else if (resolvedCardImage) {
        await updateProduct(productId, input);
      }

      await updateProductMedia(existingUpdates);
      await insertProductMedia(productId, newRows);

      await refreshProducts();
      closeDrawer();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не удалось сохранить товар.";
      setStatusMessage(message);
      setDrawerMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    const approved = window.confirm(
      `Удалить ${product.title}? Это удалит товар и связанные записи media.`
    );
    if (!approved) return;

    try {
      await deleteProduct(product.id);
      const paths = product.media
        .map((image) => image.path)
        .filter((path) => path && !path.startsWith("local/"));
      if (paths.length > 0) {
        await removeStorageFiles(paths);
      }
      await refreshProducts();
      setStatusMessage(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка удаления.";
      setStatusMessage(message);
    }
  }

  async function handleSaveFooter() {
    try {
      const sortedLinks = footerLinks.slice().sort((a, b) => a.sortOrder - b.sortOrder);
      const invalidLink = sortedLinks.find((link) => !isFooterLinkValueValid(link.url));
      if (invalidLink) {
        throw new Error(
          `Проверьте ссылку в футере для "${invalidLink.label}". Используйте https://... или /path.`
        );
      }

      const normalizedLinks = sortedLinks.map((link, index) => ({
        ...link,
        sortOrder: index
      }));

      await saveFooterLinks(
        normalizedLinks.map((link) => ({
          id: link.id,
          label: link.label,
          url: link.url,
          sortOrder: link.sortOrder
        }))
      );
      setFooterLinksState(normalizedLinks);
      setStatusMessage("Футер сохранен.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка сохранения футера.";
      setStatusMessage(message);
    }
  }

  async function handleSaveSettings() {
    setIsSettingsSaving(true);
    setStatusMessage(null);

    try {
      if (!settings.brandName.trim()) {
        throw new Error("Укажите название бренда.");
      }
      if (!settings.instagramUrl.startsWith("http")) {
        throw new Error("Instagram должен быть внешней ссылкой https://...");
      }
      if (!settings.telegramUrl.startsWith("http")) {
        throw new Error("Telegram должен быть внешней ссылкой https://...");
      }

      await saveSiteSettings(settings);
      if (settings.activeDropId) {
        setDrops((current) =>
          current.map((drop) => ({
            ...drop,
            isActive: drop.id === settings.activeDropId
          }))
        );
        setFocusedDropId(settings.activeDropId);
      }
      setStatusMessage("Настройки сайта сохранены.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка сохранения настроек.";
      setStatusMessage(message);
    } finally {
      setIsSettingsSaving(false);
    }
  }

  function handleCreateDropDraft() {
    clearDropHeroSelection();
    const draftDrop = createDropDraft(siteActiveDrop);
    setDrops((current) => [draftDrop, ...current]);
    setFocusedDropId(draftDrop.id);
    setEditingDropId(draftDrop.id);
    setDropErrors({});
    setStatusMessage("Создан черновик дропа. Он появится в базе после сохранения.");
  }

  function handleSelectDrop(dropId: string) {
    clearDropHeroSelection();
    setFocusedDropId(dropId);
    setDropErrors({});
  }

  function handleCancelDropDraft() {
    if (!editingDrop || !isDraftDrop(editingDrop)) return;
    setDrops((current) => current.filter((drop) => drop.id !== editingDrop.id));
    setFocusedDropId(siteActiveDrop.id);
    setEditingDropId(null);
    clearDropHeroSelection();
    setDropErrors({});
    setStatusMessage(null);
  }

  async function handleSaveDrop() {
    setIsDropSaving(true);
    setStatusMessage(null);
    setDropErrors({});

    try {
      if (!editingDrop) {
        throw new Error("Сначала выберите дроп и нажмите «Редактировать».");
      }

      const nextErrors = validateDrop(editingDrop);
      if (Object.keys(nextErrors).length > 0) {
        setDropErrors(nextErrors);
        throw new Error("Проверьте поля дропа.");
      }

      let dropToSave = {
        ...editingDrop,
        slug: normalizeSlug(editingDrop.slug || editingDrop.title)
      };

      if (dropToSave.status !== "live" && dropToSave.isActive) {
        dropToSave = { ...dropToSave, isActive: false };
      }

      if (dropHeroFile) {
        const uploaded = await uploadDropHeroImage(dropHeroFile);
        dropToSave = { ...dropToSave, heroImageUrl: uploaded.url };
      }

      const savedDrop = isDraftDrop(dropToSave)
        ? await insertDrop(dropToSave)
        : dropToSave;

      if (!isDraftDrop(dropToSave)) {
        await updateDrop(dropToSave);
      }

      setDrops((current) => {
        const withoutDraft = current.filter((drop) => drop.id !== editingDrop.id);
        const nextDrops = [savedDrop, ...withoutDraft].map((drop) =>
          savedDrop.isActive ? { ...drop, isActive: drop.id === savedDrop.id } : drop
        );
        return nextDrops;
      });
      setFocusedDropId(savedDrop.id);
      setEditingDropId(savedDrop.id);
      if (dropToSave.isActive) {
        const nextSettings = { ...settings, activeDropId: savedDrop.id };
        setSettings(nextSettings);
        await saveSiteSettings(nextSettings);
      }
      clearDropHeroSelection();
      setStatusMessage("Дроп сохранен.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка сохранения дропа.";
      setStatusMessage(message);
    } finally {
      setIsDropSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-24">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-label text-muted">
          ВНУТРЕННЯЯ ПАНЕЛЬ
        </p>
        <h1 className="mt-3 text-[22vw] font-black uppercase leading-[0.76] tracking-tight sm:text-9xl">
          ADMIN
        </h1>
        <p className="mt-4 border-y border-line py-3 text-[11px] font-bold uppercase tracking-label text-muted">
          {products.length} ИЗДЕЛИЙ · FOOTER · DROPS
        </p>
        {statusMessage ? (
          <p className="mt-4 border border-ink/20 bg-bone px-3 py-2 text-xs leading-5 text-muted">
            {statusMessage}
          </p>
        ) : null}
      </header>

      <section className="mt-8 border border-line p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase leading-none tracking-tight">
            ТОВАРЫ
          </h2>
          <Button onClick={openCreateDrawer} className="h-10 gap-2 px-3">
            <Plus size={15} strokeWidth={1.7} />
            Добавить
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? <AdminSkeletonRows count={3} /> : null}
          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[4rem_1fr_auto] gap-3 border border-line bg-bone p-2"
            >
              <div className="relative aspect-[4/5] bg-field">
                <Image
                  src={product.cardImageUrl || product.mainImageUrl}
                  alt={product.subtitle}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 py-1">
                <p className="truncate text-sm font-black uppercase">{product.title}</p>
                <p className="mt-1 text-[11px] uppercase tracking-tightlabel text-muted">
                  {product.status} · {product.quantity}/{product.quantity}
                </p>
                <p className="mt-1 text-xs font-bold uppercase">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  aria-label="Редактировать"
                  onClick={() => openEditDrawer(product)}
                  className="flex h-8 w-8 items-center justify-center border border-line"
                >
                  <Edit3 size={15} strokeWidth={1.5} />
                </button>
                <button
                  aria-label="Удалить"
                  onClick={() => handleDeleteProduct(product)}
                  className="flex h-8 w-8 items-center justify-center border border-danger text-danger"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
          {!isLoading && products.length === 0 ? (
            <p className="border border-line bg-bone px-3 py-4 text-xs uppercase tracking-label text-muted">
              Товары пока не загружены или их нет в базе.
            </p>
          ) : null}
          {isLoading ? (
            <p className="text-xs uppercase tracking-label text-muted">Загрузка...</p>
          ) : null}
        </div>
      </section>

      <section className="mt-5 border border-line p-4">
        <h2 className="text-3xl font-black uppercase leading-none tracking-tight">
          НАСТРОЙКИ САЙТА
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Название бренда">
            <Input
              value={settings.brandName}
              onChange={(event) => updateSettings({ brandName: event.target.value })}
            />
          </Field>
          <Field label="Подпись в футере">
            <Input
              value={settings.footerMeta}
              onChange={(event) => updateSettings({ footerMeta: event.target.value })}
            />
          </Field>
          <Field label="Instagram">
            <Input
              type="url"
              value={settings.instagramUrl}
              onChange={(event) => updateSettings({ instagramUrl: event.target.value })}
            />
          </Field>
          <Field label="Telegram">
            <Input
              type="url"
              value={settings.telegramUrl}
              onChange={(event) => updateSettings({ telegramUrl: event.target.value })}
            />
          </Field>
          <Field label="Активный дроп" wide>
            <select
              value={
                drops.some((drop) => drop.id === settings.activeDropId && !isDraftDrop(drop))
                  ? settings.activeDropId ?? ""
                  : ""
              }
              onChange={(event) => {
                const nextActiveDropId = event.target.value || null;
                updateSettings({ activeDropId: nextActiveDropId });
                if (nextActiveDropId) {
                  setFocusedDropId(nextActiveDropId);
                }
              }}
              className="h-11 w-full border border-ink/25 bg-bone px-3 text-sm uppercase outline-none focus:border-ink"
            >
              <option value="">не выбран</option>
              {drops
                .filter((drop) => !isDraftDrop(drop) && drop.status === "live")
                .map((drop) => (
                <option key={drop.id} value={drop.id}>
                  {drop.dropNumber} · {drop.title} · {drop.season}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Button
          className="mt-5 w-full"
          onClick={handleSaveSettings}
          disabled={isSettingsSaving}
        >
          {isSettingsSaving ? "Сохранение..." : "Сохранить настройки"}
        </Button>
      </section>

      <section className="mt-5 border border-line p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black uppercase leading-none tracking-tight">
              ИСТОРИЯ ДРОПОВ
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Товары закрепляются за конкретным дропом через поле в товаре. Если
              редактировать старый дроп, меняется только его карточка, но товар не
              переезжает в другой релиз.
            </p>
          </div>
          <Button type="button" onClick={handleCreateDropDraft} className="h-10 gap-2 px-3">
            <Plus size={15} strokeWidth={1.7} />
            Новый дроп
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {drops.map((drop) => {
            const dropProducts = products.filter((product) => product.dropId === drop.id);
            const focused = drop.id === focusedDrop.id;
            const editing = drop.id === editingDropId;
            return (
              <div
                key={drop.id}
                className={`border p-3 ${
                  focused ? "border-ink bg-bone" : "border-line bg-stonepaper"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectDrop(drop.id)}
                    className="min-w-0 text-left"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-label text-muted">
                      DROP {drop.dropNumber} · {drop.season || "без сезона"} · {getDropStatusLabel(drop.status)}
                      {drop.isActive ? " · АКТИВНЫЙ" : ""}
                      {isDraftDrop(drop) ? " · ЧЕРНОВИК" : ""}
                    </p>
                    <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight">
                      {drop.title}
                    </h3>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="border border-line px-2 py-1 text-[10px] font-bold uppercase tracking-label text-muted">
                      {dropProducts.length} товаров
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusedDropId(drop.id);
                        setEditingDropId(drop.id);
                        setDropErrors({});
                      }}
                      className={`h-9 border px-3 text-[10px] font-bold uppercase tracking-label ${
                        editing ? "border-ink bg-ink text-stonepaper" : "border-line"
                      }`}
                    >
                      Редактировать
                    </button>
                  </div>
                </div>
                <div className="mt-3 border-t border-line pt-3">
                  {dropProducts.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dropProducts.map((product) => (
                        <button
                          type="button"
                          key={product.id}
                          onClick={() => setDropProductPreviewId(product.id)}
                          className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-left transition hover:border-ink hover:bg-bone focus-visible:border-ink focus-visible:outline-none"
                        >
                          <span className="truncate text-xs font-black uppercase">
                            {product.title}
                          </span>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-label text-muted">
                            {product.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs uppercase tracking-label text-muted">
                      В этом дропе пока нет товаров.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {editingDrop ? (
      <section className="mt-5 border border-line p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-black uppercase leading-none tracking-tight">
              РЕДАКТИРОВАНИЕ ДРОПА
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Сейчас открыт: DROP {editingDrop.dropNumber} · {editingDrop.title}
              {isDraftDrop(editingDrop) ? " · черновик не сохранен в базе" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingDropId(null);
              setDropErrors({});
              clearDropHeroSelection();
            }}
            className="h-10 border border-line px-3 text-[10px] font-bold uppercase tracking-label"
          >
            Закрыть редактор
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Название дропа" error={dropErrors.title}>
            <Input
              value={editingDrop.title}
              onChange={(event) => updateActiveDrop({ title: event.target.value })}
            />
          </Field>
          <Field label="Номер дропа" error={dropErrors.dropNumber}>
            <Input
              value={editingDrop.dropNumber}
              onChange={(event) => updateActiveDrop({ dropNumber: event.target.value })}
            />
          </Field>
          <Field label="Статус">
            <select
              value={editingDrop.status}
              onChange={(event) =>
                updateActiveDrop({ status: event.target.value as Drop["status"] })
              }
              className="h-11 w-full border border-ink/25 bg-bone px-3 text-sm uppercase outline-none focus:border-ink"
            >
              {dropStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Сезон" error={dropErrors.season}>
            <Input
              value={editingDrop.season}
              placeholder="SS·26"
              onChange={(event) => updateActiveDrop({ season: event.target.value })}
            />
          </Field>
          <Field label="Дата релиза">
            <Input
              type="date"
              value={editingDrop.releaseDate ?? ""}
              onChange={(event) => updateActiveDrop({ releaseDate: event.target.value || null })}
            />
          </Field>
          <Field label="Количество" error={dropErrors.totalQuantity}>
            <Input
              type="number"
              value={editingDrop.totalQuantity}
              onChange={(event) =>
                updateActiveDrop({ totalQuantity: Number(event.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Активный дроп">
            <label className="flex h-11 items-center gap-3 border border-line bg-bone px-3 text-xs font-bold uppercase tracking-label">
              <input
                type="checkbox"
                checked={editingDrop.isActive}
                onChange={(event) => updateActiveDrop({ isActive: event.target.checked })}
              />
              Использовать на сайте
            </label>
          </Field>
          <Field label="Описание" wide>
            <Textarea
              value={editingDrop.description}
              onChange={(event) => updateActiveDrop({ description: event.target.value })}
            />
          </Field>
        </div>

        <div className="mt-6 border border-line bg-bone p-3">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-label text-muted">
                Обложка дропа
              </p>
              <h3 className="mt-1 text-2xl font-black uppercase leading-none">
                Фото первого экрана
              </h3>
            </div>
            <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 border border-ink bg-ink px-3 text-[11px] font-bold uppercase tracking-label text-stonepaper">
              <ImageIcon size={15} strokeWidth={1.7} />
              Загрузить
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onDropHeroSelected}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="relative aspect-[4/5] overflow-hidden border border-line bg-field md:aspect-[16/9]">
              <Image
                src={dropHeroDisplayUrl}
                alt="Drop hero preview"
                fill
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="bg-field"
                style={{
                  objectFit: editingDrop.heroImageFit,
                  objectPosition: `${editingDrop.heroImagePositionX}% ${editingDrop.heroImagePositionY}%`
                }}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/82 px-3 py-2 text-[10px] font-bold uppercase tracking-label text-stonepaper">
                <span>{dropHeroFile ? "Новый файл" : "Текущая обложка"}</span>
                <span>
                  {editingDrop.heroImageFit} · X {editingDrop.heroImagePositionX} · Y {editingDrop.heroImagePositionY}
                </span>
              </div>
            </div>

            <div className="grid content-start gap-4">
              <Field label="URL изображения" error={dropErrors.heroImageUrl}>
                <Input
                  type="url"
                  value={editingDrop.heroImageUrl}
                  placeholder="https://..."
                  onChange={(event) => updateActiveDrop({ heroImageUrl: event.target.value })}
                />
              </Field>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-label text-muted">
                  Режим кадра
                </p>
                <div className="grid grid-cols-2 border border-line">
                  {(["cover", "contain"] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => updateActiveDrop({ heroImageFit: fit })}
                      className={`flex h-11 items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-label ${
                        editingDrop.heroImageFit === fit
                          ? "bg-ink text-stonepaper"
                          : "bg-bone text-ink"
                      }`}
                    >
                      <Maximize2 size={14} strokeWidth={1.7} />
                      {fit === "cover" ? "Заполнить" : "Вместить"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <label>
                  <span className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-label text-muted">
                    <span className="inline-flex items-center gap-2">
                      <MoveHorizontal size={14} strokeWidth={1.7} />
                      Сдвиг по X
                    </span>
                    <span>{editingDrop.heroImagePositionX}%</span>
                  </span>
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={editingDrop.heroImagePositionX}
                    onChange={(event) =>
                      updateActiveDrop({ heroImagePositionX: Number(event.target.value) || 0 })
                    }
                    className="px-0"
                  />
                </label>

                <label>
                  <span className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-label text-muted">
                    <span className="inline-flex items-center gap-2">
                      <MoveVertical size={14} strokeWidth={1.7} />
                      Сдвиг по Y
                    </span>
                    <span>{editingDrop.heroImagePositionY}%</span>
                  </span>
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={editingDrop.heroImagePositionY}
                    onChange={(event) =>
                      updateActiveDrop({ heroImagePositionY: Number(event.target.value) || 0 })
                    }
                    className="px-0"
                  />
                </label>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateActiveDrop({
                      heroImageFit: "cover",
                      heroImagePositionX: 50,
                      heroImagePositionY: 50
                    })
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 border border-line text-[11px] font-bold uppercase tracking-label"
                >
                  <RotateCcw size={14} strokeWidth={1.7} />
                  Сбросить кадр
                </button>
                {dropHeroFile ? (
                  <button
                    type="button"
                    onClick={clearDropHeroSelection}
                    className="h-10 border border-danger text-[11px] font-bold uppercase tracking-label text-danger"
                  >
                    Убрать новый файл
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <DropPreviewCard drop={editingDrop} />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {isDraftDrop(editingDrop) ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDropDraft}
              disabled={isDropSaving}
            >
              Отменить черновик
            </Button>
          ) : null}
          <Button
            className={isDraftDrop(editingDrop) ? "w-full" : "w-full sm:col-span-2"}
            onClick={handleSaveDrop}
            disabled={isDropSaving}
          >
            {isDropSaving
              ? "Сохранение..."
              : isDraftDrop(editingDrop)
                ? "Создать дроп"
                : "Сохранить дроп"}
          </Button>
        </div>
      </section>
      ) : (
      <section className="mt-5 border border-line p-4">
        <h2 className="text-3xl font-black uppercase leading-none tracking-tight">
          РЕДАКТОР ДРОПА
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Выберите дроп в истории, чтобы увидеть его рамкой, и нажмите
          «Редактировать», чтобы открыть панель изменения и предпросмотра.
        </p>
      </section>
      )}

      <section className="mt-5 border border-line p-4">
        <h2 className="text-3xl font-black uppercase leading-none tracking-tight">
          ССЫЛКИ В ФУТЕРЕ
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Стрелки меняют порядок сразу. Для переноса нажмите маркер у нужной
          строки, затем кнопку «Поставить сюда» на новой позиции.
        </p>
        <div className="mt-5 grid gap-4">
          {isLoading ? <AdminSkeletonRows count={2} compact /> : null}
          {normalizeFooterLinks(footerLinks).map((link, index) => {
            const moveSelected = footerMoveSourceId === link.id;
            const hasMoveSource = Boolean(footerMoveSourceId);
            return (
              <div
                key={link.id}
                data-footer-link-id={link.id}
                className={`grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 border p-3 md:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_11rem] ${
                  moveSelected ? "border-ink bg-bone" : "border-line bg-stonepaper"
                }`}
              >
                <button
                  type="button"
                  aria-label="Маркер переноса"
                  title="Выбрать строку для переноса"
                  onClick={() => {
                    setFooterMoveSourceId((current) =>
                      current === link.id ? null : link.id
                    );
                  }}
                  className={`flex h-11 items-center justify-center border ${
                    moveSelected ? "border-ink bg-ink text-stonepaper" : "border-line bg-bone text-muted"
                  }`}
                >
                  <GripVertical size={15} strokeWidth={1.5} />
                </button>
                <Field label="Название">
                  <Input
                    value={link.label}
                    placeholder="Instagram"
                    onChange={(event) =>
                      updateFooterLink(link.id, { label: event.target.value })
                    }
                  />
                </Field>
                <Field label="Ссылка" className="col-span-2 md:col-span-1">
                  <Input
                    value={link.url}
                    type="text"
                    inputMode="url"
                    placeholder="https://... или /about"
                    onChange={(event) =>
                      updateFooterLink(link.id, { url: event.target.value })
                    }
                  />
                </Field>
                <Field label="Позиция" className="col-span-2 md:col-span-1">
                  <div className="grid grid-cols-[1fr_3rem_3rem] border border-ink/25 bg-bone">
                    <div className="flex h-11 items-center justify-center text-[11px] font-bold uppercase tracking-label text-muted">
                      #{String(index + 1).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      aria-label="Поднять ссылку"
                      title="Поднять ссылку"
                      onClick={() => moveFooterLinkById(link.id, -1)}
                      disabled={index === 0}
                      className="flex h-11 items-center justify-center border-l border-line disabled:text-muted/30"
                    >
                      <ChevronUp size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Опустить ссылку"
                      title="Опустить ссылку"
                      onClick={() => moveFooterLinkById(link.id, 1)}
                      disabled={index === footerLinks.length - 1}
                      className="flex h-11 items-center justify-center border-l border-line disabled:text-muted/30"
                    >
                      <ChevronDown size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                  {hasMoveSource && !moveSelected ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (footerMoveSourceId) {
                          placeFooterLinkAt(footerMoveSourceId, link.id);
                        }
                      }}
                      className="mt-2 h-9 w-full border border-ink bg-ink text-[10px] font-bold uppercase tracking-label text-stonepaper"
                    >
                      Поставить сюда
                    </button>
                  ) : null}
                  {moveSelected ? (
                    <button
                      type="button"
                      onClick={() => setFooterMoveSourceId(null)}
                      className="mt-2 h-9 w-full border border-line text-[10px] font-bold uppercase tracking-label"
                    >
                      Отменить перенос
                    </button>
                  ) : null}
                </Field>
              </div>
            );
          })}
        </div>
        <Button className="mt-5 w-full" onClick={handleSaveFooter}>
          Сохранить футер
        </Button>
      </section>

      <AdminProductPreviewModal
        product={dropProductPreview}
        onClose={() => setDropProductPreviewId(null)}
      />

      <div
        className={`fixed inset-0 z-50 transition ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-ink/35 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeDrawer}
        />
        <div
          className={`absolute inset-0 overflow-y-auto bg-stonepaper px-4 pb-10 pt-5 transition-transform duration-300 ${
            drawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-label text-muted">
                {editingProduct ? "РЕДАКТИРОВАНИЕ" : "НОВОЕ ИЗДЕЛИЕ"}
              </p>
              <button
                aria-label="Закрыть форму"
                onClick={closeDrawer}
                className="flex h-10 w-10 items-center justify-center"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <h2 className="mt-4 text-5xl font-black uppercase leading-[0.86] tracking-tight sm:text-7xl">
              {editingProduct ? "РЕДАКТИРОВАТЬ ТОВАР" : "ДОБАВИТЬ ТОВАР"}
            </h2>
            {drawerMessage && Object.keys(productErrors).length === 0 ? (
              <p className="mt-4 border border-danger bg-bone px-3 py-2 text-sm leading-5 text-danger">
                {drawerMessage}
              </p>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Название товара" error={productErrors.title}>
                <Input
                  value={draft.title}
                  onChange={(event) => {
                    const value = event.target.value.toUpperCase();
                    setProductErrors((current) => ({ ...current, title: undefined }));
                    setDraft((current) => ({
                      ...current,
                      title: value,
                      slug: editingProduct ? current.slug || normalizeSlug(value) : normalizeSlug(value)
                    }));
                  }}
                />
              </Field>
              <Field label="Подпись / русское название">
                <Input
                  value={draft.subtitle}
                  onChange={(event) => updateDraft("subtitle", event.target.value)}
                />
              </Field>
              <Field label="Категория">
                <select
                  value={draft.category}
                  onChange={(event) =>
                    updateDraft("category", event.target.value as ProductCategory)
                  }
                  className="h-11 w-full border border-ink/25 bg-bone px-3 text-sm uppercase outline-none focus:border-ink"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Цена" error={productErrors.price}>
                <Input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(event) => updateDraft("price", Number(event.target.value))}
                />
              </Field>
              <Field label="Статус">
                <select
                  value={draft.status}
                  onChange={(event) =>
                    updateDraft("status", event.target.value as ProductStatus)
                  }
                  className="h-11 w-full border border-ink/25 bg-bone px-3 text-sm uppercase outline-none focus:border-ink"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Количество" error={productErrors.quantity}>
                <Input
                  type="number"
                  min={0}
                  value={draft.quantity}
                  onChange={(event) => updateDraft("quantity", Number(event.target.value))}
                />
              </Field>
              <Field label="Сезон" error={productErrors.season}>
                <Input
                  value={draft.season}
                  onChange={(event) => updateDraft("season", event.target.value)}
                />
              </Field>
              <Field label="Ссылка Instagram" error={productErrors.instagramUrl}>
                <Input
                  type="url"
                  value={draft.instagramUrl}
                  onChange={(event) => updateDraft("instagramUrl", event.target.value)}
                />
              </Field>
              <Field label="Дроп">
                <select
                  value={draft.dropId ?? ""}
                  onChange={(event) =>
                    updateDraft("dropId", event.target.value || null)
                  }
                  className="h-11 w-full border border-ink/25 bg-bone px-3 text-sm uppercase outline-none focus:border-ink"
                >
                  <option value="">без дропа</option>
                  {drops.map((dropItem) => (
                    <option key={dropItem.id} value={dropItem.id}>
                      {dropItem.dropNumber} · {dropItem.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Главная">
                <label className="flex h-11 items-center gap-3 border border-line bg-bone px-3 text-xs font-bold uppercase tracking-label">
                  <input
                    type="checkbox"
                    checked={draft.isFeatured}
                    onChange={(event) => updateDraft("isFeatured", event.target.checked)}
                  />
                  Показывать на главной
                </label>
              </Field>
              <Field label="Описание" wide>
                <Textarea
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                />
              </Field>
              <Field label="Материал" error={productErrors.material}>
                <Input
                  value={draft.material}
                  onChange={(event) => updateDraft("material", event.target.value)}
                />
              </Field>
              <Field label="Состав" error={productErrors.composition}>
                <Input
                  value={draft.composition}
                  onChange={(event) => updateDraft("composition", event.target.value)}
                />
              </Field>
              <Field label="Тираж" error={productErrors.editionLabel}>
                <Input
                  value={draft.editionLabel}
                  onChange={(event) => updateDraft("editionLabel", event.target.value)}
                />
              </Field>
              <Field label="Производство">
                <Input
                  value={draft.productionNote}
                  onChange={(event) => updateDraft("productionNote", event.target.value)}
                />
              </Field>
            </div>
            <div className="mt-4 border border-line bg-bone px-3 py-2 text-[11px] font-bold uppercase tracking-tightlabel text-muted">
              Адрес страницы создается автоматически: /products/{getDraftSlug(draft.title, draft.slug)}
            </div>

            <div className="mt-4 border border-line bg-bone p-3">
              <p className="text-[11px] font-bold uppercase tracking-label text-muted">
                Превью карточки
              </p>
              <div className="mt-3 grid grid-cols-[4rem_1fr] gap-3">
                <div className="relative aspect-[4/5] bg-field">
                  {draft.images[0] ? (
                    <Image
                      src={
                        resolveDraftImageUrl(
                          draft.images.find((image) => image.key === draft.cardImageKey) ??
                            draft.images[0]
                        )
                      }
                      alt={draft.title || "preview"}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase">
                    {draft.title || "НАЗВАНИЕ ТОВАРА"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {draft.subtitle || "Русское название"}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase">
                    {formatPrice(Number(draft.price) || 0)}
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-6 border border-line p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase">ФОТОГРАФИИ</h3>
                <label className="inline-flex h-10 cursor-pointer items-center border border-ink bg-ink px-3 text-[11px] font-bold uppercase tracking-label text-stonepaper">
                  ДОБАВИТЬ ФОТО
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onImageFilesSelected}
                  />
                </label>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {draft.images.map((image, index) => {
                  const src = image.kind === "existing" ? image.url : image.previewUrl;
                  return (
                    <div
                      key={image.key}
                      draggable
                      onDragStart={() => setDraggedImageIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedImageIndex !== null) {
                          reorderDraftImage(draggedImageIndex, index);
                        }
                        setDraggedImageIndex(null);
                      }}
                      onDragEnd={() => setDraggedImageIndex(null)}
                      className="border border-line bg-bone p-2"
                    >
                      <div className="relative aspect-[4/5] bg-field">
                        <Image src={src} alt={image.alt || "preview"} fill className="object-cover" />
                        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center border border-line bg-stonepaper/90 text-muted">
                          <GripVertical size={14} strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-label">
                          <input
                            type="radio"
                            name="main-image"
                            checked={draft.mainImageKey === image.key}
                            onChange={() => updateDraft("mainImageKey", image.key)}
                          />
                          Главное
                        </label>
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-label">
                          <input
                            type="radio"
                            name="card-image"
                            checked={draft.cardImageKey === image.key}
                            onChange={() => updateDraft("cardImageKey", image.key)}
                          />
                          Обложка карточки
                        </label>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveDraftImage(index, -1)}
                            className="flex h-7 w-7 items-center justify-center border border-line"
                          >
                            <ChevronUp size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDraftImage(index, 1)}
                            className="flex h-7 w-7 items-center justify-center border border-line"
                          >
                            <ChevronDown size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDraftImage(image.key)}
                            className="flex h-7 w-7 items-center justify-center border border-danger text-danger"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <Input
                        value={image.alt}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            images: current.images.map((item) =>
                              item.key === image.key
                                ? { ...item, alt: event.target.value }
                                : item
                            )
                          }))
                        }
                        className="mt-2 h-9 text-xs"
                        placeholder={`ALT #${index + 1}`}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="sticky bottom-0 mt-6 border-t border-line bg-stonepaper py-3">
              {drawerMessage && Object.keys(productErrors).length === 0 ? (
                <p className="mb-3 border border-danger bg-bone px-3 py-2 text-sm leading-5 text-danger">
                  {drawerMessage}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={closeDrawer}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button
                className="w-full gap-2"
                onClick={handleSaveProduct}
                disabled={isSaving}
              >
                <Save size={15} strokeWidth={1.7} />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  wide,
  error,
  className,
  children
}: {
  label: string;
  wide?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={[wide ? "md:col-span-2" : "", className ?? ""].filter(Boolean).join(" ") || undefined}>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs leading-5 text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}

function AdminProductPreviewModal({
  product,
  onClose
}: {
  product: Product | null;
  onClose: () => void;
}) {
  if (!product) return null;

  const imageUrl = product.cardImageUrl || product.mainImageUrl || "/images/hero.svg";

  return (
    <div className="fixed inset-0 z-[60] bg-ink/45 p-3 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Закрыть карточку товара"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative mx-auto flex max-h-[calc(100vh-1.5rem)] max-w-3xl flex-col overflow-hidden border border-ink bg-stonepaper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-label text-muted">
            Карточка товара
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-line"
            aria-label="Закрыть"
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </div>
        <div className="grid overflow-y-auto md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative aspect-[4/5] border-b border-line bg-field md:border-b-0 md:border-r">
            <Image
              src={imageUrl}
              alt={product.subtitle || product.title}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <span className="absolute bottom-3 right-3 border border-line bg-bone px-2 py-1 text-[10px] font-bold uppercase tracking-label">
              {product.quantity} / {product.quantity}
            </span>
          </div>
          <div className="flex min-h-[24rem] flex-col p-4">
            <div>
              <p className="inline-flex border border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-label">
                {product.status}
              </p>
              <h3 className="mt-4 text-4xl font-black uppercase leading-[0.86] tracking-tight">
                {product.title}
              </h3>
              <p className="mt-3 text-sm uppercase tracking-label text-muted">
                {product.subtitle || product.category}
              </p>
              <p className="mt-6 text-xl font-black uppercase">
                {formatPrice(product.price)}
              </p>
              {product.description ? (
                <p className="mt-5 text-sm leading-6 text-muted">
                  {product.description}
                </p>
              ) : null}
            </div>
            <div className="mt-6 grid gap-0 border-y border-line text-xs uppercase">
              {[
                ["Материал", product.material],
                ["Состав", product.composition],
                ["Тираж", product.editionLabel],
                ["Дроп", product.drop?.title ?? "Без дропа"],
                ["Сезон", product.season]
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_1fr] border-b border-line py-3 last:border-b-0">
                  <span className="font-bold tracking-label text-muted">{label}</span>
                  <span className="font-black">{value || "—"}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 border border-line text-[11px] font-bold uppercase tracking-label"
              >
                Закрыть
              </button>
              <Link
                href={`/products/${product.slug}`}
                className="flex h-11 items-center justify-center border border-ink bg-ink text-[11px] font-bold uppercase tracking-label text-stonepaper"
              >
                Открыть страницу
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DropPreviewCard({ drop }: { drop: Drop }) {
  return (
    <div className="mt-6 border border-line bg-bone p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-label text-muted">
            ПРЕДПРОСМОТР
          </p>
          <h3 className="mt-1 text-2xl font-black uppercase leading-none">
            Как дроп выглядит до публикации
          </h3>
        </div>
        {!isDraftDrop(drop) && (drop.status === "live" || drop.status === "archived") ? (
          <Link
            href={drop.isActive ? "/drop" : `/drops/${drop.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-2 border border-ink bg-ink px-3 text-[11px] font-bold uppercase tracking-label text-stonepaper"
          >
            <Eye size={15} strokeWidth={1.6} />
            Открыть страницу
          </Link>
        ) : null}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative aspect-[4/5] overflow-hidden border border-line bg-field md:aspect-[16/9]">
          <Image
            src={drop.heroImageUrl}
            alt={drop.title}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            style={{
              objectFit: drop.heroImageFit,
              objectPosition: `${drop.heroImagePositionX}% ${drop.heroImagePositionY}%`
            }}
          />
        </div>
        <div className="flex flex-col justify-between border border-line p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-label text-muted">
              DROP {drop.dropNumber} · {drop.season} · {getDropStatusLabel(drop.status)}
            </p>
            <h4 className="mt-3 text-4xl font-black uppercase leading-[0.88] tracking-tight">
              {drop.title}
            </h4>
            <p className="mt-4 text-sm leading-6 text-muted">{drop.description}</p>
          </div>
          <div className="mt-5 border-t border-line pt-3 text-[11px] font-bold uppercase tracking-label text-muted">
            {drop.status === "draft" || drop.status === "scheduled"
              ? "Пока не показывается на публичном сайте"
              : "Публичный дроп доступен в архиве или как активный релиз"}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSkeletonRows({
  count,
  compact = false
}: {
  count: number;
  compact?: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`grid animate-pulse gap-3 border border-line bg-bone p-3 ${
            compact ? "md:grid-cols-[2rem_1fr_1fr_7rem]" : "grid-cols-[4rem_1fr_auto]"
          }`}
        >
          <div className={compact ? "h-11 bg-field" : "aspect-[4/5] bg-field"} />
          <div className="space-y-2 py-1">
            <div className="h-3 w-2/3 bg-field" />
            <div className="h-3 w-1/3 bg-field" />
          </div>
          <div className="space-y-2 py-1">
            <div className="h-3 w-3/4 bg-field" />
            <div className="h-3 w-1/2 bg-field" />
          </div>
          {compact ? <div className="h-11 bg-field" /> : null}
        </div>
      ))}
    </>
  );
}
