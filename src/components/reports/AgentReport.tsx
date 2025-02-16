import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useClientTracking } from '../../lib/hooks/useClientTracking';
import type { Agent } from '../../lib/types';

interface AgentReportProps {
  agent: Agent;
  onClose: () => void;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export function AgentReport({ agent, onClose }: AgentReportProps) {
  const { metrics, agentPerformance } = useClientTracking();
  
  const agentMetrics = metrics.byAgent.find(m => m.agent_id === agent.id);
  const agentHistory = agentPerformance.filter(p => p.agent_id === agent.id);

  const clientDistribution = [
    { name: '0-30 días', value: agentMetrics?.active_clients || 0 },
    { name: '31-60 días', value: agentMetrics?.inactive_clients || 0 },
    { name: '61-90 días', value: agentMetrics?.at_risk_clients || 0 },
    { name: '+90 días', value: agentMetrics?.lost_clients || 0 },
  ];

  const atRiskPercentage = agentMetrics 
    ? (agentMetrics.inactive_clients / (agentMetrics.active_clients + agentMetrics.inactive_clients)) * 100 
    : 0;

  const isHighRisk = atRiskPercentage > 30;

  const formatWhatsAppNumber = (number: string) => {
    return number.replace(/\D/g, '');
  };

  const openWhatsApp = (number: string) => {
    const formattedNumber = formatWhatsAppNumber(number);
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Gestión de Asesores
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Reporte de Desempeño - {agent.name}
        </h1>
      </div>

      {/* Agent Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random`}
              alt={agent.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
              <p className="text-gray-500">{agent.email}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  agent.status === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : agent.status === 'busy'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.status === 'online' ? 'En línea' : agent.status === 'busy' ? 'Ocupado' : 'Desconectado'}
                </span>
                <span className="mx-2">•</span>
                <span className="text-sm text-gray-500">
                  Última actividad: {format(new Date(agent.lastActive), 'PPp', { locale: es })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => openWhatsApp(agent.whatsappNumber)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contactar por WhatsApp
          </button>
        </div>
      </div>

      {/* ... (resto del código sin cambios) */}
    </div>
  );
}