import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory, Category, CategoryInput } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";

export default function Categories() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading, isError, refetch } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>({ name_uz: "", name_en: "", name_ru: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: (data: CategoryInput) =>
      editing ? updateCategory(editing.id, data) : createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Saqlandi!");
      closeModal();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("O'chirildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name_uz: "", name_en: "", name_ru: "" });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name_uz: cat.name_uz, name_en: cat.name_en, name_ru: cat.name_ru });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive mb-3">Ma'lumot yuklanmadi</p>
        <Button variant="outline" onClick={() => refetch()}>Qayta urinish</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Kategoriyalar</h1>
        <Button onClick={openCreate} className="gap-2"><Plus size={16} />Qo'shish</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : !categories?.length ? (
        <EmptyState message="Kategoriyalar topilmadi" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="relative bg-card border border-border rounded-lg p-4">
              <div className="absolute top-3 right-3 flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
              </div>
              <p className="font-semibold text-foreground">{cat.name_uz}</p>
              <p className="text-xs text-muted-foreground mt-1">{cat.name_en} · {cat.name_ru}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Tahrirlash" : "Yangi kategoriya"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">O'zbekcha nomi</label>
              <Input value={form.name_uz} onChange={(e) => setForm({ ...form, name_uz: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Inglizcha nomi</label>
              <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Ruscha nomi</label>
              <Input value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Bekor qilish</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
      />
    </div>
  );
}
