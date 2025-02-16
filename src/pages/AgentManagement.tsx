import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  BarChart2, 
  MessageSquare, 
  Phone,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  FileText,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAgents } from '../lib/hooks/useAgents';
import { useClientTracking } from '../lib/hooks/useClientTracking';
import { AgentModal } from '../components/AgentModal';
import { AgentReport } from '../components/reports/AgentReport';
import { Toaster, toast } from 'sonner';
import type { Agent } from '../lib/types';

export function AgentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportAgent, setReportAgent] = useState<Agent | null>(null);

  const { agents, isLoading, error, createAgent, updateAgent, deleteAgent, isCreating, isUpdating } = useAgents();
  const { metrics } = useClientTracking();

  const filteredAgents = agents?.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAgent = async (data: Omit<Agent, 'id'>) => {
    try {
      await createAgent(data);
      setShowCreateModal(false);
      toast.success('Asesor creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el asesor');
    }
  };

  const handleUpdateAgent = async (data: Omit<Agent, 'id'>) => {
    if (!selectedAgent) return;
    try {
      await updateAgent({ id: selectedAgent.id, ...data });
      setSelectedAgent(null);
      toast.success('Asesor actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el asesor');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este asesor?')) return;
    try {
      await deleteAgent(id);
      toast.success('Asesor eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el asesor');
    }
  };

  const handleViewReport = (agent: Agent) => {
    setReportAgent(agent);
    setShowReport(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'busy':
        return 'Ocupado';
      default:
        return 'Desconectado';
    }
  };

  const getClientRiskIndicator = (agentId: string) => {
    const agentMetrics = metrics.byAgent.find(m => m.agent_id === agentId);
    if (!agentMetrics) return null;

    return {
      activePercentage: agentMetrics.active_percentage,
      atRiskPercentage: (agentMetrics.inactive_clients / (agentMetrics.active_clients + agentMetrics.inactive_clients)) * 100,
      needsAttention: agentMetrics.active_percentage < 50
    };
  };

  const formatWhatsAppNumber = (number: string) => {
    return number.replace(/\D/g, '');
  };

  const openWhatsApp = (number: string) => {
    const formattedNumber = formatWhatsAppNumber(number);
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  if (showReport && reportAgent) {
    return <AgentReport agent={reportAgent} onClose={() => setShowReport(false)} />;
  }

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Asesores</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Agregar Asesor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar asesores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asesor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seguimiento de Clientes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Cargando asesores...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-red-500 text-center">
                    Error al cargar los asesores: {error.message}
                  </td>
                </tr>
              ) : filteredAgents?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No se encontraron asesores
                  </td>
                </tr>
              ) : (
                filteredAgents?.map((agent) => {
                  const riskIndicator = getClientRiskIndicator(agent.id);
                  return (
                    <tr key={agent.id} className={`hover:bg-gray-50 ${
                      riskIndicator?.needsAttention ? 'bg-red-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}`}
                            alt={agent.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                          {getStatusText(agent.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openWhatsApp(agent.whatsappNumber)}
                          className="flex items-center text-sm text-green-600 hover:text-green-800 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {agent.whatsappNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {agent.role === 'admin' ? 'Administrador' : 'Asesor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {riskIndicator && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Clientes Activos (30d):</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                riskIndicator.activePercentage >= 70 ? 'bg-green-100 text-green-800' :
                                riskIndicator.activePercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {riskIndicator.activePercentage}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Clientes en Riesgo:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                riskIndicator.atRiskPercentage > 30 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {riskIndicator.atRiskPercentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleViewReport(agent)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Ver reporte detallado"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setSelectedAgent(agent)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AgentModal
        isOpen={showCreateModal || selectedAgent !== null}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedAgent(null);
        }}
        onSubmit={selectedAgent ? handleUpdateAgent : handleCreateAgent}
        agent={selectedAgent || undefined}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}