import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  Tag, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { MessageTemplateModal } from './MessageTemplateModal';
import { useMessageTemplates } from '../../lib/hooks/useMessageTemplates';
import type { MessageTemplate } from './MessageTemplates';
import { toast } from 'sonner';

export function MessageTemplateManager() {
  const { 
    templates, 
    isLoading, 
    error, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
    getTemplatesByCategory,
    searchTemplates
  } = useMessageTemplates();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | undefined>(undefined);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Obtener categorías únicas
  const categories = Array.from(new Set(templates.map(template => template.category)));

  // Filtrar plantillas según búsqueda y categoría
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const handleSaveTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, templateData);
        toast.success('Plantilla actualizada exitosamente');
      } else {
        await createTemplate(templateData);
        toast.success('Plantilla creada exitosamente');
      }
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Error al guardar la plantilla:', error);
      toast.error('Error al guardar la plantilla');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      setShowDeleteConfirm(null);
      toast.success('Plantilla eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
      toast.error('Error al eliminar la plantilla');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTemplateId(expandedTemplateId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <p>Error al cargar las plantillas: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Administrar Plantillas de Mensajes</h2>
          <button
            onClick={() => {
              setSelectedTemplate(undefined);
              setShowTemplateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Plantilla
          </button>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar plantillas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <div>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron plantillas</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory
                ? 'Intenta con otros criterios de búsqueda'
                : 'Crea tu primera plantilla para comenzar'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map(template => (
              <div 
                key={template.id} 
                className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleExpand(template.id)}
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{template.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {template.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 mr-3">
                      {template.category}
                    </span>
                    {expandedTemplateId === template.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedTemplateId === template.id && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {template.content}
                      </p>
                    </div>
                    
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Última actualización: {new Date(template.updated_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                            setShowTemplateModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        
                        {showDeleteConfirm === template.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirmar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(null);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(template.id);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Modal */}
      <MessageTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setSelectedTemplate(undefined);
        }}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
