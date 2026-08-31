export function getLanguageImage(language: string | null): string {
  if (!language) return '/icons/github.png';
  const normalized = language.trim();
  const langImages: Record<string, string> = {
    'TypeScript': '/icons/typescript.png',
    'JavaScript': '/icons/javascript.png',
    'Python': '/icons/python.png',
    'Java': '/icons/java.png',
    'C++': '/icons/cpp.png',
    'C': '/icons/c.png',
    'C#': '/icons/csharp.png',
    'Rust': '/icons/rust.png',
    'Ruby': '/icons/ruby.png',
    'PHP': '/icons/php.png',
    'Shell': '/icons/bash.png',
    'Assembly': '/icons/assembly.png',
  };
  return langImages[normalized] ?? '/icons/github.png';
}
