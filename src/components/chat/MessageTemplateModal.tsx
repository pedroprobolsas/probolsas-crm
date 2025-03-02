import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { MessageTemplate } from './MessageTemplates';

interface MessageTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
  template?: MessageTemplate;
  isSubmitting?: boolean;
}

export function MessageTemplateModal({ 
  isOpen, 
  onClose, 
  onSave, 
  template, 
  isSubmitting = false 
}: MessageTemplateModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categorías predefinidas
  const predefinedCategories = [
    'Saludos',
    'Consultas',
    'Seguimiento',
    'Pedidos',
    'Envíos',
    'Pagos',
    'Agradecimientos',
    'Retroalimentación',
    'Recordatorios',
    'Otros'
  ];

  // Variables de reemplazo comunes
  const commonVariables = [
    { name: '[nombre_cliente]', description: 'Nombre del cliente' },
    { name: '[nombre_asesor]', description: 'Nombre del asesor' },
    { name: '[empresa_cliente]', description: 'Nombre de la empresa del cliente' },
    { name: '[numero_cotizacion]', description: 'Número de cotización' },
    { name: '[fecha_envio]', description: 'Fecha de envío' },
    { name: '[numero_pedido]', description: 'Número de pedido' },
    { name: '[tiempo_produccion]', description: 'Tiempo de producción' },
    { name: '[numero_guia]', description: 'Número de guía de envío' },
    { name: '[empresa_transporte]', description: 'Empresa de transporte' },
    { name: '[tiempo_entrega]', description: 'Tiempo estimado de entrega' },
    { name: '[numero_factura]', description: 'Número de factura' },
    { name: '[fecha_vencimiento]', description: 'Fecha de vencimiento' },
    { name: '[datos_cuenta]', description: 'Datos de la cuenta bancaria' },
    { name: '[enlace_encuesta]', description: 'Enlace a encuesta de satisfacción' }
  ];

  // Inicializar el formulario con los datos de la plantilla si se está editando
  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setContent(template.content);
      setCategory(template.category);
      setTags(template.tags);
    } else {
      // Valores por defecto para nueva plantilla
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
    }
  }, [template, isOpen]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertVariable = (variable: string) => {
    setContent(prev => prev + variable);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!content.trim()) {
      newErrors.content = 'El contenido es requerido';
    }

    if (!category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        title,
        content,
        category,
        tags
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Saludo inicial"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <div className="mt-1 relative">
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="categories"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Selecciona o escribe una categoría"
              />
              <datalist id="categories">
                {predefinedCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenido
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Escribe el contenido de la plantilla..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variables disponibles
            </label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">
                Haz clic en una variable para insertarla en el contenido:
              </p>
              <div className="flex flex-wrap gap-2">
                {commonVariables.map((variable) => (
                  <button
                    key={variable.name}
                    type="button"
                    onClick={() => insertVariable(variable.name)}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                    title={variable.description}
                  >
                    {variable.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Etiquetas
            </label>
            <div className="mt-1 flex">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Añadir etiqueta"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
