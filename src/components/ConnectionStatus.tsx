'use client';

import { Wifi, WifiOff, Clock } from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from '@/types/f1-types';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  lastUpdate: string;
}

export function ConnectionStatus({ status, lastUpdate }: ConnectionStatusProps) {
  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center space-x-4">      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {status === 'connected' || status === 'polling' ? (
          <>
            <Wifi className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              {status === 'polling' ? 'Polling' : 'Connected'}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">
              {status === 'error' ? 'Error' : 'Disconnected'}
            </span>
          </>
        )}
      </div>

      {/* Last Update */}
      <div className="flex items-center space-x-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">
          {formatLastUpdate(lastUpdate)}
        </span>
      </div>      {/* Live indicator */}
      {(status === 'connected' || status === 'polling') && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-500 font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
}
