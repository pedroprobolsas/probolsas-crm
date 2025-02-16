import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send, Smile, Paperclip, Bot, User2, Phone, Video, MoreVertical, Star, Archive, Bell, BarChart2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useMockData } from '../lib/hooks/useMockData';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { AISuggestions } from '../components/chat/AISuggestions';
import { FileUploader } from '../components/chat/FileUploader';
import { ClientTrackingPanel } from '../components/tracking/ClientTrackingPanel';
import { NewChatModal } from '../components/chat/NewChatModal';
import { toast } from 'sonner';
import type { Conversation, Message, Client } from '../lib/types';

export function Communications() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showTrackingPanel, setShowTrackingPanel] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { conversations, getConversationMessages, aiSuggestions } = useMockData();
  const messages = selectedConversation ? getConversationMessages(selectedConversation.id) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !content.trim()) return;
    
    try {
      // Implement message sending logic here
      toast.success('Mensaje enviado');
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!selectedConversation) return;
    
    try {
      // Implement file upload logic here
      toast.success(`${files.length} archivo(s) subido(s) correctamente`);
      setShowFileUploader(false);
    } catch (error) {
      toast.error('Error al subir los archivos');
    }
  };

  const handleNewChat = async (client: Client) => {
    try {
      // Implement new chat logic here
      toast.success(`Iniciando chat con ${client.name}`);
      setShowNewChatModal(false);
    } catch (error) {
      toast.error('Error al iniciar el chat');
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white flex flex-col border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Mensajes</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                title="Nuevo Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowTrackingPanel(!showTrackingPanel)}
                className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full ${
                  showTrackingPanel ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <Star className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <Archive className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Conversations List or Tracking Panel */}
        {showTrackingPanel ? (
          <div className="flex-1 overflow-y-auto p-4">
            <ClientTrackingPanel />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 hover:bg-gray-50 flex items-start relative ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.client_name || '')}&background=random`}
                  alt={conversation.client_name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-3 flex-1 text-left">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-900">
                      {conversation.client_name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {format(new Date(conversation.last_message_at), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conversation.last_message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conversation.client_company}
                  </p>
                </div>
                {conversation.unread_count > 0 && (
                  <span className="absolute top-4 right-4 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <div className="flex items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.client_name || '')}&background=random`}
                  alt={selectedConversation.client_name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedConversation.client_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.client_company}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#f0f2f5]">
              <AISuggestions
                suggestions={aiSuggestions}
                onSelect={handleSendMessage}
                isLoading={false}
              />
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwn={message.sender === 'agent'}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* File Uploader */}
            {showFileUploader && (
              <FileUploader
                onUpload={handleFileUpload}
                onClose={() => setShowFileUploader(false)}
              />
            )}

            {/* Message Input */}
            <ChatInput
              onSend={handleSendMessage}
              onAttach={() => setShowFileUploader(true)}
              isLoading={false}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Selecciona una conversación para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          onSelectClient={handleNewChat}
        />
      )}
    </div>
  );
}