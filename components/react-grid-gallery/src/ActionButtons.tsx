import React from 'react';
import * as styles from './styles';

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
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        aria-label={`Attempt to generate thumbnail for ${fileKey}`}
        style={{ marginRight: '8px' }}
      >
        {isGenerating ? 'Processing...' : '🖼️ Generate'}
      </button>
    </div>
  );
};
