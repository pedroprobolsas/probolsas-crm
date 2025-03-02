import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { MessageTemplate } from '../../components/chat/MessageTemplates';

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

// Tipo para los datos de creación/actualización de plantillas
export type MessageTemplateInput = Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>;

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  // Cargar plantillas
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        // En una implementación real, aquí se cargarían las plantillas desde Supabase
        // Por ahora, usamos los datos de ejemplo
        
        // Simulamos una carga desde la base de datos
        setTimeout(() => {
          setTemplates(defaultTemplates);
          setIsLoading(false);
        }, 500);

        // Ejemplo de cómo sería con Supabase:
        /*
        const { data, error } = await supabase
          .from('message_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
        */
      } catch (err) {
        console.error('Error al cargar plantillas:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Crear una nueva plantilla
  const createTemplate = async (templateData: MessageTemplateInput) => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear plantillas');
      return null;
    }

    try {
      const newTemplate: MessageTemplate = {
        id: uuidv4(),
        ...templateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // En una implementación real, aquí se guardaría en Supabase
      // Por ahora, solo actualizamos el estado local
      
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Plantilla creada exitosamente');

      // Ejemplo de cómo sería con Supabase:
      /*
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          ...templateData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data, ...prev]);
      */

      return newTemplate;
    } catch (err) {
      console.error('Error al crear plantilla:', err);
      toast.error('Error al crear la plantilla');
      return null;
    }
  };

  // Actualizar una plantilla existente
  const updateTemplate = async (id: string, templateData: MessageTemplateInput) => {
    if (!user) {
      toast.error('Debes iniciar sesión para actualizar plantillas');
      return false;
    }

    try {
      const updatedTemplate: MessageTemplate = {
        id,
        ...templateData,
        created_at: templates.find(t => t.id === id)?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // En una implementación real, aquí se actualizaría en Supabase
      // Por ahora, solo actualizamos el estado local
      
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ));
      
      toast.success('Plantilla actualizada exitosamente');

      // Ejemplo de cómo sería con Supabase:
      /*
      const { error } = await supabase
        .from('message_templates')
        .update({
          ...templateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(prev => prev.map(template => 
        template.id === id ? { ...template, ...templateData, updated_at: new Date().toISOString() } : template
      ));
      */

      return true;
    } catch (err) {
      console.error('Error al actualizar plantilla:', err);
      toast.error('Error al actualizar la plantilla');
      return false;
    }
  };

  // Eliminar una plantilla
  const deleteTemplate = async (id: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para eliminar plantillas');
      return false;
    }

    try {
      // En una implementación real, aquí se eliminaría de Supabase
      // Por ahora, solo actualizamos el estado local
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Plantilla eliminada exitosamente');

      // Ejemplo de cómo sería con Supabase:
      /*
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      */

      return true;
    } catch (err) {
      console.error('Error al eliminar plantilla:', err);
      toast.error('Error al eliminar la plantilla');
      return false;
    }
  };

  // Obtener plantillas por categoría
  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category);
  };

  // Buscar plantillas
  const searchTemplates = (searchTerm: string) => {
    return templates.filter(template => 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    searchTemplates
  };
}
