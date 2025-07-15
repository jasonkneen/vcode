import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, FileText, FilePlus, FileX, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { useChatSnapshotStore, FileSnapshot } from '@/stores/chat-snapshots';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FileChangesProps {
  sessionId: string;
  messageId: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export function FileChanges({ sessionId, messageId, onAcceptAll, onRejectAll }: FileChangesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get the entire snapshots array and memoize the filtered result
  const snapshots = useChatSnapshotStore(state => state.snapshots);
  
  const pendingSnapshots = useMemo(() => {
    const chat = snapshots.find(chat => chat.sessionId === sessionId);
    return chat?.snapshots.filter(
      s => s.messageId === messageId && s.status === 'pending'
    ) || [];
  }, [snapshots, sessionId, messageId]);

  if (pendingSnapshots.length === 0) {
    return null;
  }

  const handleAcceptAll = async () => {
    setIsProcessing(true);
    try {
      await onAcceptAll();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAll = async () => {
    setIsProcessing(true);
    try {
      await onRejectAll();
    } finally {
      setIsProcessing(false);
    }
  };

  const getOperationIcon = (operation: FileSnapshot['operation']) => {
    switch (operation) {
      case 'create':
        return <FilePlus className="h-3 w-3 text-green-600" />;
      case 'update':
        return <FileText className="h-3 w-3 text-blue-600" />;
      case 'delete':
        return <FileX className="h-3 w-3 text-red-600" />;
      default:
        return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  const getOperationText = (operation: FileSnapshot['operation']) => {
    switch (operation) {
      case 'create':
        return 'Created';
      case 'update':
        return 'Modified';
      case 'delete':
        return 'Deleted';
      default:
        return 'Changed';
    }
  };

  const getOperationColor = (operation: FileSnapshot['operation']) => {
    switch (operation) {
      case 'create':
        return 'text-green-700 dark:text-green-300';
      case 'update':
        return 'text-blue-700 dark:text-blue-300';
      case 'delete':
        return 'text-red-700 dark:text-red-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: FileSnapshot['status']) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-3 w-3 text-amber-600" />;
      case 'accepted':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'reverted':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-amber-600" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-amber-600" />
                  )}
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    File Changes ({pendingSnapshots.length})
                  </span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAll}
                disabled={isProcessing}
                className="h-6 px-2 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20 disabled:opacity-50"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {isProcessing ? 'Processing...' : 'Accept All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                disabled={isProcessing}
                className="h-6 px-2 text-xs border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                <XCircle className="h-3 w-3 mr-1" />
                {isProcessing ? 'Processing...' : 'Reject All'}
              </Button>
            </div>
          </div>
          
          <CollapsibleContent className="space-y-1">
            {pendingSnapshots.map((snapshot, index) => (
              <div
                key={`${snapshot.filePath}-${index}`}
                className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getOperationIcon(snapshot.operation)}
                  <span className={`text-xs font-medium ${getOperationColor(snapshot.operation)}`}>
                    {getOperationText(snapshot.operation)}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground truncate">
                    {snapshot.filePath}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getStatusIcon(snapshot.status)}
                  <span>{new Date(snapshot.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Card>
  );
}
