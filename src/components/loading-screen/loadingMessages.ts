export type LoadingMessageKind = 'profile' | 'practice';

export interface LoadingMessage {
  kind: LoadingMessageKind;
  text: string;
}

export const LOADING_MESSAGES: LoadingMessage[] = [
  { kind: 'profile', text: 'Java, Spring Boot, distributed systems.' },
  { kind: 'profile', text: 'Game systems and web apps: two ways to think in systems.' },
  { kind: 'profile', text: 'Published game projects have reached 2M+ downloads.' },
  { kind: 'profile', text: 'Open source keeps the learning loop moving.' },
  { kind: 'profile', text: 'Teaching CVs and skills is part of the craft.' },
  { kind: 'profile', text: 'In love and hate with Java.' },
  { kind: 'practice', text: 'Be sure your code has tests.' },
  { kind: 'practice', text: 'Validate input at every trust boundary.' },
  { kind: 'practice', text: 'Keep secrets out of logs.' },
  { kind: 'practice', text: 'Design for rollback before deployment.' },
  { kind: 'practice', text: 'Prefer small, reviewable changes.' },
  { kind: 'practice', text: 'Measure before optimizing.' },
  { kind: 'practice', text: 'Make failure observable.' },
  { kind: 'practice', text: 'Read the error before changing the code.' },
  { kind: 'practice', text: 'Test edge cases, not only the happy path.' },
  { kind: 'practice', text: 'Least privilege by default.' },
  { kind: 'practice', text: 'Automate build and test in CI.' },
];

export function getRandomLoadingMessage(): LoadingMessage {
  const index = Math.floor(Math.random() * LOADING_MESSAGES.length);
  return LOADING_MESSAGES[index] ?? LOADING_MESSAGES[0];
}
