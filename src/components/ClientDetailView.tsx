import React, { useState } from 'react';
import { 
  Building2, 
  Globe, 
  FileText, 
  Users, 
  Phone, 
  Mail, 
  Briefcase, 
  Scale, 
  Calendar, 
  ArrowLeft,
  MessageCircle,
  Edit,
  Save,
  X,
  Upload,
  Plus
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale';
import { ClientTimeline } from './ClientTimeline';
import { useClientDetail } from '../lib/hooks/useClientDetail';
import { useQuotes } from '../lib/hooks/useQuotes';
import { QuoteModal } from './quotes/QuoteModal';
import { QuoteList } from './quotes/QuoteList';
import type { Client, ClientStage, Quote } from '../types';
import { toast } from 'sonner';

interface ClientDetailViewProps {
  client: Client;
  onClose: () => void;
  onStageChange: (newStage: ClientStage) => void;
  onNewInteraction: () => void;
}

type TabType = 'general' | 'contacts' | 'fiscal' | 'commercial' | 'quotes' | 'organizational';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'contacts', label: 'Contactos', icon: Users },
  { id: 'fiscal', label: 'Fiscal/Legal', icon: Scale },
  { id: 'commercial', label: 'Comercial', icon: Briefcase },
  { id: 'quotes', label: 'Cotizaciones', icon: FileText },
  { id: 'organizational', label: 'Organizacional', icon: FileText },
];

export function ClientDetailView({ client, onClose, onStageChange, onNewInteraction }: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { updateClient, isUpdating } = useClientDetail(client.id);
  const { createQuote, isCreating: isCreatingQuote } = useQuotes(client.id);
  const [formData, setFormData] = useState<Client>(client);

  const handleSave = async () => {
    try {
      await updateClient(formData);
      setIsEditing(false);
      toast.success('Cliente actualizado exitosamente');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Error al actualizar el cliente');
    }
  };

  const handleCreateQuote = async (quote: Omit<Quote, 'id' | 'created_at'>) => {
    try {
      console.log('Creating quote with data:', quote);
      
      // Asegurarse de que la cotización tenga la información del cliente
      const quoteWithClientInfo = {
        ...quote,
        client_id: client.id,
        client_name: client.name,
        client_company: client.company
      };
      
      await createQuote(quoteWithClientInfo);
      setShowQuoteModal(false);
      toast.success('Cotización creada exitosamente');
      
      // Forzar la actualización de la pestaña de cotizaciones
      if (activeTab === 'quotes') {
        // Pequeño hack para forzar la actualización del componente
        setActiveTab('general');
        setTimeout(() => setActiveTab('quotes'), 10);
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Error al crear la cotización');
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Razón Social</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{client.company}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">NIT</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.tax_id || ''}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{client.tax_id || 'No especificado'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Página Web</label>
          {isEditing ? (
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">
              {client.website ? (
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  {client.website}
                </a>
              ) : (
                'No especificado'
              )}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sector</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.sector || ''}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{client.sector || 'No especificado'}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción del Negocio</label>
        {isEditing ? (
          <textarea
            value={formData.business_description || ''}
            onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{client.business_description || 'No especificado'}</p>
        )}
      </div>
    </div>
  );

  const renderContactsTab = () => (
    <div className="space-y-8">
      {/* Gerente General */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gerente General</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.general_manager_name || ''}
                onChange={(e) => setFormData({ ...formData, general_manager_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.general_manager_name || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.general_manager_email || ''}
                onChange={(e) => setFormData({ ...formData, general_manager_email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.general_manager_email || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.general_manager_phone || ''}
                onChange={(e) => setFormData({ ...formData, general_manager_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.general_manager_phone || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Cumpleaños</label>
            {isEditing ? (
              <DatePicker
                selected={formData.general_manager_birthday ? new Date(formData.general_manager_birthday) : null}
                onChange={(date) => setFormData({ ...formData, general_manager_birthday: date?.toISOString() || null })}
                dateFormat="dd/MM/yyyy"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                locale={es}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {client.general_manager_birthday ? new Date(client.general_manager_birthday).toLocaleDateString() : 'No especificado'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gerente de Compras */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gerente de Compras</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.purchasing_manager_name || ''}
                onChange={(e) => setFormData({ ...formData, purchasing_manager_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.purchasing_manager_name || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.purchasing_manager_email || ''}
                onChange={(e) => setFormData({ ...formData, purchasing_manager_email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.purchasing_manager_email || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.purchasing_manager_phone || ''}
                onChange={(e) => setFormData({ ...formData, purchasing_manager_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.purchasing_manager_phone || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Cumpleaños</label>
            {isEditing ? (
              <DatePicker
                selected={formData.purchasing_manager_birthday ? new Date(formData.purchasing_manager_birthday) : null}
                onChange={(date) => setFormData({ ...formData, purchasing_manager_birthday: date?.toISOString() || null })}
                dateFormat="dd/MM/yyyy"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                locale={es}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {client.purchasing_manager_birthday ? new Date(client.purchasing_manager_birthday).toLocaleDateString() : 'No especificado'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gerente de Calidad */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gerente de Calidad</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.quality_manager_name || ''}
                onChange={(e) => setFormData({ ...formData, quality_manager_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.quality_manager_name || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.quality_manager_email || ''}
                onChange={(e) => setFormData({ ...formData, quality_manager_email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.quality_manager_email || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.quality_manager_phone || ''}
                onChange={(e) => setFormData({ ...formData, quality_manager_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.quality_manager_phone || 'No especificado'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Cumpleaños</label>
            {isEditing ? (
              <DatePicker
                selected={formData.quality_manager_birthday ? new Date(formData.quality_manager_birthday) : null}
                onChange={(date) => setFormData({ ...formData, quality_manager_birthday: date?.toISOString() || null })}
                dateFormat="dd/MM/yyyy"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                locale={es}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {client.quality_manager_birthday ? new Date(client.quality_manager_birthday).toLocaleDateString() : 'No especificado'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiscalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Gran Contribuyente</label>
          {isEditing ? (
            <select
              value={formData.is_large_taxpayer ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_large_taxpayer: e.target.value === 'true' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{client.is_large_taxpayer ? 'Sí' : 'No'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Autoretenedor</label>
          {isEditing ? (
            <select
              value={formData.is_self_withholding ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_self_withholding: e.target.value === 'true' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{client.is_self_withholding ? 'Sí' : 'No'}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCommercialTab = () => (
    <div className="space-y-8">
      {/* Packaging Types and Materials */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipos de Empaques</label>
          {isEditing ? (
            <div className="space-y-2">
              {formData.packaging_types?.map((pkg: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={pkg.type}
                    onChange={(e) => {
                      const newTypes = [...(formData.packaging_types || [])];
                      newTypes[index] = { ...pkg, type: e.target.value };
                      setFormData({ ...formData, packaging_types: newTypes });
                    }}
                    placeholder="Tipo de empaque"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={pkg.monthly_volume || ''}
                    onChange={(e) => {
                      const newTypes = [...(formData.packaging_types || [])];
                      newTypes[index] = { ...pkg, monthly_volume: parseFloat(e.target.value) || 0 };
                      setFormData({ ...formData, packaging_types: newTypes });
                    }}
                    placeholder="Volumen mensual"
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <select
                    value={pkg.unit || 'kg'}
                    onChange={(e) => {
                      const newTypes = [...(formData.packaging_types || [])];
                      newTypes[index] = { ...pkg, unit: e.target.value };
                      setFormData({ ...formData, packaging_types: newTypes });
                    }}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="kg">kg</option>
                    <option value="units">unidades</option>
                    <option value="rolls">rollos</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const newTypes = formData.packaging_types?.filter((_, i) => i !== index);
                      setFormData({ ...formData, packaging_types: newTypes });
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newTypes = [...(formData.packaging_types || []), { type: '', monthly_volume: 0, unit: 'kg' }];
                  setFormData({ ...formData, packaging_types: newTypes });
                }}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Tipo de Empaque
              </button>
            </div>
          ) : (
            <div className="mt-1 space-y-2">
              {client.packaging_types?.map((pkg: any, index) => (
                <div key={index} className="flex justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm text-gray-900">{pkg.type}</span>
                  <span className="text-sm text-gray-600">
                    {pkg.monthly_volume.toLocaleString()} {pkg.unit}/mes
                  </span>
                </div>
              )) || <p className="text-sm text-gray-500">No especificado</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuotesTab = () => (
    <div className="space-y-6">
      <QuoteList clientId={client.id} />
    </div>
  );

  const renderOrganizationalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Empleados Administrativos</label>
          {isEditing ? (
            <input
              type="number"
              value={formData.admin_employees_count || ''}
              onChange={(e) => setFormData({ ...formData, admin_employees_count: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{client.admin_employees_count || 'No especificado'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Empleados de Planta</label>
          {isEditing ? (
            <input
              type="number"
              value={formData.plant_employees_count || ''}
              onChange={(e) => setFormData({ ...formData, plant_employees_count: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{client.plant_employees_count || 'No especificado'}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Misión</label>
        {isEditing ? (
          <textarea
            value={formData.mission || ''}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
            {client.mission || 'No especificado'}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Visión</label>
        {isEditing ? (
          <textarea
            value={formData.vision || ''}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
            {client.vision || 'No especificado'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <FileText className="w-5 h-5 mr-2" />
                Nueva Cotización
              </button>
              <button
                onClick={onNewInteraction}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Nueva Interacción
              </button>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(client);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <tab.icon
                  className={`${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } -ml-0.5 mr-2 h-5 w-5`}
                  aria-hidden="true"
                />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'general' && renderGeneralTab()}
           {activeTab === 'contacts' && renderContactsTab()}
          {activeTab === 'fiscal' && renderFiscalTab()}
          {activeTab === 'commercial' && renderCommercialTab()}
          {activeTab === 'quotes' && renderQuotesTab()}
          {activeTab === 'organizational' && renderOrganizationalTab()}
        </div>

        {/* Quote Modal */}
        <QuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          onSubmit={handleCreateQuote}
          clientId={client.id}
          isSubmitting={isCreatingQuote}
        />
      </div>
    </div>
  );
}
