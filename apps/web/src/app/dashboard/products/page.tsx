"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/utils";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // New Product Form
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("10");
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get merchant ID
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
            if (!merchant) return;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
            if (!merchant) throw new Error("Merchant profile not found");



            // ... inside component ...

            let imageUrl = null;
            if (imageFile) {
                // Compress Image
                const compressedFile = await compressImage(imageFile, 0.7, 1000);

                const fileExt = compressedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${merchant.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);
                imageUrl = urlData.publicUrl;
            }

            const { error } = await supabase.from('products').insert({
                merchant_id: merchant.id,
                name,
                description,
                base_price: Number(price),
                stock_quantity: Number(stock),
                image_url: imageUrl,
                is_active: true
            });

            if (error) throw error;

            toast.success("Product created!");
            setIsDialogOpen(false);
            // Reset form
            setName("");
            setDescription("");
            setPrice("");
            setImageFile(null);
            fetchProducts();

        } catch (error: any) {
            toast.error(error.message || "Failed to create product");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete");
        } else {
            toast.success("Deleted");
            fetchProducts();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Products</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#00D632] hover:bg-[#00b829] text-black">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="desc">Description</Label>
                                <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">Price (XOF)</Label>
                                    <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                                <div>
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="image">Image</Label>
                                <Input id="image" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                            </div>
                            <Button type="submit" className="w-full bg-[#00D632] text-black" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Product
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No products yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                            <div className="aspect-video bg-gray-100 relative">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="p-4 flex-1">
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="font-bold text-[#006b19]">{product.base_price} XOF</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Stock: {product.stock_quantity}</span>
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-100 flex justify-end">
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
