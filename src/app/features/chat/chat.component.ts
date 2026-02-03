import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AssistantService } from '../../core/services/assistant.service';
import { SkillService } from '../../core/services/skill.service';
import {
  Conversation,
  Message,
  StreamingEvent,
  SuggestedAction,
} from '../../core/models/conversation.model';
import { Skill, SkillMatch } from '../../core/models/skill.model';

/**
 * Main chat interface component
 * Provides a Copilot-style chat experience
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-content">
          <h1 class="title">Office Assistant</h1>
          <p class="subtitle">Ask me anything about your work</p>
        </div>
        <div class="header-actions">
          <button
            class="btn btn-outline-secondary btn-sm"
            (click)="startNewConversation()"
            [disabled]="isProcessing"
          >
            <i class="bi bi-plus-lg"></i> New Chat
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-container" #messagesContainer>
        <!-- Welcome message when no conversation -->
        <div *ngIf="!conversation" class="welcome-message">
          <div class="welcome-icon">
            <i class="bi bi-robot"></i>
          </div>
          <h2>Hello! How can I help you today?</h2>
          <p>I can help you with:</p>
          <div class="capabilities-grid">
            <div class="capability-card" (click)="sendQuickMessage('Analyze JIRA')">
              <i class="bi bi-bug"></i>
              <span>Analyze JIRA tickets</span>
            </div>
            <div class="capability-card" (click)="sendQuickMessage('Find person')">
              <i class="bi bi-person-badge"></i>
              <span>Look up people</span>
            </div>
            <div class="capability-card" (click)="sendQuickMessage('Search Confluence')">
              <i class="bi bi-file-text"></i>
              <span>Search documentation</span>
            </div>
            <div class="capability-card" (click)="sendQuickMessage('Check sprint status')">
              <i class="bi bi-kanban"></i>
              <span>Sprint status</span>
            </div>
          </div>
        </div>

        <!-- Messages list -->
        <div *ngIf="conversation" class="messages-list">
          <div
            *ngFor="let message of conversation.messages"
            class="message"
            [class.user-message]="message.role === 'user'"
            [class.assistant-message]="message.role === 'assistant'"
            [class.tool-message]="message.role === 'tool'"
          >
            <!-- Message avatar -->
            <div class="message-avatar">
              <i
                [class.bi-person-circle]="message.role === 'user'"
                [class.bi-robot]="message.role === 'assistant'"
                [class.bi-gear]="message.role === 'tool'"
                class="bi"
              ></i>
            </div>

            <!-- Message content -->
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">
                  {{ message.role === 'user' ? 'You' : message.role === 'assistant' ? 'Assistant' : 'Tool' }}
                </span>
                <span class="message-time">
                  {{ message.timestamp | date: 'shortTime' }}
                </span>
              </div>

              <div class="message-body" [innerHTML]="formatMessage(message.content)"></div>

              <!-- Tool results -->
              <div *ngIf="message.metadata?.toolResults?.length" class="tool-results">
                <div class="tool-results-header" (click)="toggleToolResults(message.id)">
                  <i class="bi bi-tools"></i>
                  <span>{{ message.metadata.toolResults.length }} tool(s) used</span>
                  <i
                    class="bi"
                    [class.bi-chevron-down]="!expandedToolResults.has(message.id)"
                    [class.bi-chevron-up]="expandedToolResults.has(message.id)"
                  ></i>
                </div>
                <div *ngIf="expandedToolResults.has(message.id)" class="tool-results-body">
                  <div
                    *ngFor="let result of message.metadata.toolResults"
                    class="tool-result"
                    [class.success]="result.status === 'success'"
                    [class.error]="result.status === 'error'"
                  >
                    <div class="tool-name">{{ result.toolName }}</div>
                    <div class="tool-duration">{{ result.duration }}ms</div>
                  </div>
                </div>
              </div>

              <!-- Skill execution info -->
              <div *ngIf="message.metadata?.skillExecution" class="skill-execution">
                <div class="skill-badge">
                  <i class="bi bi-lightning"></i>
                  {{ message.metadata.skillExecution.skillName }}
                </div>
                <div class="skill-progress" *ngIf="message.metadata.skillExecution.status === 'running'">
                  <div class="progress">
                    <div
                      class="progress-bar progress-bar-striped progress-bar-animated"
                      [style.width.%]="getSkillProgress(message.metadata.skillExecution)"
                    ></div>
                  </div>
                  <span class="step-info">
                    Step {{ message.metadata.skillExecution.completedSteps }} of
                    {{ message.metadata.skillExecution.totalSteps }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Streaming indicator -->
          <div *ngIf="isProcessing" class="message assistant-message streaming">
            <div class="message-avatar">
              <i class="bi bi-robot"></i>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div *ngIf="streamingContent" class="streaming-content">
                {{ streamingContent }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggested Actions -->
      <div *ngIf="suggestedActions.length > 0" class="suggested-actions">
        <button
          *ngFor="let action of suggestedActions"
          class="action-chip"
          (click)="executeSuggestedAction(action)"
        >
          {{ action.label }}
        </button>
      </div>

      <!-- Skill matches -->
      <div *ngIf="skillMatches.length > 0 && !isProcessing" class="skill-suggestions">
        <div class="skill-suggestions-header">
          <i class="bi bi-lightbulb"></i>
          <span>Suggested skills:</span>
        </div>
        <div class="skill-chips">
          <button
            *ngFor="let match of skillMatches"
            class="skill-chip"
            (click)="useSkill(match)"
            [title]="match.skill.description"
          >
            <span class="skill-name">{{ match.skill.name }}</span>
            <span class="skill-confidence">{{ (match.confidence * 100) | number: '1.0-0' }}%</span>
          </button>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            #inputTextarea
            [(ngModel)]="inputMessage"
            (keydown)="onKeyDown($event)"
            (input)="onInputChange()"
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            [disabled]="isProcessing"
            rows="1"
            class="message-input"
          ></textarea>
          <button
            class="send-button"
            (click)="sendMessage()"
            [disabled]="!inputMessage.trim() || isProcessing"
          >
            <i class="bi" [class.bi-send]="!isProcessing" [class.bi-hourglass-split]="isProcessing"></i>
          </button>
        </div>
        <div class="input-hints">
          <span>Try: "What is JIRA-1234 about?" or "Find Nilesh Mehta"</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .chat-header .title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .chat-header .subtitle {
      font-size: 0.875rem;
      opacity: 0.9;
      margin: 0;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .welcome-message {
      text-align: center;
      padding: 3rem 1rem;
    }

    .welcome-icon {
      font-size: 4rem;
      color: #667eea;
      margin-bottom: 1rem;
    }

    .welcome-message h2 {
      font-size: 1.75rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .welcome-message p {
      color: #666;
      margin-bottom: 2rem;
    }

    .capabilities-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto;
    }

    .capability-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .capability-card:hover {
      border-color: #667eea;
      background: #f8f9ff;
      transform: translateY(-2px);
    }

    .capability-card i {
      font-size: 1.5rem;
      color: #667eea;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .message {
      display: flex;
      gap: 1rem;
      max-width: 85%;
    }

    .user-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e9ecef;
      flex-shrink: 0;
    }

    .user-message .message-avatar {
      background: #667eea;
      color: white;
    }

    .assistant-message .message-avatar {
      background: #28a745;
      color: white;
    }

    .message-content {
      flex: 1;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
    }

    .message-role {
      font-weight: 600;
      color: #333;
    }

    .message-time {
      color: #999;
    }

    .message-body {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: #f8f9fa;
      line-height: 1.5;
    }

    .user-message .message-body {
      background: #667eea;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .assistant-message .message-body {
      border-bottom-left-radius: 4px;
    }

    .tool-results {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .tool-results-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      cursor: pointer;
      padding: 0.25rem;
    }

    .tool-results-header:hover {
      color: #333;
    }

    .tool-results-body {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .tool-result {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .tool-result.success {
      background: #d4edda;
    }

    .tool-result.error {
      background: #f8d7da;
    }

    .skill-execution {
      margin-top: 0.5rem;
    }

    .skill-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: #fff3cd;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #856404;
    }

    .skill-progress {
      margin-top: 0.5rem;
    }

    .skill-progress .progress {
      height: 4px;
      margin-bottom: 0.25rem;
    }

    .step-info {
      font-size: 0.75rem;
      color: #666;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 0.5rem;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .suggested-actions, .skill-suggestions {
      padding: 0.75rem 1.5rem;
      border-top: 1px solid #e9ecef;
    }

    .skill-suggestions-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .skill-chips, .suggested-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .action-chip, .skill-chip {
      padding: 0.5rem 1rem;
      border: 1px solid #e9ecef;
      border-radius: 20px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .action-chip:hover, .skill-chip:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .skill-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .skill-confidence {
      font-size: 0.75rem;
      color: #28a745;
      font-weight: 600;
    }

    .input-container {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 0.5rem;
      transition: border-color 0.2s;
    }

    .input-wrapper:focus-within {
      border-color: #667eea;
    }

    .message-input {
      flex: 1;
      border: none;
      outline: none;
      resize: none;
      font-size: 1rem;
      line-height: 1.5;
      max-height: 150px;
      padding: 0.5rem;
    }

    .send-button {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: #667eea;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .send-button:hover:not(:disabled) {
      background: #5a67d8;
    }

    .send-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .input-hints {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #999;
      text-align: center;
    }
  `],
})
export class ChatComponent implements OnInit, OnDestroy {
  private assistantService = inject(AssistantService);
  private skillService = inject(SkillService);
  private destroy$ = new Subject<void>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputTextarea') inputTextarea!: ElementRef;

  conversation: Conversation | null = null;
  inputMessage = '';
  isProcessing = false;
  streamingContent = '';
  suggestedActions: SuggestedAction[] = [];
  skillMatches: SkillMatch[] = [];
  expandedToolResults = new Set<string>();

  ngOnInit(): void {
    // Subscribe to conversation updates
    this.assistantService.conversation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversation) => {
        this.conversation = conversation;
        this.scrollToBottom();
      });

    // Subscribe to processing state
    this.assistantService.processing$
      .pipe(takeUntil(this.destroy$))
      .subscribe((processing) => {
        this.isProcessing = processing;
      });

    // Subscribe to streaming events
    this.assistantService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.handleStreamingEvent(event);
      });

    // Load available skills
    this.skillService.loadSkills().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    const message = this.inputMessage.trim();
    if (!message || this.isProcessing) return;

    this.inputMessage = '';
    this.skillMatches = [];
    this.suggestedActions = [];

    // Add user message optimistically
    if (this.conversation) {
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: this.conversation.id,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      this.conversation = {
        ...this.conversation,
        messages: [...this.conversation.messages, userMessage],
      };
    }

    this.assistantService.sendMessage(message).subscribe({
      next: (response) => {
        this.suggestedActions = response.suggestedActions || [];
      },
      error: (error) => {
        console.error('Error sending message:', error);
        // Show error in chat
      },
    });
  }

  sendQuickMessage(prompt: string): void {
    this.inputMessage = prompt;
    // Don't send immediately, let user complete the query
    this.inputTextarea?.nativeElement?.focus();
  }

  startNewConversation(): void {
    this.assistantService.clearConversation();
    this.suggestedActions = [];
    this.skillMatches = [];
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInputChange(): void {
    // Auto-resize textarea
    const textarea = this.inputTextarea?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    // Match skills based on input
    if (this.inputMessage.length > 5) {
      this.assistantService.matchSkills(this.inputMessage).subscribe({
        next: (matches) => {
          this.skillMatches = matches.slice(0, 3);
        },
        error: () => {
          this.skillMatches = [];
        },
      });
    } else {
      this.skillMatches = [];
    }
  }

  useSkill(match: SkillMatch): void {
    // Execute the matched skill
    this.assistantService
      .executeSkill(match.skill.id, match.extractedParams)
      .subscribe();
  }

  executeSuggestedAction(action: SuggestedAction): void {
    this.assistantService
      .sendMessage(action.action)
      .subscribe();
  }

  toggleToolResults(messageId: string): void {
    if (this.expandedToolResults.has(messageId)) {
      this.expandedToolResults.delete(messageId);
    } else {
      this.expandedToolResults.add(messageId);
    }
  }

  formatMessage(content: string): string {
    // Basic markdown-like formatting
    // In production, use a proper markdown library
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  getSkillProgress(execution: { completedSteps?: number; totalSteps?: number }): number {
    if (!execution.totalSteps) return 0;
    return ((execution.completedSteps || 0) / execution.totalSteps) * 100;
  }

  private handleStreamingEvent(event: StreamingEvent): void {
    if (event.type === 'message_delta') {
      this.streamingContent += (event.payload as { content: string }).content;
    } else if (event.type === 'message_complete') {
      this.streamingContent = '';
    }
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
