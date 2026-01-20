type Listener = (payload: any) => void;

class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, payload?: any) {
    this.listeners.get(event)?.forEach((l) => {
      try {
        l(payload);
      } catch (e) {
        // swallow listener errors
        // console.error(e);
      }
    });
  }
}

export const eventBus = new EventBus();

export default eventBus;
