import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, map, tap, throwError } from 'rxjs';
import {
  Conversation,
  Message,
  ChatRequest,
  ChatResponse,
  StreamingEvent,
} from '../models/conversation.model';
import { SkillMatch, SkillExecution } from '../models/skill.model';
import { environment } from '../../../environments/environment';

/**
 * Main orchestration service for the Office Assistant
 * Handles chat interactions, skill execution, and real-time updates
 */
@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // State management
  private currentConversation$ = new BehaviorSubject<Conversation | null>(null);
  private isProcessing$ = new BehaviorSubject<boolean>(false);
  private currentExecution$ = new BehaviorSubject<SkillExecution | null>(null);

  // WebSocket for streaming
  private ws: WebSocket | null = null;
  private streamingEvents$ = new Subject<StreamingEvent>();

  /**
   * Observable streams for components to subscribe
   */
  get conversation$(): Observable<Conversation | null> {
    return this.currentConversation$.asObservable();
  }

  get processing$(): Observable<boolean> {
    return this.isProcessing$.asObservable();
  }

  get execution$(): Observable<SkillExecution | null> {
    return this.currentExecution$.asObservable();
  }

  get events$(): Observable<StreamingEvent> {
    return this.streamingEvents$.asObservable();
  }

  /**
   * Send a message to the assistant
   * This is the main entry point for user interactions
   */
  sendMessage(message: string, conversationId?: string): Observable<ChatResponse> {
    this.isProcessing$.next(true);

    const request: ChatRequest = {
      message,
      conversationId: conversationId || this.currentConversation$.value?.id,
    };

    return this.http.post<ChatResponse>(`${this.apiUrl}/api/v1/chat`, request).pipe(
      tap((response) => {
        this.updateConversation(response);
        this.isProcessing$.next(false);
      }),
      catchError((error) => {
        this.isProcessing$.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Send a message with streaming response
   * Uses WebSocket for real-time updates
   */
  sendMessageStreaming(message: string, conversationId?: string): void {
    this.isProcessing$.next(true);
    this.connectWebSocket();

    const request: ChatRequest = {
      message,
      conversationId: conversationId || this.currentConversation$.value?.id,
    };

    this.ws?.send(JSON.stringify({ type: 'chat', payload: request }));
  }

  /**
   * Execute a specific skill directly
   * Used by custom UI pages like JIRA Analyzer
   */
  executeSkill(
    skillId: string,
    parameters: Record<string, unknown>
  ): Observable<SkillExecution> {
    this.isProcessing$.next(true);

    return this.http
      .post<SkillExecution>(`${this.apiUrl}/api/v1/skills/${skillId}/execute`, {
        parameters,
        conversationId: this.currentConversation$.value?.id,
      })
      .pipe(
        tap((execution) => {
          this.currentExecution$.next(execution);
          this.isProcessing$.next(false);
        }),
        catchError((error) => {
          this.isProcessing$.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Match user input to available skills
   * Returns ranked list of matching skills
   */
  matchSkills(input: string): Observable<SkillMatch[]> {
    return this.http.post<SkillMatch[]>(`${this.apiUrl}/api/v1/skills/match`, {
      input,
    });
  }

  /**
   * Create a new conversation
   */
  createConversation(title?: string): Observable<Conversation> {
    return this.http
      .post<Conversation>(`${this.apiUrl}/api/v1/conversations`, { title })
      .pipe(
        tap((conversation) => {
          this.currentConversation$.next(conversation);
        })
      );
  }

  /**
   * Load an existing conversation
   */
  loadConversation(conversationId: string): Observable<Conversation> {
    return this.http
      .get<Conversation>(`${this.apiUrl}/api/v1/conversations/${conversationId}`)
      .pipe(
        tap((conversation) => {
          this.currentConversation$.next(conversation);
        })
      );
  }

  /**
   * Get conversation history
   */
  getConversations(limit = 20, offset = 0): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/api/v1/conversations`, {
      params: { limit: limit.toString(), offset: offset.toString() },
    });
  }

  /**
   * Clear current conversation
   */
  clearConversation(): void {
    this.currentConversation$.next(null);
    this.currentExecution$.next(null);
  }

  /**
   * Private: Update conversation with new message
   */
  private updateConversation(response: ChatResponse): void {
    const current = this.currentConversation$.value;

    if (current && current.id === response.conversationId) {
      // Add message to existing conversation
      const updated: Conversation = {
        ...current,
        messages: [...current.messages, response.message],
        updatedAt: new Date(),
      };
      this.currentConversation$.next(updated);
    } else {
      // Load the full conversation
      this.loadConversation(response.conversationId).subscribe();
    }
  }

  /**
   * Private: WebSocket connection management
   */
  private connectWebSocket(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = environment.wsUrl || this.apiUrl.replace('http', 'ws');
    this.ws = new WebSocket(`${wsUrl}/ws`);

    this.ws.onmessage = (event) => {
      const data: StreamingEvent = JSON.parse(event.data);
      this.handleStreamingEvent(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isProcessing$.next(false);
    };

    this.ws.onclose = () => {
      this.ws = null;
    };
  }

  /**
   * Private: Handle streaming events from WebSocket
   */
  private handleStreamingEvent(event: StreamingEvent): void {
    this.streamingEvents$.next(event);

    switch (event.type) {
      case 'message_complete':
        this.isProcessing$.next(false);
        this.loadConversation(event.conversationId).subscribe();
        break;

      case 'skill_step':
        // Update execution status
        const execution = this.currentExecution$.value;
        if (execution) {
          // Update step status in execution
          this.currentExecution$.next({
            ...execution,
            // Update would happen here based on event payload
          });
        }
        break;

      case 'error':
        this.isProcessing$.next(false);
        console.error('Streaming error:', event.payload);
        break;
    }
  }

  /**
   * Cleanup on service destroy
   */
  ngOnDestroy(): void {
    this.ws?.close();
  }
}
