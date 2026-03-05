import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import plansService from '@/services/plans.service';
import type { Plan, CreatePlanInput } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const emptyForm: CreatePlanInput = { name: '', price: 0, durationDays: 30, isActive: true };

export default function AdminPlansPage() {
  useDocumentTitle('Quản lý gói');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePlanInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await plansService.getAll(false);
      setPlans(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (plan: Plan) => {
    setForm({
      name: plan.name,
      price: Number(plan.price),
      durationDays: plan.durationDays,
      isActive: plan.isActive,
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await plansService.update(editingId, form);
        toast.success('Cập nhật gói thành công');
      } else {
        await plansService.create(form);
        toast.success('Tạo gói thành công');
      }
      setShowForm(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa gói này?')) return;
    try {
      await plansService.delete(id);
      toast.success('Đã xóa gói');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý gói</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tạo gói mới
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{editingId ? 'Chỉnh sửa gói' : 'Tạo gói mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Tên gói"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <Input
                  label="Giá (USD)"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  required
                />
                <Input
                  label="Thời hạn (ngày)"
                  type="number"
                  value={form.durationDays}
                  onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                  required
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="accent-primary"
                />
                Kích hoạt gói
              </label>

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <LoadingSpinner size="sm" /> : <Check className="w-4 h-4 mr-1" />}
                  {editingId ? 'Cập nhật' : 'Tạo'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-text-secondary">
                <th className="p-4 font-medium">Tên gói</th>
                <th className="p-4 font-medium">Giá</th>
                <th className="p-4 font-medium">Thời hạn</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-border-default/50 hover:bg-surface-highlight/50 transition-colors">
                  <td className="p-4 font-medium">{plan.name}</td>
                  <td className="p-4">{formatPrice(Number(plan.price))}</td>
                  <td className="p-4">{plan.durationDays} ngày</td>
                  <td className="p-4">
                    <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(plan)} className="p-1.5 rounded hover:bg-surface-highlight text-text-secondary hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
