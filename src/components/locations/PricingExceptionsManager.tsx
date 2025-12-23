import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  usePricingExceptions,
  useCreatePricingExceptionMutation,
  useUpdatePricingExceptionMutation,
  useDeletePricingExceptionMutation,
} from "@/lib/queries/pricing";
import { PricingExceptionsTable } from "./pricing/PricingExceptionsTable";
import { PricingExceptionDialog } from "./pricing/PricingExceptionDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CreatePricingExceptionCmd, PricingExceptionDTO } from "@/types";
import { toast } from "sonner";

interface PricingExceptionsManagerProps {
  locationId: string;
}

export function PricingExceptionsManager({ locationId }: PricingExceptionsManagerProps) {
  const { data: exceptions = [], isLoading } = usePricingExceptions(locationId);
  const createMutation = useCreatePricingExceptionMutation(locationId);
  const updateMutation = useUpdatePricingExceptionMutation(locationId);
  const deleteMutation = useDeletePricingExceptionMutation(locationId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingException, setEditingException] = useState<PricingExceptionDTO | null>(null);
  const [deletingException, setDeletingException] = useState<PricingExceptionDTO | null>(null);

  const handleCreate = async (data: CreatePricingExceptionCmd) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Wyjątek cenowy został dodany.");
    } catch (error) {
      // console.error(error);
      toast.error("Nie udało się dodać wyjątku.");
      throw error;
    }
  };

  const handleUpdate = async (data: CreatePricingExceptionCmd) => {
    if (!editingException) return;
    try {
      await updateMutation.mutateAsync({
        exceptionId: editingException.id,
        data,
      });
      toast.success("Wyjątek cenowy został zaktualizowany.");
      setEditingException(null);
    } catch (error) {
      // console.error(error);
      toast.error("Nie udało się zaktualizować wyjątku.");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletingException) return;
    try {
      await deleteMutation.mutateAsync(deletingException.id);
      toast.success("Wyjątek cenowy został usunięty.");
      setDeletingException(null);
    } catch {
      // console.error(error);
      toast.error("Nie udało się usunąć wyjątku.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wyjątki cenowe</CardTitle>
            <CardDescription>Zarządzaj wyjątkami cenowymi dla tej lokalizacji.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj wyjątek
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PricingExceptionsTable
          data={exceptions}
          isLoading={isLoading}
          onEdit={setEditingException}
          onDelete={setDeletingException}
        />

        <PricingExceptionDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreate}
          title="Dodaj wyjątek cenowy"
          description="Zdefiniuj nowy okres ze zmienioną ceną."
          submitLabel="Dodaj"
        />

        <PricingExceptionDialog
          open={!!editingException}
          onOpenChange={(open) => !open && setEditingException(null)}
          onSubmit={handleUpdate}
          defaultValues={
            editingException
              ? {
                  start_date: editingException.start_date.split("T")[0],
                  end_date: editingException.end_date.split("T")[0],
                  percentage_change: editingException.percentage_change,
                  description: editingException.description || "",
                }
              : undefined
          }
          title="Edytuj wyjątek cenowy"
          description="Zmień parametry wyjątku cenowego."
          submitLabel="Zapisz"
        />

        <AlertDialog
          open={!!deletingException}
          onOpenChange={(open: boolean) => !open && setDeletingException(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć ten wyjątek?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta operacja jest nieodwracalna. Wyjątek cenowy przestanie obowiązywać.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Usuń
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
