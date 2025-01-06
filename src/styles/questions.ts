export const questionStyles = {
  container: `
    min-height: 100vh
    max-width: 600px
    mx-auto
    px-4
    py-6
    flex
    flex-col
    gap-6
    md:gap-8
    animate-fadeIn
  `,
  
  questionCard: `
    bg-white
    dark:bg-gray-800
    rounded-xl
    shadow-lg
    p-6
    transition-all
    duration-300
    hover:shadow-xl
    focus-within:shadow-xl
    animate-slideUp
  `,

  input: `
    w-full
    mt-3
    p-4
    rounded-lg
    border-2
    border-gray-200
    dark:border-gray-700
    focus:border-primary-500
    dark:focus:border-primary-400
    transition-colors
    duration-200
    resize-none
    min-h-[120px]
  `,

  // נגישות
  srOnly: `
    absolute
    w-1px
    h-1px
    p-0
    -m-1px
    overflow-hidden
    clip
    whitespace-nowrap
    border-0
  `
}; 