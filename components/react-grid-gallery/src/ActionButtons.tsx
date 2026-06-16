import React from 'react';
import styles from './styles';

type ActionButtonsProps = {
  fileKey: string;
  onGenerateClick: (key: string) => Promise<void>;
};

/**
 * A reusable component for showing action buttons on metadata items.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  fileKey,
  onGenerateClick,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      await onGenerateClick(fileKey);
      // Optional: Show success toast here
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      // Optional: Show error notification
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.actionButtonsContainer}>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        aria-label={`Attempt to generate thumbnail for ${fileKey}`}
        className={`${styles.generateButton} ${isGenerating ? styles.generating : ''}`}
      >
        {isGenerating ? 'Processing...' : '🖼️ Generate'}
      </button>
    </div>
  );
};
