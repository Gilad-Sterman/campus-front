import { useState, useEffect } from 'react';

const QuestionCard = ({
  questionId,
  question,
  currentAnswer,
  onAnswerSelect,
  isLoading
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(currentAnswer ?? null);

  useEffect(() => {
    setSelectedAnswer(currentAnswer ?? null);
  }, [currentAnswer, questionId]);

  const handleAnswerClick = (answerValue) => {
    setSelectedAnswer(answerValue);
    onAnswerSelect(questionId, answerValue);
  };

  const answerOptions = question?.config?.labels
    ? question.config.labels.map((label, index) => ({
      value: (question.config.min || 1) + index,
      label
    }))
    : [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' }
    ];

  const renderInput = () => {
    if (!question) return null;

    switch (question.type) {
      case 'statement':
        // No input for statement type, just informational
        return (
          <div className="statement-content">
            {/* Optional: Add specific styling or illustration for statements if needed */}
          </div>
        );

      case 'text_field':
        return (
          <input
            type="text"
            className="question-text-input"
            value={selectedAnswer || ''}
            onChange={(e) => handleAnswerClick(e.target.value)}
            placeholder={question.config?.placeholder || 'Type your answer'}
            maxLength={question.config?.maxLength || 255}
            disabled={isLoading}
          />
        );

      case 'dropdown':
        return (
          <select
            className="question-dropdown"
            value={String(selectedAnswer || '')}
            onChange={(e) => handleAnswerClick(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select an option</option>
            {(question.config?.options || []).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );

      case 'multi_select': {
        const selectedValues = Array.isArray(selectedAnswer) ? selectedAnswer : [];
        const maxSelections = question.config?.maxSelections || Number.MAX_SAFE_INTEGER;

        return (
          <div className="multi-select-options">
            {(question.config?.options || []).map((option) => {
              const isChecked = selectedValues.includes(option.value);
              const isMaxed = !isChecked && selectedValues.length >= maxSelections;

              return (
                <label key={option.value} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isLoading || isMaxed}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((value) => value !== option.value);
                      handleAnswerClick(next);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'currency':
        return (
          <input
            type="number"
            min={question.config?.minAmount || 0}
            max={question.config?.maxAmount || 1000000}
            className="question-number-input"
            value={selectedAnswer || ''}
            onChange={(e) => handleAnswerClick(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={`Amount (${question.config?.currency || 'USD'})`}
            disabled={isLoading}
          />
        );

      case 'date':
        // Check if date has options (dropdown format) or use date picker
        if (question.config?.options) {
          return (
            <select
              className="question-dropdown"
              value={String(selectedAnswer || '')}
              onChange={(e) => handleAnswerClick(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select an option</option>
              {question.config.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="date"
            className="question-date-input"
            value={selectedAnswer || ''}
            min={question.config?.minDate}
            onChange={(e) => handleAnswerClick(e.target.value)}
            disabled={isLoading}
          />
        );

      case 'two_level_dropdown': {
        const level1 = selectedAnswer?.level1 || '';
        const level2 = selectedAnswer?.level2 || '';
        const level1Keys = Object.keys(question.config?.options || {});
        const level2Options = level1 ? (question.config?.options?.[level1] || []) : [];

        return (
          <div className="two-level-dropdown">
            <select
              value={level1}
              onChange={(e) => handleAnswerClick({ level1: e.target.value, level2: '' })}
              disabled={isLoading}
            >
              <option value="">Select {question.config?.level1Label || 'Category'}</option>
              {level1Keys.map((optionKey) => (
                <option key={optionKey} value={optionKey}>{optionKey.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={level2}
              onChange={(e) => handleAnswerClick({ level1, level2: e.target.value })}
              disabled={isLoading || !level1}
            >
              <option value="">Select {question.config?.level2Label || 'Option'}</option>
              {level2Options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        );
      }

      case 'nested_rating': {
        const ratings = selectedAnswer && typeof selectedAnswer === 'object' ? selectedAnswer : {};
        const min = question.config?.min ?? 0;
        const max = question.config?.max ?? 4;
        const scale = Array.from({ length: max - min + 1 }, (_, index) => min + index);

        return (
          <div className="nested-rating-table">
            {(question.config?.items || []).map((item) => (
              <div key={item.id} className="nested-rating-row">
                <div className="nested-rating-label">{item.label}</div>
                <div className="nested-rating-options">
                  {scale.map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={`answer-option ${ratings[item.id] === value ? 'selected' : ''}`}
                      onClick={() => handleAnswerClick({ ...ratings, [item.id]: value })}
                      disabled={isLoading}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'constraint_slider': {
        const current = selectedAnswer && typeof selectedAnswer === 'object' ? selectedAnswer : {};
        const categories = question.config?.categories || [];
        const targetTotal = question.config?.targetTotal || 100;
        const currentTotal = categories.reduce((sum, category) => {
          return sum + Number(current[category.key] || 0);
        }, 0);

        return (
          <div className="constraint-slider">
            {categories.map((category) => (
              <div key={category.key} className="constraint-slider-row">
                <label>{category.label}</label>
                <input
                  type="number"
                  min="0"
                  max={targetTotal}
                  value={current[category.key] ?? 0}
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = Number(e.target.value || 0);
                    handleAnswerClick({ ...current, [category.key]: value });
                  }}
                />
              </div>
            ))}
            <p className={`constraint-slider-total ${currentTotal === targetTotal ? 'valid' : 'invalid'}`}>
              Total: {currentTotal} / {targetTotal}
            </p>
          </div>
        );
      }

      case 'likert':
      default:
        return (
          <div className="answer-options">
            {answerOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`answer-option ${selectedAnswer === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswerClick(option.value)}
                disabled={isLoading}
              >
                <span className="answer-value">{option.value}</span>
                <span className="answer-label">{option.label}</span>
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`question-card question-type-${question?.type || 'default'}`}>
      <div className="question-header">
        <h2 className="question-title">{question?.title || 'Question'}</h2>
        {question?.description && (
          <p className="question-description">{question.description}</p>
        )}
      </div>

      {renderInput()}

    </div>
  );
};

export default QuestionCard;
