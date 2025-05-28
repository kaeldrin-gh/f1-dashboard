'use client';

import { RaceControlMessage } from '@/types/f1-types';
import { X, Flag, AlertTriangle, Shield, Zap } from 'lucide-react';

interface AlertsProps {
  alerts: RaceControlMessage[];
  onDismiss: (index: number) => void;
}

export function Alerts({ alerts, onDismiss }: AlertsProps) {
  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'Flag': return <Flag className="w-4 h-4" />;
      case 'SafetyCar': return <Shield className="w-4 h-4" />;
      case 'VSC': return <AlertTriangle className="w-4 h-4" />;
      case 'DRS': return <Zap className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (category: string, flag?: string) => {
    if (category === 'Flag') {
      switch (flag) {
        case 'RED': return 'bg-red-600 border-red-500';
        case 'YELLOW': return 'bg-yellow-600 border-yellow-500';
        case 'GREEN': return 'bg-green-600 border-green-500';
        case 'CHEQUERED': return 'bg-gray-600 border-gray-500';
        default: return 'bg-blue-600 border-blue-500';
      }
    }
     
    switch (category) {
      case 'SafetyCar': return 'bg-orange-600 border-orange-500';
      case 'VSC': return 'bg-yellow-600 border-yellow-500';
      case 'DRS': return 'bg-green-600 border-green-500';
      default: return 'bg-gray-600 border-gray-500';
    }
  };
  // Mock alerts for demonstration  // Mock data for development
  const mockAlerts: RaceControlMessage[] = [
    {
      date: new Date().toISOString(),
      category: 'Flag',
      flag: 'YELLOW',
      lap_number: 15,
      message: 'Yellow flag - Sector 2 - Car stopped on track',
      scope: 'Sector',
      sector: 2
    },
    {
      date: new Date(Date.now() - 120000).toISOString(),
      category: 'DRS',
      lap_number: 14,
      message: 'DRS enabled',
      scope: 'Track'
    },
    {
      date: new Date(Date.now() - 300000).toISOString(),
      category: 'SafetyCar',
      lap_number: 12,
      message: 'Safety Car deployed - incident at Turn 3',
      scope: 'Track'
    },
    {
      date: new Date(Date.now() - 600000).toISOString(),
      category: 'Flag',
      flag: 'GREEN',
      lap_number: 10,
      message: 'Green flag - Racing resumed',
      scope: 'Track'
    },
    {
      date: new Date(Date.now() - 900000).toISOString(),
      category: 'VSC',
      lap_number: 8,
      message: 'Virtual Safety Car - Debris on track',
      scope: 'Track'
    }
  ];

  const alertsToShow = (alerts && alerts.length > 0) ? alerts : mockAlerts;

  return (
    <div className="space-y-3">
      {alertsToShow.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div>No active alerts</div>
        </div>
      ) : (
        alertsToShow.slice(0, 5).map((alert: RaceControlMessage, index: number) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.category, alert.flag)} bg-opacity-20 relative`}
          >
            <button
              onClick={() => onDismiss(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start space-x-3 pr-6">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {alert.category}
                    {alert.flag && ` - ${alert.flag}`}
                  </span>
                  {alert.lap_number && (
                    <span className="text-xs text-gray-300 bg-gray-700 px-2 py-0.5 rounded">
                      Lap {alert.lap_number}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-200 break-words">
                  {alert.message}
                </p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                  {alert.scope && (
                    <span>Scope: {alert.scope}</span>
                  )}
                  {alert.sector && (
                    <span>Sector {alert.sector}</span>
                  )}
                  {alert.driver_number && (
                    <span>Driver #{alert.driver_number}</span>
                  )}
                  <span>{new Date(alert.date).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Show more button if there are many alerts */}
      {alertsToShow.length > 5 && (
        <button className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors">
          Show {alertsToShow.length - 5} more alerts
        </button>
      )}
    </div>
  );
}
