import { useEffect, useCallback } from 'react';

interface UseBeforeUnloadOptions {
  enabled?: boolean;
  message?: string;
  onBeforeUnload?: () => void;
  onUnload?: () => void;
  cleanupUrl?: string; // URL for session cleanup
  sessionId?: string; // Session ID to cleanup
}

/**
 * Custom hook to handle tab/browser close confirmations
 * This hook uses navigator.sendBeacon for reliable cleanup when tabs are closed
 * @param options Configuration options for the hook
 */
export const useBeforeUnload = ({
  enabled = true,
  message = "Are you sure you want to leave this page? Your changes may not be saved.",
  onBeforeUnload,
  onUnload,
  cleanupUrl,
  sessionId
}: UseBeforeUnloadOptions = {}) => {
  
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (!enabled) return;
    
    // Call custom handler if provided
    if (onBeforeUnload) {
      onBeforeUnload();
    }
    
    // Show browser confirmation dialog
    event.preventDefault();
    event.returnValue = message;
    return message;
  }, [enabled, message, onBeforeUnload]);

  const handleUnload = useCallback(() => {
    if (!enabled) return;
    
    // console.log('🔄 handleUnload triggered');
    
    // Call custom handler if provided
    if (onUnload) {
      onUnload();
    }
    
    // Use navigator.sendBeacon for reliable cleanup when tab is closed
    if (cleanupUrl && sessionId) {
      // console.log('🔄 Attempting beacon cleanup for session:', sessionId);
      // console.log('🔄 Cleanup URL:', cleanupUrl);
      
      try {
        // Create cleanup data
        const cleanupData = new FormData();
        cleanupData.append('session_id', sessionId);
        cleanupData.append('source', 'tab_close');
        
        // console.log('🔄 Cleanup data prepared:', {
        //   session_id: sessionId,
        //   source: 'tab_close'
        // });
        
        // Use sendBeacon for reliable delivery during page unload
        const success = navigator.sendBeacon(cleanupUrl, cleanupData);
        
        if (success) {
          // console.log('✅ Session cleanup beacon sent successfully');
        } else {
          // console.warn('⚠️ Session cleanup beacon failed to send');
        }
      } catch (error) {
        // console.error('❌ Error sending cleanup beacon:', error);
      }
    } else {
      // console.log('⚠️ Cannot send beacon - missing cleanupUrl or sessionId:', { cleanupUrl, sessionId });
    }
  }, [enabled, onUnload, cleanupUrl, sessionId]);

  const handlePageHide = useCallback((event: PageTransitionEvent) => {
    if (!enabled) return;
    
    // console.log('📱 handlePageHide triggered, persisted:', event.persisted);
    
    // pagehide event is more reliable than unload in some browsers
    if (event.persisted === false) {
      // Page is not being cached (user is actually leaving)
      // console.log('📱 Page hide detected - attempting cleanup');
      
      if (cleanupUrl && sessionId) {
        // console.log('📱 Attempting beacon cleanup via pagehide for session:', sessionId);
        
        try {
          const cleanupData = new FormData();
          cleanupData.append('session_id', sessionId);
          cleanupData.append('source', 'page_hide');
          
          const success = navigator.sendBeacon(cleanupUrl, cleanupData);
          
          if (success) {
            // console.log('✅ Session cleanup beacon sent via pagehide');
          } else {
            // console.warn('⚠️ Session cleanup beacon failed to send via pagehide');
          }
        } catch (error) {
          //  console.error('❌ Error sending cleanup beacon via pagehide:', error);
        }
      } else {
        // console.log('⚠️ Cannot send beacon via pagehide - missing cleanupUrl or sessionId');
      }
    } else {
      // console.log('📱 Page hide detected but page is being cached (tab switch)');
    }
  }, [enabled, cleanupUrl, sessionId]);

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners - only for tab/browser close, not tab switching
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [enabled, handleBeforeUnload, handleUnload, handlePageHide]);

  // Return functions to manually trigger the handlers
  return {
    triggerBeforeUnload: () => handleBeforeUnload(new Event('beforeunload') as BeforeUnloadEvent),
    triggerUnload: handleUnload
  };
};
