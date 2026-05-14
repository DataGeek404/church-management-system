import io from 'socket.io-client';

class WebSocketClient {
  private socket: any = null;
  private url: string = 'http://localhost:3001';

  connect() {
    if (this.socket) return this.socket;

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      namespace: '/api',
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Events API
  listEvents(limit: number = 100) {
    return new Promise((resolve, reject) => {
      this.socket.emit('events:list', { limit }, (response: any) => {
        resolve(response);
      });
      this.socket.once('events:list:response', resolve);
      this.socket.once('error', reject);
    });
  }

  createEvent(eventData: any) {
    return new Promise((resolve, reject) => {
      this.socket.emit('events:create', eventData);
      this.socket.once('events:created', resolve);
      this.socket.once('error', reject);
    });
  }

  getEvent(id: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('events:get', { id });
      this.socket.once('events:get:response', resolve);
      this.socket.once('error', reject);
    });
  }

  updateEvent(id: string, updateData: any) {
    return new Promise((resolve, reject) => {
      this.socket.emit('events:update', { id, ...updateData });
      this.socket.once('events:updated', resolve);
      this.socket.once('error', reject);
    });
  }

  deleteEvent(id: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('events:delete', { id });
      this.socket.once('events:deleted', resolve);
      this.socket.once('error', reject);
    });
  }

  // Members API
  listMembers(status?: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('members:list', { status });
      this.socket.once('members:list:response', resolve);
      this.socket.once('error', reject);
    });
  }

  createMember(memberData: any) {
    return new Promise((resolve, reject) => {
      this.socket.emit('members:create', memberData);
      this.socket.once('members:created', resolve);
      this.socket.once('error', reject);
    });
  }

  getMember(id: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('members:get', { id });
      this.socket.once('members:get:response', resolve);
      this.socket.once('error', reject);
    });
  }

  updateMember(id: string, updateData: any) {
    return new Promise((resolve, reject) => {
      this.socket.emit('members:update', { id, ...updateData });
      this.socket.once('members:update:response', resolve);
      this.socket.once('error', reject);
    });
  }

  deleteMember(id: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('members:delete', { id });
      this.socket.once('members:delete:response', resolve);
      this.socket.once('error', reject);
    });
  }

  getMembersStats() {
    return new Promise((resolve, reject) => {
      this.socket.emit('members:stats');
      this.socket.once('members:stats:response', resolve);
      this.socket.once('error', reject);
    });
  }

  // Attendance API
  getAttendanceRecords(limit: number = 10) {
    return new Promise((resolve, reject) => {
      this.socket.emit('attendance:records', { limit });
      this.socket.once('attendance:records:response', resolve);
      this.socket.once('error', reject);
    });
  }

  getAttendanceStats() {
    return new Promise((resolve, reject) => {
      this.socket.emit('attendance:stats');
      this.socket.once('attendance:stats:response', resolve);
      this.socket.once('error', reject);
    });
  }

  // Financial API
  getAccounts() {
    return new Promise((resolve, reject) => {
      this.socket.emit('financial:accounts');
      this.socket.once('financial:accounts:response', resolve);
      this.socket.once('error', reject);
    });
  }

  getBalance(id?: string) {
    return new Promise((resolve, reject) => {
      this.socket.emit('financial:balance', { id });
      this.socket.once('financial:balance:response', resolve);
      this.socket.once('error', reject);
    });
  }

  getTransactions(limit: number = 10) {
    return new Promise((resolve, reject) => {
      this.socket.emit('financial:transactions', { limit });
      this.socket.once('financial:transactions:response', resolve);
      this.socket.once('error', reject);
    });
  }

  // Reports API
  getReportsSummary() {
    return new Promise((resolve, reject) => {
      this.socket.emit('reports:summary');
      this.socket.once('reports:summary:response', resolve);
      this.socket.once('error', reject);
    });
  }

  getAnalytics(period: string = 'monthly') {
    return new Promise((resolve, reject) => {
      this.socket.emit('reports:analytics', { period });
      this.socket.once('reports:analytics:response', resolve);
      this.socket.once('error', reject);
    });
  }

  // Health check
  healthCheck() {
    return new Promise((resolve, reject) => {
      this.socket.emit('health:check');
      this.socket.once('health:check:response', resolve);
      this.socket.once('error', reject);
    });
  }

  // Logs endpoints
  getRecentLogs(lines: number = 100) {
    return new Promise((resolve, reject) => {
      this.socket.emit('logs:recent', { lines });
      this.socket.once('logs:recent:response', resolve);
      this.socket.once('error', reject);
    });
  }

  getAllLogs() {
    return new Promise((resolve, reject) => {
      this.socket.emit('logs:all', {});
      this.socket.once('logs:all:response', resolve);
      this.socket.once('error', reject);
    });
  }

  getLogStats() {
    return new Promise((resolve, reject) => {
      this.socket.emit('logs:stats', {});
      this.socket.once('logs:stats:response', resolve);
      this.socket.once('error', reject);
    });
  }

  clearLogs() {
    return new Promise((resolve, reject) => {
      this.socket.emit('logs:clear', {});
      this.socket.once('logs:clear:response', resolve);
      this.socket.once('error', reject);
    });
  }

  // Listen for broadcast events
  onEventCreated(callback: (data: any) => void) {
    this.socket.on('events:created', callback);
  }

  onEventUpdated(callback: (data: any) => void) {
    this.socket.on('events:updated', callback);
  }

  onEventDeleted(callback: (data: any) => void) {
    this.socket.on('events:deleted', callback);
  }

  onMemberCreated(callback: (data: any) => void) {
    this.socket.on('members:created', callback);
  }

  onMemberUpdated(callback: (data: any) => void) {
    this.socket.on('members:updated', callback);
  }

  onMemberDeleted(callback: (data: any) => void) {
    this.socket.on('members:deleted', callback);
  }
}

// Singleton instance
const wsClient = new WebSocketClient();

export default wsClient;

