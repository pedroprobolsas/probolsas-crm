import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag, 
  Copy, 
  Check, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

// Datos de ejemplo para plantillas predefinidas
const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    title: 'Saludo inicial',
    content: 'Hola, gracias por contactar a ProBolsas. Mi nombre es [nombre_asesor] y seré su asesor. ¿En qué puedo ayudarle hoy?',
    category: 'Saludos',
    tags: ['bienvenida', 'inicial'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Solicitud de información',
    content: 'Para poder brindarle una mejor asesoría, ¿podría proporcionarme más detalles sobre el tipo de empaque que está buscando? Necesitaríamos conocer dimensiones, material, cantidad y uso que le dará.',
    category: 'Consultas',
    tags: ['información', 'detalles'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Seguimiento de cotización',
    content: 'Quería hacer un seguimiento sobre la cotización #[numero_cotizacion] que le enviamos el [fecha_envio]. ¿Ha tenido oportunidad de revisarla? Estoy disponible para resolver cualquier duda que pueda tener.',
    category: 'Seguimiento',
    tags: ['cotización', 'seguimiento'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Confirmación de pedido',
    content: 'Confirmamos la recepción de su pedido #[numero_pedido]. Su orden está siendo procesada y le notificaremos cuando esté lista para envío. El tiempo estimado de producción es de [tiempo_produccion] días hábiles.',
    category: 'Pedidos',
    tags: ['confirmación', 'pedido'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Notificación de envío',
    content: 'Su pedido #[numero_pedido] ha sido enviado hoy. Puede hacer seguimiento con el número de guía [numero_guia] a través de [empresa_transporte]. El tiempo estimado de entrega es de [tiempo_entrega] días hábiles.',
    category: 'Envíos',
    tags: ['envío', 'seguimiento'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Recordatorio de pago',
    content: 'Le recordamos que tiene un pago pendiente por la factura #[numero_factura] con vencimiento el [fecha_vencimiento]. Puede realizar su pago a través de transferencia bancaria a la cuenta [datos_cuenta].',
    category: 'Pagos',
    tags: ['recordatorio', 'pago'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    title: 'Agradecimiento por compra',
    content: 'Queremos agradecerle por su reciente compra. Esperamos que nuestros productos cumplan con sus expectativas. No dude en contactarnos si necesita asistencia adicional o tiene alguna consulta sobre su pedido.',
    category: 'Agradecimientos',
    tags: ['agradecimiento', 'post-venta'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    title: 'Solicitud de retroalimentación',
    content: 'Nos gustaría conocer su experiencia con nuestros productos y servicio. ¿Podría tomarse unos minutos para completar esta breve encuesta? Su opinión es muy importante para nosotros: [enlace_encuesta]',
    category: 'Retroalimentación',
    tags: ['encuesta', 'opinión'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function MessageTemplates({ onSelectTemplate }: MessageTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyToClipboard = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.content)
      .then(() => {
        setCopiedId(template.id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Plantilla copiada al portapapeles');
      })
      .catch(() => {
        toast.error('Error al copiar al portapapeles');
      });
  };

  const toggleExpand = (id: string) => {
    setExpandedTemplateId(expandedTemplateId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Plantillas de Mensajes</h3>
        
        {/* Búsqueda */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar plantillas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        
        {/* Filtro por categorías */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedCategory === null
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de plantillas */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No se encontraron plantillas
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map(template => (
              <div 
                key={template.id} 
                className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div 
                  className="p-3 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleExpand(template.id)}
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{template.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {template.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {expandedTemplateId === template.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedTemplateId === template.id && (
                  <div className="px-3 pb-3">
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {template.content}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
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
                    
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-500">
                        Categoría: {template.category}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onSelectTemplate(template.content)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          Usar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(template);
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {copiedId === template.id ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
