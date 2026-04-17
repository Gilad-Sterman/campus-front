/**
 * Quiz localStorage service for anonymous quiz sessions
 * Handles quiz state persistence in browser
 */

import { getTotalQuestions, QUIZ_QUESTIONS } from '../config/quizQuestions.js';
import { getVisibleQuestionIds, isQuizCompleteForAnswers } from '../config/quizQuestions.js';

const QUIZ_STORAGE_KEY = 'campusIsraelQuiz';

class QuizStorageService {
  /**
   * Initialize or get existing quiz session
   */
  initializeSession() {
    const existing = this.getSession();
    if (existing) {
      return existing;
    }

    const newSession = {
      sessionId: this.generateSessionId(),
      answers: [],
      currentQuestion: 1,
      currentQuestionId: 1,
      totalQuestions: getTotalQuestions(),
      questionPath: [1],
      startedAt: new Date().toISOString(),
      status: 'not_started'
    };

    this.saveSession(newSession);
    return newSession;
  }

  /**
   * Get current quiz session from localStorage
   */
  getSession() {
    try {
      const stored = localStorage.getItem(QUIZ_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading quiz session:', error);
      return null;
    }
  }

  /**
   * Save quiz session to localStorage
   */
  saveSession(sessionData) {
    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({
        ...sessionData,
        updatedAt: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error saving quiz session:', error);
      return false;
    }
  }

  /**
   * Save answer to current session
   */
  saveAnswer(questionId, answer) {
    const session = this.getSession();
    if (!session) {
      throw new Error('No active quiz session');
    }

    // Update answers array
    const answers = [...session.answers];
    const existingIndex = answers.findIndex(a => a.questionId === questionId);
    
    const question = QUIZ_QUESTIONS[questionId - 1];
    const answerData = {
      questionId,
      key: question?.key || null, // Ensure key is always sent
      questionType: this._detectAnswerType(answer),
      answer,
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      answers[existingIndex] = answerData;
    } else {
      answers.push(answerData);
    }

    const totalQuestions = getVisibleQuestionIds(answers).length || getTotalQuestions();
    const isComplete = isQuizCompleteForAnswers(answers);

    const updatedSession = {
      ...session,
      answers,
      totalQuestions,
      status: isComplete ? 'completed' : 'in_progress',
      lastAnsweredAt: new Date().toISOString()
    };

    this.saveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Get answer for specific question
   */
  getAnswer(questionId) {
    const session = this.getSession();
    if (!session) return null;
    
    const answer = session.answers.find(a => a.questionId === questionId);
    return answer ? answer.answer : null;
  }

  /**
   * Check if quiz is completed
   */
  isCompleted() {
    const session = this.getSession();
    return session && session.status === 'completed';
  }

  /**
   * Get quiz progress
   */
  getProgress() {
    const session = this.getSession();
    if (!session) {
      return { current: 0, total: getTotalQuestions(), percentage: 0 };
    }

    const answered = session.answers.length;
    const currentQuestion = session.currentQuestion || 1;
    const total = getVisibleQuestionIds(session.answers || []).length || session.totalQuestions || getTotalQuestions();
    return {
      current: currentQuestion, // Show current question number, not answered count
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
      answeredCount: answered // Keep track of answered questions separately
    };
  }

  /**
   * Clear quiz session (for testing or reset)
   */
  clearSession() {
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing quiz session:', error);
      return false;
    }
  }

  /**
   * Check if user can resume quiz
   */
  canResume() {
    const session = this.getSession();
    return session && session.status === 'in_progress' && session.answers.length > 0;
  }

  /**
   * Get resume information
   */
  getResumeInfo() {
    if (!this.canResume()) return null;

    const session = this.getSession();
    return {
      lastQuestion: session.currentQuestion,
      answeredCount: session.answers.length,
      startedAt: session.startedAt,
      lastAnsweredAt: session.lastAnsweredAt
    };
  }

  /**
   * Generate unique session ID (UUID format for backend compatibility)
   */
  generateSessionId() {
    // Generate a simple UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Export quiz data for transfer to backend
   */
  exportForTransfer() {
    const session = this.getSession();
    if (!session || session.status !== 'completed') {
      throw new Error('Quiz must be completed before transfer');
    }

    return {
      sessionId: session.sessionId,
      answers: session.answers,
      currentQuestion: session.currentQuestion,
      currentQuestionId: session.currentQuestionId || session.currentQuestion,
      questionPath: session.questionPath || [],
      totalQuestions: session.totalQuestions || getTotalQuestions(),
      completedAt: session.lastAnsweredAt,
      startedAt: session.startedAt
    };
  }

  _detectAnswerType(answer) {
    if (Array.isArray(answer)) return 'multi_select';
    if (answer && typeof answer === 'object') return 'structured';
    if (typeof answer === 'number') return 'numeric';
    if (typeof answer === 'string') return 'text';
    return 'unknown';
  }
}

// Singleton instance
const quizStorage = new QuizStorageService();

export default quizStorage;
