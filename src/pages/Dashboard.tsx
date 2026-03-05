import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories, getOrders } from "@/services/api";
import { Package, FolderOpen, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formatPrice = (p: number) => p.toLocaleString("uz-UZ").replace(/,/g, " ") + " so'm";
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Dashboard() {
  const { data: products, isLoading: lp } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: categories, isLoading: lc } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: orders, isLoading: lo } = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  const stats = [
    { label: "Mahsulotlar", value: products?.length ?? 0, icon: Package, loading: lp },
    { label: "Kategoriyalar", value: categories?.length ?? 0, icon: FolderOpen, loading: lc },
    { label: "Buyurtmalar", value: orders?.length ?? 0, icon: ShoppingCart, loading: lo },
  ];

  const recentOrders = orders?.slice(-5).reverse() ?? [];
  const recentProducts = products?.slice(-5).reverse() ?? [];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <s.icon size={20} />
            </div>
            <div>
              {s.loading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-bold">{s.value}</p>
              )}
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-semibold mb-4">So'nggi buyurtmalar</h2>
          {lo ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : !recentOrders.length ? (
            <p className="text-sm text-muted-foreground">Buyurtmalar yo'q</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ism</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{o.phone}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(o.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-semibold mb-4">So'nggi mahsulotlar</h2>
          {lp ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : !recentProducts.length ? (
            <p className="text-sm text-muted-foreground">Mahsulotlar yo'q</p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name_uz} className="w-10 h-10 rounded object-cover bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name_uz}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
