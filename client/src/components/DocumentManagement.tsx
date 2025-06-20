import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, FileText, Scale } from "lucide-react";
import type { Document, InsertDocument } from "@shared/schema";

interface DocumentFormData {
  title: string;
  type: "policy" | "rules";
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  order: number;
}

export function DocumentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | "policy" | "rules">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    type: "policy",
    content: "",
    fileUrl: "",
    fileName: "",
    fileSize: 0,
    order: 0,
  });

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents", selectedType !== "all" ? selectedType : undefined],
    queryFn: async ({ queryKey }) => {
      const [url, type] = queryKey;
      const params = type ? `?type=${type}` : "";
      const response = await fetch(`${url}${params}`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Документ создан", description: "Документ успешно добавлен" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось создать документ", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertDocument> }) => {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      setIsDialogOpen(false);
      setEditingDocument(null);
      resetForm();
      toast({ title: "Документ обновлен", description: "Изменения сохранены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить документ", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      toast({ title: "Документ удален", description: "Документ успешно удален" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить документ", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      type: "policy",
      content: "",
      fileUrl: "",
      fileName: "",
      fileSize: 0,
      order: 0,
    });
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      type: document.type as "policy" | "rules",
      content: document.content,
      fileUrl: document.fileUrl || "",
      fileName: document.fileName || "",
      fileSize: document.fileSize || 0,
      order: document.order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return;
    }

    const documentData: InsertDocument = {
      title: formData.title,
      type: formData.type,
      content: formData.content,
      fileUrl: formData.fileUrl || null,
      fileName: formData.fileName || null,
      fileSize: formData.fileSize || null,
      order: formData.order,
      isActive: true,
    };

    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, data: documentData });
    } else {
      createMutation.mutate(documentData);
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "policy" ? <Scale className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    return type === "policy" ? (
      <Badge variant="outline" className="text-blue-600 border-blue-200">
        Политика
      </Badge>
    ) : (
      <Badge variant="outline" className="text-green-600 border-green-200">
        Правила
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Загрузка документов...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление документами</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedType} onValueChange={(value: "all" | "policy" | "rules") => setSelectedType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все документы</SelectItem>
              <SelectItem value="policy">Политика</SelectItem>
              <SelectItem value="rules">Правила</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingDocument(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить документ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDocument ? "Редактировать документ" : "Создать документ"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Название документа</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название документа"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Тип документа</Label>
                  <Select value={formData.type} onValueChange={(value: "policy" | "rules") => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy">Политика</SelectItem>
                      <SelectItem value="rules">Правила</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Содержимое документа</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Введите текст документа"
                    rows={8}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fileUrl">Ссылка на файл (необязательно)</Label>
                  <Input
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://example.com/document.pdf"
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="fileName">Название файла (необязательно)</Label>
                  <Input
                    id="fileName"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="document.pdf"
                  />
                </div>
                <div>
                  <Label htmlFor="order">Порядок отображения</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingDocument(null);
                      resetForm();
                    }}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingDocument ? "Обновить" : "Создать"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Документы не найдены</p>
              <p className="text-sm text-gray-400">Создайте первый документ для управления политикой и правилами</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((document: Document) => (
            <Card key={document.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(document.type)}
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                    {getTypeBadge(document.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(document)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(document.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-3">{document.content}</p>
                  {document.fileUrl && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <FileText className="h-4 w-4" />
                      <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {document.fileName || "Скачать файл"}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Порядок: {document.order}</span>
                    <span>Создан: {document.createdAt ? new Date(document.createdAt).toLocaleDateString("ru-RU") : "Неизвестно"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}