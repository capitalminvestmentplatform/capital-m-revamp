"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmModal } from "../modals/ConfirmModal";
import CustomButton from "../Button";

interface Category {
  _id: string;
  name: string;
}

interface ManageCategoriesModalProps {
  fetchCategories: () => Promise<void>;
  categories: Category[];
}

export const ManageCategoriesModal = ({
  fetchCategories,
  categories,
}: ManageCategoriesModalProps) => {
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false); // 🔥 added loading

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      setLoading(true); // start loading

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      setNewCategory("");
      fetchCategories(); // Refresh categories
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      setLoading(true); // start loading

      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      setEditingId(null);
      fetchCategories(); // Refresh categories
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      fetchCategories(); // Refresh categories
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Plus className="w-5 h-5 text-primaryBG cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={loading}
            />
            <CustomButton
              type="button"
              classes="bg-primaryBG text-xs"
              name="Add"
              state={loading}
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
            />
          </div>

          {/* List current categories */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex justify-between items-center border p-2 rounded"
              >
                {editingId === cat._id ? (
                  <div className="flex gap-2 w-full">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full"
                      disabled={loading}
                    />
                    <div className="flex gap-1">
                      <CustomButton
                        type="button"
                        classes="bg-primaryBG text-xs"
                        name="Save"
                        state={loading}
                        onClick={() => handleEditCategory(cat._id)}
                        disabled={!editingName.trim()}
                      />
                      <CustomButton
                        type="button"
                        classes="bg-gray-200 text-gray-700 text-xs hover:bg-gray-300"
                        name="Cancel"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                        disabled={loading}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <span>{cat.name}</span>
                    <div className="flex gap-2">
                      <Pencil
                        size={18}
                        className="text-green-500 cursor-pointer"
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditingName(cat.name);
                        }}
                      />

                      <ConfirmModal
                        title="Delete Category?"
                        description="Are you sure you want to delete this category? This action cannot be undone."
                        onConfirm={() => handleDeleteCategory(cat._id)}
                      >
                        <Trash
                          size={18}
                          className="text-red-600 cursor-pointer"
                        />
                      </ConfirmModal>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
