interface SmartSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  lang: 'he' | 'en';
}

export const SmartSuggestions = ({ suggestions, onSelect, lang }: SmartSuggestionsProps) => {
  return (
    <div className="bg-popover/95 backdrop-blur shadow-lg rounded-lg p-2 border">
      <p className="text-xs text-muted-foreground mb-2">
        {lang === 'he' ? 'הצעות להשלמה:' : 'Suggestions:'}
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="text-sm px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20
                     text-primary transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}; 