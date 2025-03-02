import React from 'react';
import { MessageTemplateManager } from '../components/chat/MessageTemplateManager';

export function MessageTemplatesPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Plantillas de Mensajes</h1>
        <p className="mt-2 text-gray-600">
          Administra las plantillas de mensajes predefinidos para comunicaciones con clientes.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <MessageTemplateManager />
      </div>
    </div>
  );
}
