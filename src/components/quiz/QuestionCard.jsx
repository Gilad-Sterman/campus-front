import { useState, useEffect } from 'react';

const QuestionCard = ({
  questionId,
  question,
  currentAnswer,
  onAnswerSelect,
  isLoading,
  answers = []
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(currentAnswer ?? null);

  useEffect(() => {
    setSelectedAnswer(currentAnswer ?? null);
  }, [currentAnswer, questionId]);

  const handleAnswerClick = (answerValue) => {
    setSelectedAnswer(answerValue);
    onAnswerSelect(questionId, answerValue);
  };

  const answerOptions = question?.config?.options
    ? question.config.options
    : question?.config?.labels
      ? question.config.labels.map((label, index) => ({
        value: (question.config.min !== undefined ? question.config.min : 1) + index,
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
            {question.config?.steps && (
              <div className="statement-steps">
                {question.config.steps.map((step, index) => (
                  <div key={index} className="statement-step">
                    <span className="step-icon"><img src={question.config.icons[index]} alt="step" /></span>
                    <span className="step-text">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'text_field':
        if (question.config?.multiline) {
          return (
            <textarea
              className="question-text-area"
              value={selectedAnswer || ''}
              onChange={(e) => handleAnswerClick(e.target.value)}
              placeholder={question.config?.placeholder || 'Type your answer'}
              maxLength={question.config?.maxLength || 1000}
              disabled={isLoading}
              rows={4}
            />
          );
        }
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
                <label
                  key={option.value}
                  className={`multi-select-option ${isChecked ? 'selected' : ''} ${(isLoading || isMaxed) ? 'disabled' : ''}`}
                >

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
                      {renderValue(value)}

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

      case 'single_select':
      case 'likert':
      default:
        return (
          <>
            <div className="answer-options">
              {answerOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`answer-option ${selectedAnswer === option.value ? 'selected' : ''}`}
                  onClick={() => handleAnswerClick(option.value)}
                  disabled={isLoading}
                >
                  {!question?.config?.options && renderValue(option.value)}

                  {option?.icons && <div className="answer-icons">
                    {(option.icons || []).map((icon, index) => (
                      <span key={index} className="answer-icon">{icon}</span>
                    ))}
                  </div>}
                  <span className="answer-label">{option.label}</span>
                </button>
              ))}
            </div>
            {question?.config?.allowCustom && (
              <div className="custom-answer-container">
                <label className="custom-answer-label">Or write you own:</label>
                <input
                  type="text"
                  className="question-text-input custom-input"
                  value={(!answerOptions.some(opt => opt.value === selectedAnswer) && selectedAnswer) || ''}
                  onChange={(e) => handleAnswerClick(e.target.value)}
                  placeholder="Write your answer"
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        );

    }
  };

  const getEmoji = (value, scaleType) => {
    if (scaleType === '0-4') {
      const emojiMap = {
        0: '😖',
        1: '☹️',
        2: '😑',
        3: '😊',
        4: '🤩'
      };
      return emojiMap[value] || value;
    }

    if (scaleType === '0-2') {
      const emojiMap = {
        0: '🫥',
        1: '🤔',
        2: '😍'
      };
      return emojiMap[value] || value;
    }

    return value;
  };

  const getStatmentIcons = (statementType) => {
    console.log(statementType);
    if (statementType === 'EXPLORE_WORK') {
      return [
        '🎯',
        '🧠',
        '💡',
      ];
    }
    return [];
  }

  const renderValue = (value) => {
    const min = question?.config?.min;
    const max = question?.config?.max;

    if (min === 0 && max === 4) {
      return <span className="answer-value emoji-value">{getEmoji(value, '0-4')}</span>;
    }

    if (min === 0 && max === 2) {
      return <span className="answer-value emoji-value">{getEmoji(value, '0-2')}</span>;
    }

    return <span className="answer-value">{value}</span>;
  };



  const renderTitle = () => {
    const studentName = answers.find(a => a.questionId === 1)?.answer || '';
    
    let title = question?.title || 'Question';
    let preTitle = question?.preTitle;

    if (studentName) {
      title = title.replace('{name}', studentName);
      if (preTitle) preTitle = preTitle.replace('{name}', studentName);
    }

    if (preTitle) {
      return (
        <h2 className="question-title pre-title-split">
          <span className="question-pre-title">{preTitle}</span>
          <span className="question-main">{title}</span>
        </h2>
      );
    }

    // Pattern 1: Splitting recurring part in quotes (V3 RIASEC/Openness)
    const quoteMatch = title.match(/^("(.*?)")\s*(.*)$/);
    if (quoteMatch) {
      return (
        <h2 className="question-title split-title">
          <span className="question-recurring">{quoteMatch[1]}</span>
          <span className="question-dynamic">{quoteMatch[3]}</span>
        </h2>
      );
    }

    // Pattern 2: Splitting question and instruction by '?' (e.g. V3 Values)
    if (title.includes('?')) {
      const parts = title.split('?');
      if (parts[1]?.trim()) {
        return (
          <h2 className="question-title instruction-split">
            <span className="question-main">{parts[0]}?</span>
            <span className="question-instruction">{parts[1].trim()}</span>
          </h2>
        );
      }
    }

    return <h2 className="question-title">{title}</h2>;
  };


  return (
    <div className={`question-card question-type-${question?.type || 'default'}`}>
      <div className="question-header">
        {renderTitle()}
        {question?.description && (
          <p className="question-description">{question.description}</p>
        )}
      </div>

      {renderInput()}

    </div>
  );
};

export default QuestionCard;
