import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Agent } from '../lib/types';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  agent?: Agent;
  isSubmitting?: boolean;
}

export function AgentModal({ isOpen, onClose, onSubmit, agent, isSubmitting }: AgentModalProps) {
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    email: agent?.email || '',
    whatsappNumber: agent?.whatsappNumber || '',
    role: agent?.role || 'agent',
    status: agent?.status || 'offline',
    lastActive: agent?.lastActive || new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'El número de WhatsApp es requerido';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'Número de WhatsApp inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {agent ? 'Editar Asesor' : 'Nuevo Asesor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">
                Número de WhatsApp
              </label>
              <input
                type="text"
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="+1234567890"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.whatsappNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'agent' }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="agent">Asesor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : agent ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}