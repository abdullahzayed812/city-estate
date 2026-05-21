import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { Spinner, Card, Skeleton } from '../../components/ui';

const PROPERTY_TYPES = [
  { key: 'APARTMENT', label: 'شقة' }, { key: 'VILLA', label: 'فيلا' },
  { key: 'LAND', label: 'أرض' }, { key: 'OFFICE', label: 'مكتب' },
  { key: 'STUDIO', label: 'استوديو' }, { key: 'WAREHOUSE', label: 'مخزن' },
  { key: 'FACTORY', label: 'مصنع' }, { key: 'SHOP', label: 'محل تجاري' },
];
const LISTING_TYPES = [
  { key: 'SALE', label: 'للبيع' }, { key: 'RENT', label: 'للإيجار' }, { key: 'DAILY_RENT', label: 'إيجار يومي' },
];
const FURNISHED_OPTS = [
  { key: 'FURNISHED', label: 'مفروش' }, { key: 'SEMI_FURNISHED', label: 'نصف مفروش' }, { key: 'UNFURNISHED', label: 'غير مفروش' },
];
const CONDITION_OPTS = [
  { key: 'NEW', label: 'جديد' }, { key: 'EXCELLENT', label: 'ممتاز' }, { key: 'GOOD', label: 'جيد' }, { key: 'NEEDS_RENOVATION', label: 'يحتاج تجديد' },
];

interface FormState {
  titleAr: string; descriptionAr: string; type: string; listingType: string;
  price: string; area: string; bedrooms: string; bathrooms: string;
  floor: string; totalFloors: string; parkingSpaces: string;
  furnished: string; condition: string; address: string; district: string;
}

function ChipSelect({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold border-2 transition-all ${
            value === o.key ? 'bg-primary text-white border-primary' : 'bg-bg text-text-sub border-border hover:border-primary/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-sub mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline, ...rest }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; [k: string]: any }) {
  const cls = 'w-full px-4 py-2.5 rounded-md bg-bg border border-border text-text-main placeholder-text-muted text-sm outline-none focus:border-primary transition-colors';
  if (multiline) {
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none min-h-[90px]`} {...rest} />;
  }
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} {...rest} />;
}

function buildPayload(form: FormState) {
  return {
    title: form.titleAr, titleAr: form.titleAr,
    description: form.descriptionAr, descriptionAr: form.descriptionAr,
    type: form.type, listingType: form.listingType,
    price: parseFloat(form.price), area: parseFloat(form.area),
    bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
    bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
    floor: form.floor ? parseInt(form.floor) : undefined,
    totalFloors: form.totalFloors ? parseInt(form.totalFloors) : undefined,
    parkingSpaces: form.parkingSpaces ? parseInt(form.parkingSpaces) : 0,
    furnished: form.furnished || undefined,
    condition: form.condition || undefined,
    location: {
      address: form.address || form.district || 'برج العرب',
      addressAr: form.address || form.district || 'برج العرب',
      city: 'Borg El Arab', district: form.district || undefined,
      latitude: 30.876, longitude: 29.654,
    },
  };
}

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!propertyId;

  const [form, setForm] = useState<FormState>({
    titleAr: '', descriptionAr: '', type: 'APARTMENT', listingType: 'SALE',
    price: '', area: '', bedrooms: '', bathrooms: '', floor: '', totalFloors: '',
    parkingSpaces: '', furnished: '', condition: '', address: '', district: '',
  });
  const [error, setError] = useState('');

  const set = (key: keyof FormState, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const { isLoading: isFetching, data: propertyData } = useQuery({
    queryKey: ['property-edit', propertyId],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${propertyId}`);
      return data.data;
    },
    enabled: isEdit,
    staleTime: 0,
  });

  useEffect(() => {
    if (!propertyData) return;
    const p = propertyData;
    setForm({
      titleAr: p.titleAr || p.title || '',
      descriptionAr: p.descriptionAr || p.description || '',
      type: p.type || 'APARTMENT',
      listingType: p.listingType || 'SALE',
      price: p.price != null ? String(p.price) : '',
      area: p.area != null ? String(p.area) : '',
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
      floor: p.floor != null ? String(p.floor) : '',
      totalFloors: p.totalFloors != null ? String(p.totalFloors) : '',
      parkingSpaces: p.parkingSpaces != null ? String(p.parkingSpaces) : '',
      furnished: p.furnished || '',
      condition: p.condition || '',
      address: p.location?.addressAr || p.location?.address || '',
      district: p.location?.district || '',
    });
  }, [propertyData]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/properties', buildPayload(form));
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'listings'] });
      navigate('/listings');
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put(`/properties/${propertyId}`, buildPayload(form));
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      navigate('/listings');
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى'),
  });

  const activeMutation = isEdit ? updateMutation : createMutation;
  const isValid = form.titleAr.trim().length >= 10 && form.descriptionAr.trim().length >= 50 && form.price && form.area && form.address.trim();

  if (isEdit && isFetching) {
    return (
      <div className="min-h-screen bg-bg" dir="rtl">
        <div className="bg-dark sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-xl">←</button>
            <h1 className="text-white font-black text-xl flex-1">تعديل العقار</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <div className="bg-dark sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-xl transition-colors">←</button>
          <h1 className="text-white font-black text-xl flex-1">{isEdit ? 'تعديل العقار' : 'إضافة عقار'}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Section: Basic Info */}
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-text-main text-base border-b border-border pb-3 mb-4">المعلومات الأساسية</h2>

          <Field label="عنوان العقار *" hint={`${form.titleAr.trim().length}/10 حرف كحد أدنى`}>
            <TextInput value={form.titleAr} onChange={(v) => set('titleAr', v)} placeholder="مثال: شقة فاخرة بثلاث غرف نوم في برج العرب" />
          </Field>

          <Field label="وصف العقار *" hint={`${form.descriptionAr.trim().length}/50 حرف كحد أدنى`}>
            <TextInput value={form.descriptionAr} onChange={(v) => set('descriptionAr', v)} placeholder="وصف تفصيلي للعقار ومميزاته..." multiline rows={4} />
          </Field>
        </Card>

        {/* Section: Type & Price */}
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-text-main text-base border-b border-border pb-3 mb-4">نوع وسعر العقار</h2>

          <Field label="نوع العقار">
            <ChipSelect options={PROPERTY_TYPES} value={form.type} onChange={(v) => set('type', v)} />
          </Field>

          <Field label="نوع العرض">
            <ChipSelect options={LISTING_TYPES} value={form.listingType} onChange={(v) => set('listingType', v)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="السعر (جنيه) *">
              <TextInput value={form.price} onChange={(v) => set('price', v)} placeholder="500000" type="number" />
            </Field>
            <Field label="المساحة (م²) *">
              <TextInput value={form.area} onChange={(v) => set('area', v)} placeholder="120" type="number" />
            </Field>
          </div>
        </Card>

        {/* Section: Details */}
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-text-main text-base border-b border-border pb-3 mb-4">التفاصيل</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="غرف النوم"><TextInput value={form.bedrooms} onChange={(v) => set('bedrooms', v)} placeholder="3" type="number" /></Field>
            <Field label="الحمامات"><TextInput value={form.bathrooms} onChange={(v) => set('bathrooms', v)} placeholder="2" type="number" /></Field>
            <Field label="الطابق"><TextInput value={form.floor} onChange={(v) => set('floor', v)} placeholder="3" type="number" /></Field>
            <Field label="إجمالي الطوابق"><TextInput value={form.totalFloors} onChange={(v) => set('totalFloors', v)} placeholder="10" type="number" /></Field>
            <Field label="مواقف السيارات"><TextInput value={form.parkingSpaces} onChange={(v) => set('parkingSpaces', v)} placeholder="1" type="number" /></Field>
          </div>

          <Field label="التأثيث">
            <ChipSelect options={FURNISHED_OPTS} value={form.furnished} onChange={(v) => set('furnished', v)} />
          </Field>

          <Field label="حالة العقار">
            <ChipSelect options={CONDITION_OPTS} value={form.condition} onChange={(v) => set('condition', v)} />
          </Field>
        </Card>

        {/* Section: Location */}
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-text-main text-base border-b border-border pb-3 mb-4">الموقع</h2>

          <Field label="العنوان الكامل *">
            <TextInput value={form.address} onChange={(v) => set('address', v)} placeholder="برج العرب، الإسكندرية" />
          </Field>

          <Field label="الحي">
            <TextInput value={form.district} onChange={(v) => set('district', v)} placeholder="الحي الأول" />
          </Field>
        </Card>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-error-light border border-red-200 rounded-md p-3 text-error text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="flex gap-3 pb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-md border border-border text-text-sub font-bold hover:bg-bg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => activeMutation.mutate()}
            disabled={!isValid || activeMutation.isPending}
            className="flex-1 py-3 rounded-md bg-primary text-white font-bold shadow-blue hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {activeMutation.isPending ? <Spinner size={18} /> : isEdit ? 'حفظ التعديلات' : 'إرسال للمراجعة'}
          </button>
        </div>
      </div>
    </div>
  );
}
