import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  Product,
  ProductInput,
} from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";

const formatPrice = (p: number) =>
  p.toLocaleString("uz-UZ").replace(/,/g, " ") + " so'm";

const emptyForm: ProductInput = {
  name_uz: "",
  name_en: "",
  name_ru: "",
  description_uz: "",
  description_en: "",
  description_ru: "",
  price: 0,
  image: "",
  categoryId: "",
};

export default function Products() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products", categoryFilter],
    queryFn: () =>
      getProducts({
        limit: 100,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const saveMutation = useMutation({
    mutationFn: (data: ProductInput) =>
      editing ? updateProduct(editing.id, data) : createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Saqlandi!");
      closeModal();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("O'chirildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name_uz: p.name_uz,
      name_en: p.name_en,
      name_ru: p.name_ru,
      description_uz: p.description_uz,
      description_en: p.description_en,
      description_ru: p.description_ru,
      price: p.price,
      image: p.image,
      categoryId: p.categoryId,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const updateField = (key: keyof ProductInput, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const filtered = products?.filter((p) =>
    p.name_uz.toLowerCase().includes(search.toLowerCase()),
  );

  const getCategoryName = (id: string) =>
    categories?.find((c) => c.id === id)?.name_uz ?? "—";

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive mb-3">Ma'lumot yuklanmadi</p>
        <Button variant="outline" onClick={() => refetch()}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Mahsulotlar</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Kategoriya tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha kategoriyalar</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name_uz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
      ) : !filtered?.length ? (
        <EmptyState message="Mahsulotlar topilmadi" />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rasm</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead>Narxi</TableHead>
                <TableHead className="w-24">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={p.image}
                      alt={p.name_uz}
                      className="w-10 h-10 rounded object-cover bg-muted"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name_uz}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getCategoryName(p.categoryId)}
                  </TableCell>
                  <TableCell>{formatPrice(p.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="uz" className="mt-2">
            <TabsList>
              <TabsTrigger value="uz">UZ</TabsTrigger>
              <TabsTrigger value="en">EN</TabsTrigger>
              <TabsTrigger value="ru">RU</TabsTrigger>
            </TabsList>

            {(["uz", "en", "ru"] as const).map((lang) => (
              <TabsContent key={lang} value={lang} className="space-y-3 mt-3">
                <div>
                  <label className="text-sm font-medium">
                    Nomi ({lang.toUpperCase()})
                  </label>
                  <Input
                    value={form[`name_${lang}`]}
                    onChange={(e) =>
                      updateField(`name_${lang}`, e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Tavsif ({lang.toUpperCase()})
                  </label>
                  <Textarea
                    value={form[`description_${lang}`]}
                    onChange={(e) =>
                      updateField(`description_${lang}`, e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Narxi</label>
              <Input
                type="number"
                value={form.price || ""}
                onChange={(e) => updateField("price", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Kategoriya</label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => updateField("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_uz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Rasm</label>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                id="image-upload"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setUploading(true);

                  try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch(
                      "https://docs.mahinadolls.uz/upload",
                      {
                        method: "POST",
                        body: formData,
                      },
                    );

                    if (!res.ok) throw new Error("Upload failed");

                    const json = await res.json();
                    updateField("image", json.compressed);
                    toast.success("Rasm yuklandi!");
                  } catch {
                    toast.error("Rasm yuklanmadi, qayta urining");
                  } finally {
                    setUploading(false);
                    e.target.value = "";
                  }
                }}
              />

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={uploading}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                </Button>

                {form.image && (
                  <div className="relative w-fit">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => updateField("image", "")}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-90"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeModal}>
              Bekor qilish
            </Button>

            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
